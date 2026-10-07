// Dicionário de abreviações comerciais comuns
const COMMERCIAL_ABBREVIATIONS: Record<string, string> = {
  BCO: 'Branco',
  BCA: 'Branca',
  PTO: 'Preto',
  PTA: 'Preta',
  PT: 'Preto',
  VM: 'Vermelho',
  VMA: 'Vermelha',
  AZ: 'Azul',
  AM: 'Amarelo',
  AMA: 'Amarela',
  VD: 'Verde',
  LR: 'Laranja',
  MR: 'Marrom',
  CZ: 'Cinza',
  RS: 'Rosa',
  PCT: 'Pacote',
  PCTE: 'Pacote',
  UN: 'Unidade',
  UND: 'Unidade',
  CX: 'Caixa',
  CXA: 'Caixa',
  FD: 'Fardo',
  FDO: 'Fardo',
  SC: 'Saca',
  SCA: 'Saca',
  LT: 'Litro',
  LTS: 'Litros',
  GL: 'Galão',
  GLO: 'Galão',
  BD: 'Balde',
  BDE: 'Balde',
  TB: 'Tubo',
  TBO: 'Tubo',
  FR: 'Frasco',
  FCO: 'Frasco',
  AMP: 'Ampola',
  PAR: 'Par',
  JG: 'Jogo',
  JGO: 'Jogo',
  KT: 'Kit',
  KIT: 'Kit',
  DISC: 'Disco',
  RL: 'Rolo',
  RLO: 'Rolo',
  BAR: 'Barra',
  MT: 'Metro',
  MTS: 'Metros',
  P: 'Para',
  'P/': 'Para',
  'C/': 'Com',
  'S/': 'Sem',
  MED: 'Médio',
  PEQ: 'Pequeno',
  GDE: 'Grande',
  EXT: 'Extra',
  SUP: 'Super',
  PREM: 'Premium',
  ESP: 'Especial',
  IND: 'Industrial',
  PROF: 'Profissional',
  ELET: 'Elétrico',
  ELETR: 'Elétrico',
  MEC: 'Mecânico',
  MAN: 'Manual',
  AUT: 'Automático',
  ADUL: 'Adulto',
  FILH: 'Filhote',
  CAST: 'Castrado',
  ORIG: 'Original',
  NAT: 'Natural',
  TRAD: 'Tradicional',
};

// Conectivos e preposições em português que devem permanecer em minúsculas
const LOWERCASE_CONNECTIVES = new Set([
  'de', 'da', 'do', 'das', 'dos',
  'e', 'em', 'na', 'no', 'nas', 'nos',
  'com', 'sem', 'por', 'para', 'pra',
  'a', 'o', 'as', 'os', 'ao', 'aos',
  'ou', 'sob', 'sobre'
]);

// Siglas e grandezas que devem permanecer estritamente em MAIÚSCULAS
const UPPERCASE_TOKENS = new Set([
  'XP16', 'TR30', 'B4T', 'TR200', 'JF', 'NPK', 'BSE', 'MSD',
  'LED', 'PVC', 'PPR', 'HDPE', 'PEAD', 'NBR', 'ISO',
  'BRL', 'DNA', 'RNA', 'PRO', 'MAX', 'PLUS', 'TOP',
  'PH', 'EC', 'TDS', 'PPM'
]);

/**
 * Remove códigos de controle/identificação do início do texto.
 * Ex: "12345 - Ração Golden 15kg" -> "Ração Golden 15kg"
 * Ex: "00123/ Semente Milho" -> "Semente Milho"
 * Ex: "[0491] Arame Belgo" -> "Arame Belgo"
 */
export function removeLeadingInternalCodes(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();

  // Remove [12345], (12345), #12345
  cleaned = cleaned.replace(/^(\[|\()?\s*#?\d{3,10}\s*(\]|\))?\s*[-–—/:]*\s*/i, '');
  
  // Remove códigos alfa-numéricos iniciais tipo "COD123 - " ou "REF 998: "
  cleaned = cleaned.replace(/^(?:cod|c[oó]d|ref|item|sku)\.?\s*[:#-]?\s*\d+\s*[-–—/:]*\s*/i, '');

  return cleaned.trim();
}

/**
 * Expande abreviações comerciais em palavras legíveis.
 */
export function expandCommercialAbbreviations(text: string): string {
  if (!text) return '';

  let normalized = text
    .replace(/\bC\/\s*/gi, 'Com ')
    .replace(/\bP\/\s*/gi, 'Para ')
    .replace(/\bS\/\s*/gi, 'Sem ');

  // Quebra por palavras preservando pontuação simples
  const tokens = normalized.split(/(\s+|[.,/\\()\-–—+])/);

  const expanded = tokens.map((token) => {
    const cleanToken = token.trim();
    if (!cleanToken) return token;

    const upper = cleanToken.toUpperCase();
    if (COMMERCIAL_ABBREVIATIONS[upper]) {
      return COMMERCIAL_ABBREVIATIONS[upper];
    }
    return token;
  });

  return expanded.join('');
}

/**
 * Formata unidades técnicas e grandezas físicas (ex: "15kg" -> "15kg", "220v" -> "220V", "2hp" -> "2HP")
 */
function normalizeTechnicalUnits(token: string): string | null {
  // Ex: 15KG -> 15kg, 500G -> 500g, 10L -> 10L
  const matchUnit = token.match(/^(\d+(?:[.,]\d+)?)([a-zA-Z]+)$/);
  if (matchUnit) {
    const num = matchUnit[1];
    const unit = matchUnit[2].toUpperCase();

    switch (unit) {
      case 'KG': return `${num}kg`;
      case 'G': case 'GR': return `${num}g`;
      case 'MG': return `${num}mg`;
      case 'L': case 'LT': case 'LTS': return `${num}L`;
      case 'ML': return `${num}ml`;
      case 'V': case 'VOLTS': return `${num}V`;
      case 'W': case 'WATTS': return `${num}W`;
      case 'KW': return `${num}kW`;
      case 'HP': return `${num}HP`;
      case 'CV': return `${num}cv`;
      case 'RPM': return `${num} RPM`;
      case 'MM': return `${num}mm`;
      case 'CM': return `${num}cm`;
      case 'M': return `${num}m`;
      case 'POLEGADAS': case 'POL': return `${num}"`;
      case 'X': return `${num}x`;
      default: return null;
    }
  }

  // Modelos com número tipo TR-30, B4T, XP16
  if (/^[A-Za-z]{1,4}[-_]?\d{1,4}[A-Za-z]?$/.test(token)) {
    return token.toUpperCase();
  }

  return null;
}

/**
 * Title Case Inteligente:
 * - Mantém conectivos em minúsculas (de, com, para) exceto no início
 * - Preserva siglas técnicas e modelos
 * - Capitaliza nomes próprios e substantivos
 */
export function smartTitleCase(text: string): string {
  if (!text) return '';

  const words = text.trim().split(/\s+/);
  if (words.length === 0) return '';

  const resultWords = words.map((rawWord, idx) => {
    // Isola pontuações anexadas (ex: "(15kg)" ou "Milho,")
    const match = rawWord.match(/^([^a-zA-Z0-9]*)(.*?)([^a-zA-Z0-9]*)$/);
    if (!match) return rawWord;

    const prefix = match[1];
    const core = match[2];
    const suffix = match[3];

    if (!core) return rawWord;

    const lowerCore = core.toLowerCase();
    const upperCore = core.toUpperCase();

    // 1. Siglas estritas
    if (UPPERCASE_TOKENS.has(upperCore)) {
      return `${prefix}${upperCore}${suffix}`;
    }

    // 2. Unidades técnicas combinadas (15kg, 220V, etc)
    const normalizedUnit = normalizeTechnicalUnits(core);
    if (normalizedUnit !== null) {
      return `${prefix}${normalizedUnit}${suffix}`;
    }

    // 3. Conectivos (se não for a primeira palavra)
    if (idx > 0 && LOWERCASE_CONNECTIVES.has(lowerCore)) {
      return `${prefix}${lowerCore}${suffix}`;
    }

    // 4. Palavras normais: Primeira letra maiúscula, restante minúsculo
    const capitalized = lowerCore.charAt(0).toUpperCase() + lowerCore.slice(1);
    return `${prefix}${capitalized}${suffix}`;
  });

  return resultWords.join(' ');
}

/**
 * Normaliza e formata valor em BRL estrito (ex: 44.5 -> "44,50", "159,9" -> "159,90")
 */
export function formatBrlStrict(val: string | number | null | undefined): string {
  if (val === undefined || val === null) return '';
  const str = String(val).trim().replace(/r\$\s*/gi, '').trim();
  if (!str) return '';

  // Se já for numérico direto
  if (typeof val === 'number') {
    if (isNaN(val) || val <= 0) return '';
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Se for string com vírgula e ponto
  let clean = str;
  if (clean.includes(',') && clean.includes('.')) {
    const lastComma = clean.lastIndexOf(',');
    const lastDot = clean.lastIndexOf('.');
    if (lastComma > lastDot) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
      clean = clean.replace(/,/g, '');
    }
  } else if (clean.includes(',')) {
    clean = clean.replace(',', '.');
  }

  const num = parseFloat(clean);
  if (isNaN(num) || num <= 0) return '';

  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Pipeline completo de higienização de descrição de produto
 */
export function sanitizeProductName(rawName: string): string {
  if (!rawName) return '';
  
  let step1 = removeLeadingInternalCodes(rawName);
  let step2 = expandCommercialAbbreviations(step1);
  let step3 = smartTitleCase(step2);

  // Remove múltiplos espaços e pontuações soltas
  step3 = step3.replace(/\s{2,}/g, ' ').trim();
  step3 = step3.replace(/[-–—/:]\s*$/, '').trim();

  return step3;
}

/**
 * Valida se uma linha da planilha possui os requisitos mínimos para o lote
 */
export function validateProductRow(
  codigo: string | number | undefined,
  titulo: string | undefined,
  precoPor: string | number | undefined
): { isValid: boolean; reason?: string } {
  if (!titulo || typeof titulo !== 'string' || titulo.trim().length === 0) {
    return { isValid: false, reason: 'Nome do produto ausente' };
  }

  const cleanName = sanitizeProductName(titulo);
  if (cleanName.length < 2) {
    return { isValid: false, reason: 'Nome do produto muito curto ou inválido' };
  }

  const formattedPor = formatBrlStrict(precoPor);
  if (!formattedPor) {
    return { isValid: false, reason: 'Preço promocional inválido ou zero' };
  }

  return { isValid: true };
}
