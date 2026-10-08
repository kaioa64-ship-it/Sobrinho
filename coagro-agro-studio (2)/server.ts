import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '30mb' }));

// Initialize Gemini SDK
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Curated high-resolution agricultural backdrops for automated theme inference
const AGRO_BACKGROUNDS = {
  rustic_barn: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80', // Galpão rústico de fazenda, fardos de feno, desfoque
  pasture_cattle: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1200&q=80', // Rebanho e pasto
  seed_pasture: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80',   // Pastagem pura e densa
  crop_field: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',     // Lavoura de grãos viçosa
  fertile_soil: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=80',   // Solo fértil e mudas
  corn_field: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=1200&q=80',     // Lavoura de milho
};

// Formatação estrita de preço BRL: sempre com vírgula e centavos (,00 para inteiros ou ,XX para quebrados)
function formatBrlValue(rawInput?: string | number | null): string {
  if (rawInput === undefined || rawInput === null) return '';
  const str = String(rawInput).trim();
  if (!str) return '';

  let cleaned = str.replace(/r\$\s*/gi, '').trim();
  if (!cleaned) return '';

  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  let integerPart = '';
  let decimalPart = '';

  if (hasComma && hasDot) {
    const lastCommaIdx = cleaned.lastIndexOf(',');
    const lastDotIdx = cleaned.lastIndexOf('.');

    if (lastCommaIdx > lastDotIdx) {
      integerPart = cleaned.slice(0, lastCommaIdx).replace(/\D/g, '');
      decimalPart = cleaned.slice(lastCommaIdx + 1).replace(/\D/g, '');
    } else {
      integerPart = cleaned.slice(0, lastDotIdx).replace(/\D/g, '');
      decimalPart = cleaned.slice(lastDotIdx + 1).replace(/\D/g, '');
    }
  } else if (hasComma) {
    const parts = cleaned.split(',');
    integerPart = parts[0].replace(/\D/g, '');
    decimalPart = parts.slice(1).join('').replace(/\D/g, '');
  } else if (hasDot) {
    const parts = cleaned.split('.');
    if (parts.length === 2 && parts[1].length <= 2) {
      integerPart = parts[0].replace(/\D/g, '');
      decimalPart = parts[1].replace(/\D/g, '');
    } else {
      integerPart = cleaned.replace(/\D/g, '');
      decimalPart = '';
    }
  } else {
    integerPart = cleaned.replace(/\D/g, '');
    decimalPart = '';
  }

  if (!integerPart && !decimalPart) return '';
  if (!integerPart) integerPart = '0';

  if (!decimalPart) {
    decimalPart = '00';
  } else if (decimalPart.length === 1) {
    decimalPart = decimalPart + '0';
  } else {
    decimalPart = decimalPart.slice(0, 2);
  }

  const formattedInteger = Number(integerPart).toLocaleString('pt-BR');
  return `${formattedInteger},${decimalPart}`;
}

function formatBrlWithSymbol(rawInput?: string | number | null): string {
  const formatted = formatBrlValue(rawInput);
  if (!formatted) return '';
  return `R$ ${formatted}`;
}

export interface ExtractedPriceInfo {
  hasPrice: boolean;
  valorDe?: string;
  valorPor?: string;
  condicoes?: string;
}

function parsePriceToFloat(priceStr?: string | null): number {
  if (!priceStr || typeof priceStr !== 'string') return 0;
  const clean = priceStr
    .replace(/r\$\s*/gi, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.]/g, '');
  return parseFloat(clean) || 0;
}

function normalizeAgroPrice(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return '';
  const str = raw.trim().replace(/^r\$\s*/i, '').trim();
  if (!str) return '';

  // 1. Caso possua vírgula: mantém o valor exato
  if (str.includes(',')) {
    const parts = str.split(',');
    const intDigits = parts[0].replace(/\D/g, '');
    let decDigits = parts[1].replace(/\D/g, '');

    if (decDigits.length === 0) decDigits = '00';
    else if (decDigits.length === 1) decDigits = decDigits + '0';
    else decDigits = decDigits.slice(0, 2);

    const intNum = Number(intDigits || 0);
    const formattedInt = intNum.toLocaleString('pt-BR');
    return `${formattedInt},${decDigits}`;
  }

  // 2. Caso possua ponto: separador decimal americano (ex: 3190.50) ou milhar (ex: 3.890)
  if (str.includes('.')) {
    const parts = str.split('.');
    if (parts.length === 2 && parts[1].length <= 2 && Number(parts[0]) < 100000) {
      const intDigits = parts[0].replace(/\D/g, '');
      let decDigits = parts[1].replace(/\D/g, '');
      if (decDigits.length === 1) decDigits = decDigits + '0';
      if (decDigits.length === 0) decDigits = '00';

      const formattedInt = Number(intDigits || 0).toLocaleString('pt-BR');
      return `${formattedInt},${decDigits}`;
    }

    const allDigits = str.replace(/\D/g, '');
    if (!allDigits) return '';
    const formattedInt = Number(allDigits).toLocaleString('pt-BR');
    return `${formattedInt},00`;
  }

  // 3. Caso NÃO possua vírgula: considera como 00 no final
  const allDigits = str.replace(/\D/g, '');
  if (!allDigits) return '';
  const formattedInt = Number(allDigits).toLocaleString('pt-BR');
  return `${formattedInt},00`;
}

/**
 * Cria uma máscara de caracteres para substituir tokens técnicos e de modelo por espaços,
 * mantendo o comprimento exato da string para que os índices posicionais permaneçam válidos.
 */
function maskNonPriceSegments(text: string): string {
  let masked = text;

  // 1. Unidades técnicas e grandezas físicas (ex: 2HP, 2 HP, 220V, 30L, 50kg, 16L, 3500rpm, etc.)
  const techRegex = /\b\d+(?:[.,]\d+)?\s*(?:hp|cv|w|kw|v|volts|hz|kg|g|t|ton|l|litros|ml|mm|cm|m|metros|km|pol|polegadas|rpm|bar|psi|doses|un|unidades|peças|bicos|facas|martelos|sacas|sc|ha|hectares|kg\/h|l\/min|km\/h|meses|dias|anos|horas|min)\b/gi;
  masked = masked.replace(techRegex, (match) => ' '.repeat(match.length));

  // 2. Códigos e referências de modelo (ex: TR30, TR-30, XP16, GT50, B4T, PRO20, etc.)
  const modelCodeRegex = /\b[a-z]{1,4}[-_]?\d{1,4}[a-z]?\b/gi;
  masked = masked.replace(modelCodeRegex, (match) => ' '.repeat(match.length));

  // 3. Prefixos explícitos de modelo (ex: modelo 2024, mod 30, ref 15)
  const modelPrefixRegex = /\b(?:modelo|mod|ref|tipo|c[oó]digo|vers[aã]o|s[eé]rie)\s*[:#-]?\s*\d+\b/gi;
  masked = masked.replace(modelPrefixRegex, (match) => ' '.repeat(match.length));

  // 4. Anos de fabricação ou safras (ex: ano 2024, 2023/2024, safra 24)
  const yearRegex = /\b(?:ano|fabrica[cç][aã]o|safra)\s*[:#-]?\s*(?:19|20)\d{2}\b/gi;
  masked = masked.replace(yearRegex, (match) => ' '.repeat(match.length));

  return masked;
}

/**
 * Extrai condições de pagamento (ex: "em até 10x sem juros", "10x de R$ 175", "à vista no pix").
 */
function extractPaymentConditions(text: string): { condicoes?: string; installmentPrice?: number } {
  let condicoes = '';
  let installmentPrice: number | undefined;

  // Parcelamento com valor (ex: "10x de 175", "10x de R$ 175,00", ou "4x R$25")
  const instWithValMatch = text.match(/(?:em\s+)?(?:at[ée]\s+)?(\d+\s*x)(?:\s+de\s+|\s+)(?:r\$)?\s*([\d]+(?:[.,]\d{1,2})?)/i);
  if (instWithValMatch) {
    const times = instWithValMatch[1].toUpperCase().trim();
    const instVal = normalizeAgroPrice(instWithValMatch[2]);
    installmentPrice = parsePriceToFloat(instVal);
    condicoes = `EM ${times} DE R$ ${instVal}`;
    if (/sem\s+juros/i.test(text)) condicoes += ' SEM JUROS';
    return { condicoes, installmentPrice };
  }

  // Parcelamento sem valor explícito (ex: "em até 10x sem juros" ou "em 6x no cartão")
  const instMatch = text.match(/(?:em\s+)?(?:at[ée]\s+)?\d+\s*x(?:\s+sem\s+juros|\s+no\s+cart[ãa]o)?/i);
  if (instMatch) {
    condicoes = instMatch[0].toUpperCase().trim();
    return { condicoes };
  }

  // Condições à vista / pix
  const vistaMatch = text.match(/[aà]\s*vista(?:\s+no\s+dinheiro|\s+no\s+pix|\s+no\s+boleto)?|no\s+pix/i);
  if (vistaMatch) {
    condicoes = vistaMatch[0].toUpperCase().trim();
    return { condicoes };
  }

  return {};
}

interface PriceCandidate {
  raw: string;
  normalizedBrl: string;
  floatValue: number;
  hasComma: boolean;
  startIndex: number;
  endIndex: number;
  semanticRole: 'DE' | 'POR' | 'PARCELA' | 'NEUTRO';
  deScore: number;
  porScore: number;
  isInstallment: boolean;
}

function extractPriceFromText(text?: string | null): ExtractedPriceInfo {
  if (!text || typeof text !== 'string') {
    return { hasPrice: false };
  }

  const cleanText = text.trim();
  if (!cleanText) {
    return { hasPrice: false };
  }

  // 1. Extração de Condições de Pagamento e isolamento do valor de parcelas
  const { condicoes, installmentPrice } = extractPaymentConditions(cleanText);

  // 2. Máscara de grandezas técnicas e modelos para isolar números comerciais reais
  const maskedText = maskNonPriceSegments(cleanText);

  // 3. Varredura semântica de números candidatos no texto mascarado
  const candidateRegex = /(?:r\$\s*)?(\b\d{2,7}(?:[.,]\d{1,2})?\b)/gi;
  let match: RegExpExecArray | null;
  const candidates: PriceCandidate[] = [];

  while ((match = candidateRegex.exec(maskedText)) !== null) {
    const rawMatch = match[1];
    const startIndex = match.index;
    const endIndex = startIndex + match[0].length;

    // Regra estrita de vírgula: se não tem vírgula, trata como inteiro
    const hasComma = rawMatch.includes(',');
    const normalizedBrl = normalizeAgroPrice(rawMatch);
    const floatValue = parsePriceToFloat(normalizedBrl);

    if (floatValue <= 0) continue;

    // Se o valor coincidir exatamente com a parcela (ex: 180 em "10x de 180"), descarta
    if (installmentPrice && Math.abs(floatValue - installmentPrice) < 0.05) {
      continue;
    }

    // Janela semântica ao redor do número: 35 caracteres antes e 25 depois
    const windowBefore = cleanText.slice(Math.max(0, startIndex - 35), startIndex).toLowerCase();
    const windowAfter = cleanText.slice(endIndex, Math.min(cleanText.length, endIndex + 25)).toLowerCase();

    let deScore = 0;
    let porScore = 0;

    // Marcadores Semânticos de Preço Original ("DE"):
    // Forte: "era", "custava", "antes", "de tabela", "tabela", "original"
    if (/\b(?:era|custava|antes|de\s+tabela|tabela|original|pre[çc]o\s+antigo|pre[çc]o\s+normal)\b/.test(windowBefore)) {
      deScore += 15;
    } else if (/\bde\b\s*[:]?\s*(?:r\$)?\s*$/.test(windowBefore)) {
      deScore += 10;
    } else if (/\bde\b/.test(windowBefore)) {
      deScore += 5;
    }

    // Marcadores Semânticos de Preço Promocional ("POR"):
    // Forte: "sai por", "agora", "apenas", "promoção", "promocional", "à vista", "no pix", "pague"
    if (/\b(?:sai\s+por|agora|apenas|promo[çc][ãa]o|promocional|oferta|[aà]\s*vista|no\s+pix|pague\s+apenas|desconto)\b/.test(windowBefore)) {
      porScore += 15;
    } else if (/\bpor\b\s*[:]?\s*(?:r\$)?\s*$/.test(windowBefore)) {
      porScore += 10;
    } else if (/\bpor\b/.test(windowBefore)) {
      porScore += 5;
    }

    // Marcadores no sufixo pós-número (ex: "1575 à vista", "1992 de tabela")
    if (/^[,\s]*(?:[aà]\s*vista|no\s+pix|apenas|promocional)/.test(windowAfter)) {
      porScore += 10;
    }
    if (/^[,\s]*(?:de\s+tabela|original)/.test(windowAfter)) {
      deScore += 10;
    }

    let semanticRole: 'DE' | 'POR' | 'PARCELA' | 'NEUTRO' = 'NEUTRO';
    if (deScore > porScore && deScore >= 5) semanticRole = 'DE';
    else if (porScore > deScore && porScore >= 5) semanticRole = 'POR';

    candidates.push({
      raw: rawMatch,
      normalizedBrl,
      floatValue,
      hasComma,
      startIndex,
      endIndex,
      semanticRole,
      deScore,
      porScore,
      isInstallment: false,
    });
  }

  if (candidates.length === 0) {
    return { hasPrice: false };
  }

  // 4. Resolução Semântica de Papéis ('DE' vs 'POR'):
  // Cenário A: Existem candidatos com papéis semânticos explícitos
  const deCandidate = candidates.find((c) => c.semanticRole === 'DE');
  const porCandidate = candidates.find((c) => c.semanticRole === 'POR');

  if (deCandidate && porCandidate && deCandidate.floatValue !== porCandidate.floatValue) {
    // Validação de coerência comercial:
    // No comércio, o preço original (DE) é superior ao preço promocional (POR).
    // Se o usuário digitou palavras invertidas por engano (ex: "de 1575 por 1992"):
    const isHigherDe = deCandidate.floatValue > porCandidate.floatValue;
    const finalDe = isHigherDe ? deCandidate.normalizedBrl : porCandidate.normalizedBrl;
    const finalPor = isHigherDe ? porCandidate.normalizedBrl : deCandidate.normalizedBrl;

    return {
      hasPrice: true,
      valorDe: finalDe,
      valorPor: finalPor,
      condicoes: condicoes || undefined,
    };
  }

  // Cenário B: Dois candidatos presentes sem marcadores explícitos ou em padrão textual "1992 1575" / "1575 1992"
  if (candidates.length >= 2) {
    const c1 = candidates[0];
    const c2 = candidates[1];

    if (c1.floatValue !== c2.floatValue) {
      // Regra de Coerência Comercial:
      // O maior valor é SEMPRE o preço original ("DE") e o menor é SEMPRE o promocional ("POR")
      // Resolvendo ambiguidades de 'de/por' invertidos e ordem arbitrária na string!
      const higher = c1.floatValue > c2.floatValue ? c1.normalizedBrl : c2.normalizedBrl;
      const lower = c1.floatValue > c2.floatValue ? c2.normalizedBrl : c1.normalizedBrl;

      return {
        hasPrice: true,
        valorDe: higher,
        valorPor: lower,
        condicoes: condicoes || undefined,
      };
    }
  }

  // Cenário C: Apenas um preço comercial identificado
  if (candidates.length >= 1) {
    const single = candidates[0];
    return {
      hasPrice: true,
      valorDe: undefined,
      valorPor: single.normalizedBrl,
      condicoes: condicoes || undefined,
    };
  }

  return { hasPrice: false };
}

function generateOptimizedPhotoPrompt(contextText: string): string {
  const lower = contextText.toLowerCase();

  if (
    lower.includes('pulverizador') ||
    lower.includes('pulverização') ||
    lower.includes('aplicação') ||
    lower.includes('costal') ||
    lower.includes('xp 16') ||
    lower.includes('bico')
  ) {
    return 'Fotografia profissional agrícola em alta resolução, lavoura viçosa de grãos sob iluminação solar suave, folhas sadias em primeiro plano com orvalho, campo verde com profundidade de campo cinematográfica.';
  }

  if (
    lower.includes('forrageira') ||
    lower.includes('ensiladeira') ||
    lower.includes('picadeira') ||
    lower.includes('triturador') ||
    lower.includes('silagem') ||
    lower.includes('moenda') ||
    lower.includes('feno')
  ) {
    return 'Fotografia profissional agrícola em alta resolução, área de manejo e corte de capim forrageiro verde viçoso e denso, iluminação solar límpida com horizonte rural ao fundo, estética de maquinário e produtividade no campo, profundidade de campo cinematográfica.';
  }

  if (
    lower.includes('iver') ||
    lower.includes('gado') ||
    lower.includes('bovino') ||
    lower.includes('nelore') ||
    lower.includes('vacina') ||
    lower.includes('rebanho') ||
    lower.includes('carne') ||
    lower.includes('leite') ||
    lower.includes('sanidade') ||
    lower.includes('aftosa') ||
    lower.includes('clostridiose') ||
    lower.includes('verme') ||
    lower.includes('parasita')
  ) {
    return 'Fotografia cinematográfica de pastagem verdejante sob iluminação solar natural, rebanho de gado Nelore saudável ao fundo em fazenda brasileira, ângulo amplo com céu azul límpido e vegetação viçosa, profundidade de campo suave.';
  }

  if (
    lower.includes('semente') ||
    lower.includes('brachiaria') ||
    lower.includes('brizantha') ||
    lower.includes('pastagem') ||
    lower.includes('forrageira') ||
    lower.includes('capim') ||
    lower.includes('mombaça')
  ) {
    return 'Fotografia em ângulo aberto de pastagem pura e uniforme de capim Brachiaria verdejante, textura vegetal rica e densa, raios de sol suaves iluminando a formação do pasto com horizonte rural límpido.';
  }

  if (
    lower.includes('adubo') ||
    lower.includes('fertilizante') ||
    lower.includes('npk') ||
    lower.includes('solo') ||
    lower.includes('nutrição')
  ) {
    return 'Fotografia macro de solo fértil bem estruturado e rico em matéria orgânica com brotos verdes saudáveis emergindo com vigor, iluminação suave do amanhecer e foco seletivo realista.';
  }

  if (
    lower.includes('milho') ||
    lower.includes('cereal') ||
    lower.includes('espiga')
  ) {
    return 'Fotografia de lavoura de milho em pleno desenvolvimento vegetativo sob sol forte do meio-dia, folhas verdes viçosas, estética de alta produtividade do agronegócio com céu azul límpido.';
  }

  // Padrão: Defensivos, Fungicidas, Herbicidas e Manejo Geral de Lavoura
  return 'Fotografia profissional agrícola em alta resolução, lavoura viçosa de grãos sob a luz matinal límpida, folhas sadias com orvalho matinal em primeiro plano, horizonte amplo do agronegócio brasileiro, iluminação cinematográfica e profundidade de campo suave.';
}

function inferAgroBackground(contextText: string): string {
  const lower = contextText.toLowerCase();

  // 1. Maquinários e Equipamentos: habitat natural galpão rústico de fazenda com feno
  if (
    lower.includes('forrageira') ||
    lower.includes('ensiladeira') ||
    lower.includes('picadeira') ||
    lower.includes('triturador') ||
    lower.includes('galpão') ||
    lower.includes('feno') ||
    lower.includes('máquina') ||
    lower.includes('maquinário') ||
    lower.includes('equipamento') ||
    lower.includes('trator')
  ) {
    return AGRO_BACKGROUNDS.rustic_barn;
  }

  // 2. Pecuária e Sanidade Animal: pasto verde com gado nelore
  if (
    lower.includes('iver') ||
    lower.includes('gado') ||
    lower.includes('bovino') ||
    lower.includes('nelore') ||
    lower.includes('vacina') ||
    lower.includes('rebanho') ||
    lower.includes('carne') ||
    lower.includes('leite') ||
    lower.includes('sanidade') ||
    lower.includes('aftosa') ||
    lower.includes('clostridiose') ||
    lower.includes('verme') ||
    lower.includes('parasita')
  ) {
    return AGRO_BACKGROUNDS.pasture_cattle;
  }

  if (
    lower.includes('semente') ||
    lower.includes('brachiaria') ||
    lower.includes('brizantha') ||
    lower.includes('pastagem') ||
    lower.includes('forrageira') ||
    lower.includes('capim') ||
    lower.includes('mombaça')
  ) {
    return AGRO_BACKGROUNDS.seed_pasture;
  }

  if (
    lower.includes('adubo') ||
    lower.includes('fertilizante') ||
    lower.includes('npk') ||
    lower.includes('solo') ||
    lower.includes('nutrição') ||
    lower.includes('foliar')
  ) {
    return AGRO_BACKGROUNDS.fertile_soil;
  }

  if (lower.includes('milho') || lower.includes('cereal') || lower.includes('espiga')) {
    return AGRO_BACKGROUNDS.corn_field;
  }

  return AGRO_BACKGROUNDS.crop_field;
}

function analyzeAgroDescriptionServer(
  text: string,
  hasTwoPrices: boolean = false,
  hasSinglePrice: boolean = false
) {
  const clean = (text || '').trim();
  const lower = clean.toLowerCase();

  const brands = [
    'Tramontina',
    'Trapp',
    'Jacto',
    'Stihl',
    'Husqvarna',
    'Buffalo',
    'Toyama',
    'Branco',
    'Gerdau',
    'Belgo',
    'Bayer',
    'Syngenta',
    'BASF',
    'Corteva',
    'Ceva',
    'Zoetis',
    'Ourofino',
    'Yara',
    'Mosaic',
    'Dekalb',
    'Pioneer',
    'Matsuda',
    'Biofarma',
    'Champion',
    'Tortuga',
    'Inroda',
    'Baldan',
    'Kuhn',
    'Marchesan',
    'Tatu',
    'Nogueira',
    'Pinheiro',
    'JF',
    'Vence Tudo',
    'Kawashima',
    'Guarany',
  ];

  let brand = '';
  for (const b of brands) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(clean)) {
      brand = b;
      break;
    }
  }

  let model = '';
  const modelMatch = clean.match(/\b([a-zA-Z]{1,4}[-_]?\d{1,4}[a-zA-Z]?)\b/);
  if (modelMatch) {
    const candidate = modelMatch[1].toUpperCase();
    if (!/^\d+(?:HP|CV|W|KW|V|KG|L|X)$/i.test(candidate)) {
      model = candidate;
    }
  }

  // Máquinas, equipamentos, trituradores e itens com ficha técnica ficam comprovadamente melhores em split-vertical!
  // Roteamento de Layout Estrito:
  // - "split-vertical" obrigatoriamente para: Maquinários, roçadeiras, motores, trituradores e equipamentos horizontais.
  // - "hero-central" obrigatoriamente para: Insumos, frascos de vacina, sacarias, galões de defensivos e itens verticais compactos.
  const isSplitMandatory =
    lower.includes('triturador') ||
    lower.includes('forrageira') ||
    lower.includes('ensiladeira') ||
    lower.includes('picadeira') ||
    lower.includes('moenda') ||
    lower.includes('motobomba') ||
    lower.includes('bomba') ||
    lower.includes('gerador') ||
    lower.includes('motor') ||
    lower.includes('roçadeira') ||
    lower.includes('rocadeira') ||
    lower.includes('pulverizador') ||
    lower.includes('motosserra') ||
    lower.includes('maquinário') ||
    lower.includes('maquinario') ||
    lower.includes('máquina') ||
    lower.includes('maquina') ||
    lower.includes('equipamento') ||
    lower.includes('trator') ||
    lower.includes('hp') ||
    lower.includes('watts') ||
    lower.includes('rpm') ||
    lower.includes('saída lateral') ||
    lower.includes('saida lateral');

  const isHeroCentralMandatory =
    lower.includes('insumo') ||
    lower.includes('vacina') ||
    lower.includes('frasco') ||
    lower.includes('sacaria') ||
    lower.includes('saco') ||
    lower.includes('galão') ||
    lower.includes('galao') ||
    lower.includes('defensivo') ||
    lower.includes('herbicida') ||
    lower.includes('inseticida') ||
    lower.includes('fungicida') ||
    lower.includes('semente') ||
    lower.includes('adubo') ||
    lower.includes('fertilizante');

  let recommendedLayout: 'split-vertical' | 'hero-central';
  if (isSplitMandatory && !isHeroCentralMandatory) {
    recommendedLayout = 'split-vertical';
  } else if (isHeroCentralMandatory && !isSplitMandatory) {
    recommendedLayout = 'hero-central';
  } else if (isSplitMandatory) {
    recommendedLayout = 'split-vertical';
  } else {
    recommendedLayout = 'hero-central';
  }

  let baseProduct = '';
  let category = 'Equipamentos';

  if (lower.includes('triturador')) {
    baseProduct = 'Triturador';
    category = 'Equipamentos';
  } else if (lower.includes('forrageira') || lower.includes('ensiladeira')) {
    baseProduct = 'Forrageira & Ensiladeira';
    category = 'Equipamentos';
  } else if (lower.includes('picadeira')) {
    baseProduct = 'Picadeira de Forragem';
    category = 'Equipamentos';
  } else if (lower.includes('pulverizador')) {
    baseProduct = 'Pulverizador Costal';
    category = 'Equipamentos';
  } else if (lower.includes('roçadeira') || lower.includes('rocadeira')) {
    baseProduct = 'Roçadeira';
    category = 'Equipamentos';
  } else if (lower.includes('motobomba') || (lower.includes('bomba') && lower.includes('água'))) {
    baseProduct = 'Motobomba';
    category = 'Equipamentos';
  } else if (lower.includes('arame')) {
    baseProduct = 'Arame Farpado';
    category = 'Pecuária';
  } else if (lower.includes('vacina') || lower.includes('raivavag') || lower.includes('raiva')) {
    baseProduct = 'Vacina Veterinária';
    category = 'Vacinas & Sanidade';
  } else if (lower.includes('adubo') || lower.includes('fertilizante')) {
    baseProduct = 'Fertilizante NPK';
    category = 'Fertilizantes';
  } else if (lower.includes('semente') || lower.includes('capim') || lower.includes('brachiaria')) {
    baseProduct = 'Sementes de Pastagem';
    category = 'Sementes';
  } else if (/nexgard|bravecto|simparic|credeli|antipulga|carrapaticida|vermifugo|vermífugo|antiparasit/i.test(lower)) {
    baseProduct = 'Antiparasitário Pet';
    category = 'Pet - Saúde';
  } else if (/ra[çc][ãa]o|golden|pedigree|premier|whiskas|petisco|bifinho|sach[êe]/i.test(lower)) {
    baseProduct = 'Ração Pet';
    category = 'Pet - Alimentação';
  } else if (/coleira|guia|peitoral|caminha|brinquedo|comedouro|bebedouro|shampoo|areia\s+higi|tapete\s+higi/i.test(lower)) {
    baseProduct = 'Acessório Pet';
    category = 'Pet - Acessórios';
  } else if (/\bc[ãa]es\b|\bc[ãa]o\b|cachorro|\bgatos?\b|felino|canino|\bpet\b/i.test(lower)) {
    baseProduct = 'Produto Pet';
    category = 'Pet - Geral';
  } else if (/mangueira|regador|jardim|vaso|ro[çc]adeira manual|tesoura de poda|cortador de grama/i.test(lower)) {
    baseProduct = 'Casa & Jardim';
    category = 'Casa & Jardim';
  } else {
    const words = clean.split(/\s+/).filter((w) => !/^\d+/.test(w) && !/^r\$/i.test(w));
    baseProduct = words.slice(0, 3).join(' ') || 'Produto';
    category = 'Outros';
  }

  const isPetProduct = category.startsWith('Pet');

  // Subtítulo heurístico por categoria (padrão neutro: NUNCA assumir linguagem de campo para produto desconhecido)
  let subtitle = '';
  if (category === 'Equipamentos') subtitle = 'Alta potência e eficiência no campo';
  if (category === 'Vacinas & Sanidade') subtitle = 'Proteção e saúde para o seu rebanho';
  if (category === 'Pecuária') subtitle = 'Máximo desempenho e nutrição animal';
  if (category === 'Sementes') subtitle = 'Germinação vigorosa e pastagem densa';
  if (category === 'Fertilizantes') subtitle = 'Nutrição de solo para alta produtividade';
  if (category === 'Pet - Saúde') subtitle = 'Proteção contra pulgas e carrapatos';
  if (category === 'Pet - Alimentação') subtitle = 'Nutrição completa para o seu pet';
  if (category === 'Pet - Acessórios') subtitle = 'Conforto e cuidado para o seu pet';
  if (category === 'Pet - Geral') subtitle = 'Cuidado e carinho para o seu pet';
  if (category === 'Casa & Jardim') subtitle = 'Praticidade para sua casa e jardim';

  // Título comercial de impacto pré-acertado (Máximo de 3 palavras em caixa alta)
  let suggestedTitle = 'OFERTA ESPECIAL';
  let suggestedHighlight = 'OFERTA';

  if (hasTwoPrices) {
    if (lower.includes('relâmpago') || lower.includes('relampago')) {
      suggestedTitle = 'OFERTA RELÂMPAGO';
      suggestedHighlight = 'RELÂMPAGO';
    } else if (lower.includes('imperdível') || lower.includes('imperdivel')) {
      suggestedTitle = 'OPORTUNIDADE ESPECIAL';
      suggestedHighlight = 'OPORTUNIDADE';
    } else {
      suggestedTitle = 'OFERTA ESPECIAL';
      suggestedHighlight = 'OFERTA';
    }
  } else if (hasSinglePrice) {
    suggestedTitle = 'OFERTA ESPECIAL';
    suggestedHighlight = 'OFERTA';
  } else {
    suggestedTitle = '';
    suggestedHighlight = '';
  }

  if (isPetProduct && suggestedTitle === 'OFERTA ESPECIAL') {
    suggestedTitle = 'OFERTA PET';
    suggestedHighlight = 'OFERTA';
  }

  return {
    brand,
    model,
    baseProduct,
    category,
    isPetProduct,
    subtitle,
    recommendedLayout,
    suggestedTitle,
    suggestedHighlight,
  };
}

const TONE_MATRIX = `

MATRIZ DE TOM POR CATEGORIA (siga rigorosamente):
- TOM AGRO (máquinas, ferramentas, sementes, fertilizantes, defensivos, arame, motobomba): linguagem de performance e campo. Pode usar: campo, lavoura, produtividade, potência, resultado, durabilidade.
- TOM AGRO-MISTO (vacinas e sanidade de bovinos/equinos, nutrição e sal mineral de rebanho, casa & jardim): linguagem de cuidado técnico e praticidade. Pode usar: rebanho, sanidade, proteção, praticidade. Evite jargão de máquina.
- TOM PET (rações, antiparasitários, vermífugos, coleiras, petiscos, higiene, acessórios, camas): linguagem de carinho, cuidado e bem-estar. PROIBIDO usar: campo, lavoura, produtividade, rural, safra, pasto, propriedade, produtor, rebanho, potência. Use: pet, tutor, cães, gatos, proteção, saúde, bem-estar, cuidado.
- Decida o tom pela IMAGEM e pelo TEXTO do produto, nunca pelo modo do app. Uma loja Agro vende itens pet: um antipulgas continua sendo TOM PET.
- Quando o texto citar o público (cães, gatos, bovinos), reflita isso no subtítulo.
- Nunca invente benefícios que não estejam no texto ou na embalagem; prefira benefícios genéricos verdadeiros da categoria.`;

const OUTPUT_SCHEMA = `

FORMATO DE SAÍDA OBRIGATÓRIO (retorne SOMENTE este JSON, com exatamente estas chaves):
{
  "nome_produto": "string",
  "marca_fabricante": "string ou null",
  "categoria_produto": "string",
  "template_layout": "split-vertical | hero-central",
  "prompt_fundo_ia": "descrição fotográfica do cenário, coerente com o produto",
  "renderizacao_visual": { "porte_visual": "string", "tipo_ancoragem": "chao | flutuante_central", "fator_ocupacao_percentual": 70 },
  "textos_hero": { "titulo": "TÍTULO EM CAIXA ALTA", "palavra_destaque_ouro": "UMA PALAVRA DO TÍTULO", "subtitulo": "string" },
  "diferenciais_tecnicos": ["item 1", "item 2", "item 3"],
  "modulo_preco": { "ativo": true, "valor_de": "", "valor_por": "", "condicao": "" },
  "cta": "string",
  "legenda_instagram": "string"
}`;

const AGRO_SYSTEM_INSTRUCTION = `Você é o motor de dados do "Coagro Agro Studio". Sua função é analisar uma imagem de produto (que pode ser agrícola, veterinário, pet, casa ou jardim) e um texto de entrada do usuário para estruturar um JSON perfeito para renderização de um card publicitário.

ATENÇÃO CRÍTICA AO CONTEXTO (PET vs AGRO):
As lojas Coagro Agro vendem de tudo. Se a imagem ou o texto for de um PRODUTO PET (ex: Nexgard, Bravecto, ração, coleira):
- O tom DEVE ser focado em pets, cuidado e bem-estar.
- NUNCA use palavras como "NO CAMPO", "LAVOURA" ou "PRODUTIVIDADE".
Se for um PRODUTO AGRO/MÁQUINA:
- O tom DEVE ser de alta performance, "no campo", "produtividade".

- NOME DO PRODUTO: Identifique o nome comercial completo. Não repita a marca.
- MARCA / FABRICANTE: Extraia a marca exata (ex: Tramontina, Jacto, MSD Saúde Animal). Se não fornecida, retorne null.
- CATEGORIA DO PRODUTO: "Pecuária", "Equipamentos", "Pet", "Casa & Jardim", "Vacinas & Sanidade", "Fertilizantes", "Sementes", "Ferramentas", "Outros".

1. ANÁLISE DE PREÇO (CRÍTICO):
- Diferencie valores financeiros de especificações técnicas (ex: 2HP, 50kg, 220V NÃO são preços).
- Regra de De/Por: O valor maior é SEMPRE o "valor_de" (tabela). O valor menor é SEMPRE o "valor_por" (promocional).
- Se houver 1 preço: preencha "valor_por" e deixe "valor_de" vazio.

2. ROTEAMENTO DE LAYOUT:
- "split-vertical": Produto alto/volumoso ou muitos diferenciais.
- "hero-central": Produto único centralizado e compacto (frascos, caixas, sementes).

3. COPYWRITING INTELIGENTE E LIMITES:
- titulo_impacto: Título comercial curto e forte em CAIXA ALTA (máx 4 palavras). PODE e DEVE incluir o nome da marca ou do produto para gerar contexto rápido (ex: "OFERTA NEXGARD", "TRITURADOR TR30", "PROTEÇÃO PET", "OFERTA RELÂMPAGO").
- subtitulo: Se o título for genérico (ex: "OFERTA ESPECIAL"), o subtítulo DEVE ser o nome do produto + breve descrição (ex: "Tablete Mastigável Nexgard", "Triturador Tramontina 2HP"). Se o título já tiver o nome, o subtítulo deve focar na aplicação (ex: "Mata pulgas e carrapatos").
- diferenciais_tecnicos: Crie exatamente 3 itens curtos focados no benefício (MÁXIMO DE 5 PALAVRAS POR ITEM).

4. ANÁLISE DE PROPORÇÃO E RENDENRIZAÇÃO VISUAL:
- "renderizacao_visual": "porte_visual" (frasco_minimo, pequeno_horizontal, medio, grande_saco, maquina_pesada), "tipo_ancoragem" (chao ou flutuante_central), "fator_ocupacao_percentual" (30 a 95).`;

const PET_SYSTEM_INSTRUCTION = `Você é o motor de dados do "Coagro Pet Studio". Sua função é analisar uma imagem de um produto do mundo Pet (rações, medicamentos, brinquedos) e um texto de entrada para estruturar um JSON perfeito.

- NOME DO PRODUTO: Não repita a marca no nome do produto.
- MARCA / FABRICANTE: Extraia a marca exata. Se não fornecida explicitamente, retorne \`null\`.
- CATEGORIA DO PRODUTO: "Alimentação", "Medicamentos", "Higiene", "Acessórios", "Brinquedos", "Outros".

1. ANÁLISE DE PREÇO (CRÍTICO):
- O valor maior é SEMPRE o "valor_de". O valor menor é SEMPRE o "valor_por".

2. ROTEAMENTO DE LAYOUT:
- "pet-split-vertical": Sacos grandes de ração, camas, caixas de transporte.
- "pet-central": Frascos, medicamentos, brinquedos.

3. COPYWRITING INTELIGENTE E LIMITES:
- titulo_impacto: CAIXA ALTA, máximo 4 palavras. PODE e DEVE usar o nome do produto ou categoria para gerar foco (ex: "OFERTA NEXGARD", "RAÇÃO GOLDEN", "CUIDADO PET PREMIUM").
- subtitulo: Se o título for genérico, o subtítulo DEVE identificar o produto (ex: "Tablete Mastigável para Cães"). Se o título já for o produto, use o benefício no subtítulo (ex: "Proteção contra pulgas por 30 dias").
- diferenciais_tecnicos: Exatamente 3 itens focados na saúde e conforto do animal (MÁXIMO DE 5 PALAVRAS POR ITEM).

4. ANÁLISE DE PROPORÇÃO E RENDENRIZAÇÃO VISUAL:
- "renderizacao_visual": "porte_visual", "tipo_ancoragem", "fator_ocupacao_percentual".`;

function generateHeuristicAgroContent(params: {
  prompt?: string;
  format?: string;
  priceInfo?: any;
  templateLayout?: string;
}): any {
  const p = (params.prompt || '').toLowerCase();
  const isStory = params.format === 'story';

  const detected = extractPriceFromText(params.prompt);
  const hasPrice =
    Boolean(params.priceInfo?.ativo && params.priceInfo?.valor_por) ||
    detected.hasPrice ||
    p.includes('r$') ||
    p.includes('por') ||
    /\b\d+[,.]\d{2}\b/.test(p) ||
    p.includes('promoção') ||
    p.includes('oferta');

  // Extrai preços e garante regra de valor mais alto vs mais baixo
  let deVal = params.priceInfo?.valor_de || (detected.hasPrice ? detected.valorDe : '') || '';
  let porVal = params.priceInfo?.valor_por || (detected.hasPrice ? detected.valorPor : '') || '';
  let condicoesVal =
    params.priceInfo?.condicoes_pagamento || (detected.hasPrice ? detected.condicoes : '') || '';

  if (deVal && porVal) {
    const fDe = parsePriceToFloat(deVal);
    const fPor = parsePriceToFloat(porVal);
    if (fDe > 0 && fPor > 0 && fPor > fDe) {
      // Inverte caso tenham chegado trocados
      const temp = deVal;
      deVal = porVal;
      porVal = temp;
    }
  }

  const formattedDe = deVal ? formatBrlWithSymbol(deVal) : '';
  const formattedPor = porVal ? formatBrlWithSymbol(porVal) : '';
  const hasTwo = Boolean(deVal && porVal);

  // Analisa inteligentemente o prompt para extrair nome, marca, subtítulo e melhor layout
  const analysis = analyzeAgroDescriptionServer(params.prompt || '', hasTwo, Boolean(porVal));

  const chosenLayout = params.templateLayout || analysis.recommendedLayout;
  const chosenTitle = analysis.suggestedTitle;
  const chosenHighlight = analysis.suggestedHighlight;
  const chosenSubtitle = analysis.subtitle;

  // Benefícios técnicos
  let beneficios: string[] = [];

  if (p.includes('triturador')) {
    beneficios = [
      'Motor 2HP de alta potência',
      'Saída lateral direcionável',
      'Corte e trituração precisa',
    ];
  } else if (p.includes('forrageira') || p.includes('ensiladeira')) {
    beneficios = [
      'Rotor com navalhas temperadas',
      'Bica de saída direcionável',
      'Chassi reforçado antivibração',
    ];
  } else if (p.includes('pulverizador')) {
    beneficios = [
      'Tanque ergonômico reforçado',
      'Pressão constante e uniforme',
      'Maior autonomia por aplicação',
    ];
  } else if (p.includes('vacina')) {
    beneficios = [
      'Imunização preventiva eficaz',
      'Segurança sanitária do rebanho',
      'Suporte técnico veterinário',
    ];
  }

  const backdropPrompt = generateOptimizedPhotoPrompt(
    `${params.prompt || ''} ${chosenTitle} ${chosenSubtitle}`
  );
  const backdropUrl = inferAgroBackground(`${backdropPrompt} ${params.prompt || ''}`);

  return {
    linha: 'AGRO',
    tipo_postagem: hasTwo ? 'promocao' : hasPrice ? 'preco-unico' : 'informativo_novidade',
    template_layout: chosenLayout,
    formato_gerado: isStory ? 'Story' : 'Feed',
    prompt_fundo_ia: backdropPrompt,
    fundo_imagem: backdropPrompt,
    fundo_imagem_url: backdropUrl,
    textos_hero: {
      titulo: chosenTitle,
      palavra_destaque_ouro: chosenHighlight,
      subtitulo: chosenSubtitle,
    },
    diferenciais_tecnicos: beneficios,
    renderizacao_visual: {
      porte_visual: chosenLayout.includes('split') ? 'maquina_pesada' : 'medio',
      tipo_ancoragem: chosenLayout.includes('split') ? 'chao' : 'flutuante_central',
      fator_ocupacao_percentual: chosenLayout.includes('split') ? 90 : 65
    },
    textos_da_arte: {
      titulo_impacto: chosenTitle,
      palavra_destaque: chosenHighlight,
      subtitulo: chosenSubtitle,
      bullets_tecnicos: beneficios,
      cta: hasPrice ? 'GARANTA JÁ O SEU' : 'CONFIRA NA COAGRO',
      modulo_preco: {
        ativo: hasPrice,
        valor_de: formattedDe,
        valor_por: formattedPor,
        condicoes_pagamento: condicoesVal || '',
      },
    },
    legenda_instagram: `Garanta máxima produtividade na sua propriedade com o ${chosenSubtitle}! Condições imperdíveis na Coagro.\n\nFale com nosso time de especialistas ou visite uma de nossas lojas.\n\n#Coagro #AgroNegocio #OfertaAgro #CampoForte`,
  };
}

// Endpoint to generate structured agro content from image and text prompt
app.post('/api/generate-content', async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      prompt,
      format = 'feed',
      templateLayout,
      isManualTemplate = false,
      communicationMode,
      communicationSelection,
      targetFocus,
      priceInfo,
      isNewImage,
      appMode,
    } = req.body;

    // REGRA ESTRITA: Só é possível gerar a imagem depois que o usuário colocar a foto E a descrição!
    if (!imageBase64 || !prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Para gerar a arte, é obrigatório fornecer tanto a foto do produto quanto a descrição.',
      });
    }

    // Extrai inteligentemente preço e condições de pagamento do prompt (com isolamento de unidades e códigos)
    const detectedPrice = extractPriceFromText(prompt);
    let effectivePriceInfo = priceInfo;
    if ((!effectivePriceInfo || !effectivePriceInfo.ativo || !effectivePriceInfo.valor_por) && detectedPrice.hasPrice) {
      effectivePriceInfo = {
        ativo: true,
        valor_de: detectedPrice.valorDe || '',
        valor_por: detectedPrice.valorPor || '',
        condicoes_pagamento: detectedPrice.condicoes || '',
      };
    }

    // Análise prévia inteligente do produto (marca, modelo, subtítulo e layout recomendado)
    const hasTwoPrices = Boolean(effectivePriceInfo?.valor_de && effectivePriceInfo?.valor_por);
    const hasSinglePrice = Boolean(!effectivePriceInfo?.valor_de && effectivePriceInfo?.valor_por);
    const preAnalysis = analyzeAgroDescriptionServer(prompt, hasTwoPrices, hasSinglePrice);

    const parts: any[] = [];
    const requestedFormatName = format === 'story' ? 'Story' : 'Feed';

    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: cleanBase64,
      },
    });

    let instruction = `DIRETRIZ MESTRE DE GERAÇÃO - COAGRO AGRO STUDIO (Formato: "${requestedFormatName}")

O usuário forneceu OBRIGATORIAMENTE duas fontes de dados conjuntas:
1. A FOTO REAL do produto/equipamento/insumo agrícola (imagem enviada).
2. A DESCRIÇÃO textual digitada pelo usuário: "${prompt}".

ETAPA 1: ANÁLISE OBRIGATÓRIA DA DESCRIÇÃO E DA IMAGEM
Você deve analisar minuciosamente o texto e a foto juntos para extrair com precisão.
ATENÇÃO: O usuário pode digitar nomes incorretos ou com erros ortográficos. CORRIJA silenciosamente os erros de digitação com base no seu conhecimento e na imagem. Se houver textos absurdos, ignore-os e foque no produto real.
- NOME DO PRODUTO: Identifique e corrija o nome comercial completo (ex: Triturador TR30, Pulverizador XP 16, Bravecto). Não inclua a marca no nome do produto.
- MARCA / FABRICANTE: Extraia a marca exata do fabricante (ex: Tramontina, Jacto, Bayer, MSD Saúde Animal, Premier Pet). ATENÇÃO: Se não informada, retorne null. Não invente marcas genéricas como 'Pet' ou 'Agro'. Não confunda linha (Golden, Bravecto) com fabricante (Premier Pet, MSD).
- FORNECEDOR / LINHA: Identifique o fornecedor ou divisão se citado no texto ou na embalagem.
- ANÁLISE SEMÂNTICA DE PREÇOS (TRATAMENTO DE AMBIGUIDADES):
  * Regra de vírgula e centavos (OBRIGATÓRIO):
    - Valores SEM VÍRGULA digitados pelo usuário (ex: 1992 ou 1575 ou 3890) devem ser tratados estritamente como INTEIROS com centavos ,00 no final ("1.992,00" e "1.575,00").
    - Valores COM VÍRGULA (ex: 3190,50 ou 45,90) mantêm os centavos exatos informados ("3.190,50" e "45,90").
  * Descrições com múltiplos valores:
    - Descarte totalmente grandezas técnicas (ex: 2HP, 220V, 50HZ, 30L, 50kg, 16 pol, 3500rpm, etc.), modelos (TR30, XP16), anos (2024) e quantidades (2 unidades).
    - Números de parcelas (ex: 10x de 180) devem ser capturados em "condicao" ("EM 10X DE R$ 180,00"), NUNCA como preço principal.
  * Resolução semântica de 'DE' vs 'POR' (mesmo se invertidos no texto):
    - A diferenciação entre "preço de" e "preço por" é feita por contexto semântico:
      - Marcadores de Preço Original ("DE"): palavras como "de", "era", "custava", "antes", "de tabela", "original".
      - Marcadores de Preço Promocional ("POR"): palavras como "por", "sai por", "agora", "apenas", "promoção", "à vista", "no pix".
    - Validação de Coerência Comercial: em qualquer promoção ("de/por"), o preço original ("valor_de") é inerentemente superior ao preço promocional ("valor_por"). Se o usuário tiver escrito "de 1575 por 1992" ou "por 1575 de 1992", o valor mais alto (1.992,00) é SEMPRE o "valor_de" e o valor mais baixo (1.575,00) é SEMPRE o "valor_por".
    - No JSON, preencha "modulo_preco" com:
      "ativo": true,
      "valor_de": "${effectivePriceInfo?.valor_de || ''}",
      "valor_por": "${effectivePriceInfo?.valor_por || ''}",
      "condicao": "${effectivePriceInfo?.condicoes_pagamento || ''}"
    - "tipo_postagem": "promocao"
  * Se existir apenas 1 preço:
    - "modulo_preco": { "ativo": true, "valor_de": "", "valor_por": "${effectivePriceInfo?.valor_por || ''}" }
    - "tipo_postagem": "preco-unico"
  * Se NÃO houver preço no texto ou imagem:
    - "modulo_preco": { "ativo": false, "valor_de": "", "valor_por": "" }
    - "tipo_postagem": "informativo"

ETAPA 2: GERAÇÃO DOS CAMPOS DA ARTE PARA O FORMATO "${requestedFormatName}"
SÓ APÓS A ANÁLISE COMPLETA ACIMA, gere todos os campos de renderização da arte estritamente para este produto identificado:
1. "nome_produto": Nome comercial identificado (ex: "${preAnalysis.baseProduct}").
2. "marca_fabricante": Marca identificada (ex: "${preAnalysis.brand || 'Coagro'}").
3. "titulo" / "titulo_impacto": Título comercial de impacto em CAIXA ALTA (máx. 4 palavras). 
   - SEJA INTELIGENTE: Adapte ao produto! Se a loja for Agro mas a imagem for de produto Pet (ex: Nexgard, Ração), crie um título voltado para Pet (ex: "OFERTA NEXGARD", "CUIDADO ANIMAL", "OFERTA PET").
   - Se for produto agrícola, use termos de campo ("PRODUTIVIDADE", "NO CAMPO").
   - Você DEVE incluir o nome da marca ou do produto aqui se for um produto forte (ex: "OFERTA BRAVECTO").
4. "subtitulo": OBRIGATORIAMENTE UMA LINHA DESCRITIVA DA APLICAÇÃO OU NOME TÉCNICO!
   - Se o "titulo" for muito genérico (ex: "OFERTA ESPECIAL"), o subtítulo DEVE CONTER O NOME DO PRODUTO (ex: "Tablete Mastigável Nexgard").
   - Se o "titulo" já identificou o produto, use uma descrição de benefício (ex: "Ação rápida contra pulgas").
5. "palavra_destaque_ouro" / "palavra_destaque": Palavra exata do título em cor ouro (#ffab00) (ex: "OFERTA", "NEXGARD", "ESPECIAL").
6. "template_layout":
   - "split-vertical": Produto formato alto, volumoso ou lista densa de benefícios.
   - "hero-central": Destaque visual centralizado e compacto (frascos, caixas de medicamento).
7. "bullets_tecnicos" / "diferenciais_tecnicos": Crie EXATAMENTE 3 diferenciais curtos (MÁXIMO DE 5 PALAVRAS CADA ITEM). Não crie frases longas.
8. "cta": Chamada para ação ("GARANTA JÁ", "COMPRE NA COAGRO", "GARANTA O SEU").
9. "modulo_preco": Preenchido com a análise da Etapa 1.
10. "fundo_imagem": Prompt fotográfico realista em português contextualizado ao habitat do produto (ex: galpão rústico para equipamentos; sala ou gramado para pet; lavoura para sementes).
11. "legenda_instagram": Legenda persuasiva (se pet, carinhosa; se agro, técnica).
`;

    if (targetFocus) {
      instruction += `Foco técnico específico: ${targetFocus}. `;
    }

    parts.push({ text: instruction });

    let dynamicSystemInstruction = (appMode === 'PET' ? PET_SYSTEM_INSTRUCTION : AGRO_SYSTEM_INSTRUCTION) + TONE_MATRIX + OUTPUT_SCHEMA;

    if (appMode === 'PET') {
      // Ajuste extra para a diretriz
      instruction = instruction.replace(
        'DIRETRIZ MESTRE DE GERAÇÃO - COAGRO AGRO STUDIO',
        'DIRETRIZ MESTRE DE GERAÇÃO - COAGRO PET STUDIO'
      ).replace(
        'produto agropecuário',
        'produto para PETS'
      );
    }

    let parsed: any;
    try {
      let response: any;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts },
          config: {
            systemInstruction: dynamicSystemInstruction,
            temperature: 0.15,
            responseMimeType: 'application/json',
          },
        });
      } catch (firstErr: any) {
        if (firstErr?.status === 503 || firstErr?.status === 429) {
          console.warn('Initial gemini-3.8-flash attempt failed (503/429), retrying gemini-3.8-flash in 1s...', firstErr);
          await new Promise(resolve => setTimeout(resolve, 1000));
          response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: { parts },
            config: {
              systemInstruction: dynamicSystemInstruction,
              temperature: 0.15,
              responseMimeType: 'application/json',
            },
          });
        } else {
          throw firstErr;
        }
      }

      let rawText = response.text?.trim() || '';
      rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

      try {
        parsed = JSON.parse(rawText);
      } catch (parseError) {
        console.warn('Failed to parse JSON directly, attempting recovery:', rawText);
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          parsed = generateHeuristicAgroContent({ prompt, format, priceInfo: effectivePriceInfo, templateLayout });
        }
      }
    } catch (apiError) {
      console.warn('Upstream Gemini API error or quota limitation, applying intelligent heuristic fallback:', apiError);
      parsed = generateHeuristicAgroContent({ prompt, format, priceInfo: effectivePriceInfo, templateLayout });
    }

    // Strip unwanted noise like "Divisão Agropecuária"
    const stripNoise = (str: string) =>
      typeof str === 'string'
        ? str.replace(/divis[ãa]o\s+agropecu[áa]ria/gi, '').replace(/\s{2,}/g, ' ').trim()
        : str;

    if (parsed.textos_da_arte) {
      parsed.textos_da_arte.titulo_impacto = stripNoise(parsed.textos_da_arte.titulo_impacto || '');
      parsed.textos_da_arte.subtitulo = stripNoise(parsed.textos_da_arte.subtitulo || '');
      if (Array.isArray(parsed.textos_da_arte.bullets_tecnicos)) {
        parsed.textos_da_arte.bullets_tecnicos = parsed.textos_da_arte.bullets_tecnicos.map(stripNoise);
      }
    }
    if (parsed.caixa_titulo) {
      parsed.caixa_titulo.texto = stripNoise(parsed.caixa_titulo.texto || '');
    }
    if (parsed.caixa_subtitulo) {
      parsed.caixa_subtitulo.texto = stripNoise(parsed.caixa_subtitulo.texto || '');
    }
    if (Array.isArray(parsed.beneficios_tecnicos)) {
      parsed.beneficios_tecnicos = parsed.beneficios_tecnicos.map(stripNoise);
    }

    // 1. Context text for fallback analysis
    const fullContext = `${prompt || ''} ${parsed.textos_hero?.titulo || parsed.textos_da_arte?.titulo_impacto || parsed.caixa_titulo?.texto || ''} ${parsed.textos_hero?.subtitulo || parsed.textos_da_arte?.subtitulo || parsed.caixa_subtitulo?.texto || ''} ${parsed.legenda_instagram || parsed.legenda_post || ''}`;

    // 2. Automated photographic prompt generation for 'prompt_fundo_ia' / 'fundo_imagem'
    let photoPrompt = (parsed.prompt_fundo_ia || parsed.fundo_imagem || '').trim();
    if (!photoPrompt || photoPrompt.length < 25 || photoPrompt.startsWith('http')) {
      photoPrompt = generateOptimizedPhotoPrompt(fullContext);
    }

    // 3. Resolve high-resolution agricultural backdrop image corresponding to the prompt
    const inferredBackground = inferAgroBackground(`${photoPrompt} ${fullContext}`);

    // 4. Infer & clean title and golden highlight word
    let rawTitle = (parsed.textos_hero?.titulo || parsed.textos_da_arte?.titulo_impacto || parsed.caixa_titulo?.texto || '').trim();

    // Se o título gerado colocou o nome do produto no título (ex: "TRITURADOR TR30"), substitui pelo título de impacto comercial
    const lowerTitle = rawTitle.toLowerCase();
    const agroWordsRegex = /campo|lavoura|produtividade|rural|safra|pasto/i;
    if (
      !rawTitle ||
      lowerTitle.length > 35 ||
      (preAnalysis.isPetProduct && agroWordsRegex.test(rawTitle))
    ) {
      rawTitle = preAnalysis.suggestedTitle;
    }

    // Regra Estrita: titulo_impacto tem no MÁXIMO 3 palavras em caixa alta
    let titleWords = rawTitle
      .trim()
      .split(/\s+/)
      .map((w: string) => w.replace(/[.,!?:;]/g, '').toUpperCase())
      .filter(Boolean);

    if (titleWords.length > 4) {
      titleWords = titleWords.slice(0, 4);
    }
    const titleText = titleWords.join(' ') || preAnalysis.suggestedTitle;

    let palavraOuro = (
      parsed.textos_hero?.palavra_destaque_ouro ||
      parsed.textos_da_arte?.palavra_destaque ||
      parsed.caixa_titulo?.palavra_ouro ||
      parsed.caixa_titulo?.palavra_ouro_destaque ||
      ''
    ).trim();

    const isWordInTitle = titleWords.some((w: string) => w === palavraOuro.toUpperCase());
    if (!palavraOuro || !isWordInTitle) {
      const highImpactWords = ['OFERTA', 'RELÂMPAGO', 'ESPECIAL', 'EFICIÊNCIA', 'OPORTUNIDADE', 'IMBATÍVEL', 'MÁXIMA', 'BLINDAGEM', 'FORTE', 'PRODUTIVIDADE'];
      const foundPriority = titleWords.find((w: string) => highImpactWords.includes(w));
      palavraOuro = foundPriority || preAnalysis.suggestedHighlight || titleWords[0] || 'OFERTA';
    }

    // 5. Clean subtitle: DEVE SER O NOME DO PRODUTO + MARCA/MODELO
    let rawSub = (parsed.textos_hero?.subtitulo || parsed.textos_da_arte?.subtitulo || parsed.caixa_subtitulo?.texto || '').trim();

    // Se o subtítulo estiver vazio ou for a frase genérica antiga, utiliza o subtítulo rico extraído do produto
    if (
      !rawSub ||
      rawSub.toLowerCase().includes('soluções de alta performance') ||
      rawSub.toLowerCase().includes('solucoes de alta performance') ||
      (preAnalysis.isPetProduct && agroWordsRegex.test(rawSub))
    ) {
      rawSub = preAnalysis.subtitle || rawSub;
    }
    const cleanSubtitulo = rawSub.length > 90 ? rawSub.slice(0, 90).trim() : rawSub;

    // 6. Clean technical benefits / diferenciais (estritamente 3 itens curtos)
    const incomingBenefits = parsed.diferenciais_tecnicos || parsed.textos_da_arte?.bullets_tecnicos || parsed.beneficios_tecnicos;
    let cleanBeneficios: string[] = [];
    if (Array.isArray(incomingBenefits) && incomingBenefits.length > 0) {
      cleanBeneficios = incomingBenefits
        .map((b: any) => String(b).trim())
        .filter(Boolean)
        .slice(0, 3)
        .map((b: string) => {
          const words = b.split(/\s+/).filter(Boolean);
          return words.length > 5 ? words.slice(0, 5).join(' ') : b;
        });
    }


    // 7. Modulo Preco com formatação BRL obrigatória e persistência do modo comercial
    let cleanModuloPreco = {
      ativo: false,
      valor_de: '',
      valor_por: '',
      condicao: '',
      condicoes_pagamento: '',
    };
    const incomingPreco = parsed.modulo_preco || parsed.textos_da_arte?.modulo_preco;
    let rawDe = '';
    let rawPor = '';
    let rawCond = '';

    if (effectivePriceInfo && effectivePriceInfo.ativo && effectivePriceInfo.valor_por) {
      rawDe = effectivePriceInfo.valor_de || '';
      rawPor = effectivePriceInfo.valor_por;
      rawCond = effectivePriceInfo.condicoes_pagamento || '';
    } else if (incomingPreco && incomingPreco.ativo && incomingPreco.valor_por) {
      rawDe = incomingPreco.valor_de || '';
      rawPor = incomingPreco.valor_por;
      rawCond = incomingPreco.condicao || incomingPreco.condicoes_pagamento || '';
    } else if (detectedPrice.hasPrice && detectedPrice.valorPor) {
      rawDe = detectedPrice.valorDe || '';
      rawPor = detectedPrice.valorPor;
      rawCond = detectedPrice.condicoes || '';
    }

    // GARANTIA MESTRE DE PREÇO: Se existirem 2 valores, o maior é SEMPRE "valor_de" e o menor é SEMPRE "valor_por"
    if (rawDe && rawPor) {
      const fDe = parsePriceToFloat(rawDe);
      const fPor = parsePriceToFloat(rawPor);
      if (fDe > 0 && fPor > 0 && fPor > fDe) {
        const tmp = rawDe;
        rawDe = rawPor;
        rawPor = tmp;
      }
    }

    if (rawPor) {
      if (!rawCond && prompt) {
        if (detectedPrice.condicoes) {
          rawCond = detectedPrice.condicoes;
        } else {
          const matchCond = prompt.match(/(em\s+at[ée]\s+\d+\s*x[^\n.,]*|[aà]\s*vista[^\n.,]*|no\s+cart[ãa]o[^\n.,]*)/i);
          if (matchCond) {
            rawCond = matchCond[1].toUpperCase().trim();
          }
        }
      }
    }

    // Determina o Modo Comercial
    let finalCommMode: 'PROMOTION' | 'SINGLE_PRICE' | 'INFORMATIVE';
    let finalTipoPostagem: string;

    if (communicationSelection && communicationSelection !== 'AUTO') {
      if (communicationSelection === 'PROMOTION' || communicationMode === 'PROMOTION') {
        finalCommMode = 'PROMOTION';
        finalTipoPostagem = 'promocao';
      } else if (communicationSelection === 'SINGLE_PRICE' || communicationMode === 'SINGLE_PRICE') {
        finalCommMode = 'SINGLE_PRICE';
        finalTipoPostagem = 'preco-unico';
        rawDe = '';
      } else {
        finalCommMode = 'INFORMATIVE';
        finalTipoPostagem = 'informativo';
        rawDe = '';
        rawPor = '';
      }
    } else {
      if (rawDe && rawPor) {
        finalCommMode = 'PROMOTION';
        finalTipoPostagem = 'promocao';
      } else if (rawPor) {
        finalCommMode = 'SINGLE_PRICE';
        finalTipoPostagem = 'preco-unico';
      } else {
        finalCommMode = 'INFORMATIVE';
        finalTipoPostagem = 'informativo';
      }
    }

    if (finalCommMode !== 'INFORMATIVE' && rawPor) {
      const condLimpa = rawCond ? rawCond.trim() : '';
      cleanModuloPreco = {
        ativo: true,
        valor_de: (finalCommMode === 'PROMOTION' && rawDe) ? formatBrlWithSymbol(rawDe) : '',
        valor_por: formatBrlValue(rawPor),
        condicao: condLimpa,
        condicoes_pagamento: condLimpa,
      };
    } else {
      cleanModuloPreco = {
        ativo: false,
        valor_de: '',
        valor_por: '',
        condicao: '',
        condicoes_pagamento: '',
      };
    }

    // 8. CTA text respeitando o modo comercial e a categoria
    let cleanCta = (parsed.textos_da_arte?.cta || '').trim();
    if (!cleanCta || cleanCta === 'GARANTA JÁ O SEU') {
      if (finalCommMode === 'PROMOTION') cleanCta = 'GARANTA JÁ O SEU';
      else if (finalCommMode === 'SINGLE_PRICE') cleanCta = 'CONSULTE DISPONIBILIDADE';
      else if (fullContext.toLowerCase().includes('vacina') || fullContext.toLowerCase().includes('veterin')) {
        cleanCta = 'FALE COM NOSSA EQUIPE';
      } else {
        cleanCta = 'SAIBA MAIS';
      }
    }

    // 9. Caption
    const cleanLegenda = (parsed.legenda_instagram || parsed.legenda_post || '').trim();

    // 10. Infer Theme and Template Layout
    // SELEÇÃO INTELIGENTE DE LAYOUT:
    // Trituradores, forrageiras, motobombas, equipamentos com specs ficam SEMPRE em 'split-vertical'!
    const validThemes = ['campo-agro', 'verde-coagro', 'azul-coagro', 'clean-branco'];
    const inferredTheme = validThemes.includes(parsed.tema) ? parsed.tema : 'campo-agro';

    const suggestedByAi = parsed.template_layout === 'hero-central' || parsed.template_layout === 'split-vertical' ? parsed.template_layout : null;
    
    // Se o usuário fez seleção manual explícita no painel, respeita; caso contrário, usa a recomendação inteligente da IA/Produto
    let inferredTemplate: string;
    if (isManualTemplate && templateLayout) {
      inferredTemplate = templateLayout;
    } else if (preAnalysis.recommendedLayout === 'split-vertical') {
      // Máquinas e equipamentos são obrigatoriamente split para não sobrepor o subtítulo
      inferredTemplate = 'split-vertical';
    } else {
      inferredTemplate = suggestedByAi || preAnalysis.recommendedLayout || 'hero-central';
    }

    const tipoPostagem = finalTipoPostagem;

    // 11. Final structured render object satisfying exact schema and backward compatibility
    const finalRenderObject = {
      linha: 'AGRO',
      tipo_postagem: tipoPostagem,
      formato_gerado: format === 'story' ? 'Story' : 'Feed',
      formato: format === 'story' ? 'story' : 'feed',
      template_layout: inferredTemplate,
      tema: inferredTheme,
      prompt_fundo_ia: photoPrompt,
      fundo_imagem: photoPrompt,
      fundo_imagem_url: inferredBackground,
      textos_hero: {
        titulo: titleText,
        palavra_destaque_ouro: palavraOuro,
        subtitulo: cleanSubtitulo,
      },
      diferenciais_tecnicos: cleanBeneficios,
      textos_da_arte: {
        titulo_impacto: titleText,
        palavra_destaque: palavraOuro,
        subtitulo: cleanSubtitulo,
        bullets_tecnicos: cleanBeneficios,
        cta: cleanCta,
        modulo_preco: cleanModuloPreco,
      },
      caixa_titulo: {
        texto: titleText,
        palavra_ouro: palavraOuro,
        palavra_ouro_destaque: palavraOuro,
      },
      caixa_subtitulo: {
        texto: cleanSubtitulo,
      },
      beneficios_tecnicos: cleanBeneficios,
      modulo_preco: cleanModuloPreco,
      legenda_instagram: cleanLegenda,
      legenda_post: cleanLegenda,
    };

    return res.json({ success: true, data: finalRenderObject });
  } catch (error: any) {
    console.error('Error generating Agro content:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao processar conteúdo AGRO.',
    });
  }
});

// Endpoint to generate or edit agricultural product/scenery images
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio = '1:1', baseImage, mimeType = 'image/jpeg' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt é obrigatório.' });
    }

    const parts: any[] = [];

    if (baseImage) {
      const cleanBase64 = baseImage.replace(/^data:[^;]+;base64,/, '');
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType || 'image/jpeg',
        },
      });
    }

    parts.push({
      text: `Professional commercial agricultural photography, Brazilian agro farm: ${prompt}. Ultra-realistic, sharp lighting, clean background, 8k resolution.`,
    });

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        },
      });
    } catch (firstErr) {
      console.warn('Fallback to gemini-3.1-flash-lite-image', firstErr);
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        },
      });
    }

    let generatedImageUrl = '';
    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!generatedImageUrl) {
      throw new Error('Nenhuma imagem foi gerada pelo modelo.');
    }

    return res.json({ success: true, imageUrl: generatedImageUrl });
  } catch (error: any) {
    console.error('Error generating image:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao gerar imagem.',
    });
  }
});

// --- ROTA DE REMOÇÃO DE FUNDO VIA HUGGING FACE (RMBG 1.4) ---
// NOTA DE SEGURANÇA: o endpoint GET /api/hf-token foi REMOVIDO porque expunha
// o segredo do servidor (HF_TOKEN/FAL_KEY) ao navegador. A remoção de fundo
// continua 100% server-side via POST /api/remove-bg abaixo.

app.post('/api/remove-bg', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'A imagem em base64 é obrigatória.' });

    // Aceita tanto FAL_KEY (legado) quanto HF_TOKEN
    const apiToken = process.env.HF_TOKEN || process.env.FAL_KEY;
    if (!apiToken) {
      return res.status(500).json({ error: 'Token da API (HF_TOKEN) não configurado no backend.' });
    }

    console.log('Chamando API Hugging Face (RMBG-1.4) para remoção de fundo...');
    
    // Converte o base64 recebido do front para um Buffer binário
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    let response;
    let retries = 5;
    let waitTime = 5000; // 5 segundos

    while (retries > 0) {
      response = await fetch('https://api-inference.huggingface.co/models/briaai/RMBG-1.4', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/octet-stream',
          'x-wait-for-model': 'true'
        },
        body: buffer
      });

      if (response.status === 503) {
        console.log(`Modelo carregando... Aguardando ${waitTime/1000}s. Tentativas restantes: ${retries - 1}`);
        await new Promise(r => setTimeout(r, waitTime));
        retries--;
      } else {
        break; // Sucesso ou outro erro
      }
    }

    if (!response || !response.ok) {
      const text = await response?.text();
      console.error('Hugging Face error:', response?.status, text);
      return res.status(response?.status || 500).json({ error: 'Falha na API do Hugging Face.' });
    }

    const contentType = response.headers.get('content-type') || '';
    let outBase64 = '';

    if (contentType.includes('application/json')) {
      // Retornou JSON (geralmente [{"label":"foreground","mask":"base64..."}])
      const data = await response.json();
      if (Array.isArray(data) && data[0] && data[0].mask) {
        outBase64 = `data:image/png;base64,${data[0].mask}`;
      } else {
        throw new Error('Formato JSON inesperado do Hugging Face: ' + JSON.stringify(data));
      }
    } else {
      // Retornou a imagem binária diretamente
      const arrayBuffer = await response.arrayBuffer();
      const outBuffer = Buffer.from(arrayBuffer);
      outBase64 = `data:image/png;base64,${outBuffer.toString('base64')}`;
    }

    return res.json({ image: outBase64 });
  } catch (error) {
    console.error('Erro no /api/remove-bg:', error);
    res.status(500).json({ error: 'Erro interno ao processar o recorte na Hugging Face.' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Coagro Agro Studio running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
