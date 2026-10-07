/**
 * Parser semântico inteligente para extração de preços e condições de pagamento
 * a partir de comandos e descrições de produtos agrícolas em português.
 *
 * Tratamento robusto de ambiguidades:
 * 1. Ausência de vírgulas: valores sem vírgula são tratados estritamente como inteiros
 *    (ex: 1992 -> 1.992,00 | 1575 -> 1.575,00 | 480 -> 480,00).
 * 2. Presença de vírgula: mantém o valor decimal exato com centavos informados
 *    (ex: 1575,50 -> 1.575,50 | 45,90 -> 45,90).
 * 3. Descrições com múltiplos valores: isola e descarta especificações técnicas
 *    (ex: 2HP, 220V, 30L, 50kg, 16 pol, 3500rpm, TR30, XP16, ano 2024).
 * 4. 'De / Por' invertidos ou na ordem inversa:
 *    A diferenciação de 'preço de' e 'preço por' é realizada por contexto semântico
 *    (palavras-chave como "era", "antes", "de tabela", "por", "apenas", "sai por")
 *    e validada pela regra de coerência comercial (o preço original DE é sempre superior ao POR).
 */

export interface ExtractedPriceInfo {
  hasPrice: boolean;
  valorDe?: string;
  valorPor?: string;
  condicoes?: string;
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

/**
 * Converte qualquer representação de preço BRL em número float para cálculo e ordenação.
 */
export function parsePriceToFloat(priceStr?: string | null): number {
  if (!priceStr || typeof priceStr !== 'string') return 0;
  const clean = priceStr
    .replace(/r\$\s*/gi, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.]/g, '');
  return parseFloat(clean) || 0;
}

/**
 * Normaliza valores de preço seguindo a regra estrita da Coagro:
 * - Sem vírgula: considera como inteiro com ,00 no final (ex: 1992 -> 1.992,00 | 3890 -> 3.890,00 | 39 -> 39,00)
 * - Com vírgula: considera o valor decimal exato (ex: 3190,50 -> 3.190,50 | 45,9 -> 45,90)
 */
export function normalizeAgroPrice(raw?: string | null): string {
  if (!raw || typeof raw !== 'string') return '';
  const str = raw.trim().replace(/^r\$\s*/i, '').trim();
  if (!str) return '';

  // 1. Caso possua vírgula: mantém o valor decimal exato com 2 casas
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

  // 2. Caso possua ponto sem vírgula:
  if (str.includes('.')) {
    const parts = str.split('.');
    // Ponto como decimal americano explícito (ex: 1575.50 ou 45.9)
    if (parts.length === 2 && parts[1].length <= 2 && Number(parts[0]) < 100000) {
      const intDigits = parts[0].replace(/\D/g, '');
      let decDigits = parts[1].replace(/\D/g, '');
      if (decDigits.length === 1) decDigits = decDigits + '0';
      if (decDigits.length === 0) decDigits = '00';

      const formattedInt = Number(intDigits || 0).toLocaleString('pt-BR');
      return `${formattedInt},${decDigits}`;
    }

    // Ponto como milhar em PT-BR (ex: 1.992 ou 3.890) -> tratado como INTEIRO com ,00
    const allDigits = str.replace(/\D/g, '');
    if (!allDigits) return '';
    const formattedInt = Number(allDigits).toLocaleString('pt-BR');
    return `${formattedInt},00`;
  }

  // 3. Caso NÃO possua vírgula nem ponto: tratado estritamente como INTEIRO com ,00
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
  const techRegex = /\b\d+(?:[.,]\d+)?\s*(?:hp|cv|w|kw|v|volts|kg|g|t|ton|l|litros|ml|mm|cm|m|metros|km|pol|polegadas|rpm|bar|psi|doses|un|unidades|peças|bicos|facas|martelos|sacas|sc|ha|hectares|kg\/h|l\/min|km\/h|meses|dias|anos|horas|min)\b/gi;
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

  // Parcelamento com valor (ex: "10x de 175" ou "10x de R$ 175,00")
  const instWithValMatch = text.match(/(?:em\s+)?(\d+\s*x)\s+de\s+(?:r\$)?\s*([\d]+(?:[.,]\d{1,2})?)/i);
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

/**
 * Extrai preços e diferencia semântica entre "preço de" e "preço por".
 */
export function extractPriceFromText(text?: string | null): ExtractedPriceInfo {
  if (!text || typeof text !== 'string') {
    return { hasPrice: false };
  }

  const cleanText = text.trim();
  if (!cleanText) {
    return { hasPrice: false };
  }

  // 1. Extração de Condições de Pagamento e identificação do valor da parcela
  const { condicoes, installmentPrice } = extractPaymentConditions(cleanText);

  // 2. Máscara de grandezas e modelos para isolar números que realmente são preços
  const maskedText = maskNonPriceSegments(cleanText);

  // 3. Varredura semântica de todos os números candidatos no texto mascarado
  // Ignora se estiver imediatamente seguido por % ou OFF%
  const candidateRegex = /(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*(?:[.,]\d{1,2})?|\d{1,7}(?:[.,]\d{1,2})?)(?!\s*%)/gi;
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

    // Se o valor coincidir exatamente com o valor de uma parcela (ex: 180 em "10x de 180"), descarta
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

  // 4. Resolução de Papéis ('DE' vs 'POR'):
  if (candidates.length >= 2) {
    let finalPor = candidates.find((c) => c.semanticRole === 'POR');
    let finalDe = candidates.find((c) => c.semanticRole === 'DE');

    const sorted = [...candidates].sort((a, b) => b.floatValue - a.floatValue);
    
    // Se achou um mas não o outro, tenta parear com o valor mais lógico
    if (!finalDe && finalPor) {
      finalDe = sorted.find((c) => c.floatValue > finalPor!.floatValue);
    }
    if (!finalPor && finalDe) {
      finalPor = sorted.find((c) => c.floatValue < finalDe!.floatValue);
    }

    // Se não achou nenhum dos dois de forma clara, assume os 2 maiores distintos
    if (!finalDe) finalDe = sorted[0];
    if (!finalPor) finalPor = sorted.find((c) => c.floatValue !== finalDe!.floatValue) || sorted[1];

    if (finalDe && finalPor && finalDe.floatValue !== finalPor.floatValue) {
      // Regra de Coerência Comercial:
      // O maior valor é SEMPRE o preço original ("DE") e o menor é SEMPRE o promocional ("POR")
      const isHigherDe = finalDe.floatValue > finalPor.floatValue;
      const higher = isHigherDe ? finalDe.normalizedBrl : finalPor.normalizedBrl;
      const lower = isHigherDe ? finalPor.normalizedBrl : finalDe.normalizedBrl;

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
