/**
 * erpSanitizer.ts
 * Utilitário de higienização de títulos de produtos oriundos de ERP e notas fiscais.
 * 
 * Resolve o gargalo de operadores e vendedores de loja do Grupo Coagro que importam
 * planilhas de estoque/ERP ou colam descrições brutas em caixa alta cheias de siglas
 * e abreviações (ex: "RAC TUTTICANIS SEL 10.1KG", "PULV AGR MANUAL 20L").
 */

// Siglas e acrônimos que devem ser preservados em caixa alta (maiúsculas)
const ACRONYMS = new Set([
  'NPK', 'PVC', 'EPI', 'PET', 'LED', 'UV', 'DDT', 'BRL', 'USA', 'BR',
  'CE', 'DF', 'SE', 'AL', 'BA', 'PE', 'PB', 'RN', 'PI', 'MA',
  'SC', 'EC', 'WG', 'SL', 'WP', 'FS', 'EW', 'GR', 'DP',
  'PH', 'HP', 'CV', 'BTU', 'V', 'W', 'WATT', 'WATTS'
]);

// Dicionário de expansão de abreviações e correção de termos sem acento de ERP
const DICTIONARY: Record<string, string> = {
  // Divisão Agropecuária & Campo
  'PULV': 'Pulverizador',
  'PULVERIZ': 'Pulverizador',
  'PULVERIZADOR': 'Pulverizador',
  'AGR': 'Agrícola',
  'AGRIC': 'Agrícola',
  'AGRICOLA': 'Agrícola',
  'MAN': 'Manual',
  'MANU': 'Manual',
  'MANUAL': 'Manual',
  'COSTA': 'Costal',
  'COSTAL': 'Costal',
  'HERB': 'Herbicida',
  'HERBIC': 'Herbicida',
  'HERBICIDA': 'Herbicida',
  'INSET': 'Inseticida',
  'INSETIC': 'Inseticida',
  'INSETICIDA': 'Inseticida',
  'FUNG': 'Fungicida',
  'FUNGIC': 'Fungicida',
  'FUNGICIDA': 'Fungicida',
  'ADUB': 'Adubo',
  'ADUBO': 'Adubo',
  'FERT': 'Fertilizante',
  'FERTILIZ': 'Fertilizante',
  'FERTILIZANTE': 'Fertilizante',
  'FOL': 'Foliar',
  'FOLIAR': 'Foliar',
  'ORGAN': 'Orgânico',
  'ORGANICO': 'Orgânico',
  'MINER': 'Mineral',
  'COND': 'Condicionador',
  'PAST': 'Pastagem',
  'PASTAGEM': 'Pastagem',
  'SEM': 'Semente',
  'SEMENT': 'Semente',
  'SEMENTE': 'Semente',
  'SEMENTES': 'Sementes',
  'MILH': 'Milho',
  'MILHO': 'Milho',
  'CAP': 'Capim',
  'CAPIM': 'Capim',
  'BRAQ': 'Braquiária',
  'BRAQUIAR': 'Braquiária',
  'BRAQUIARIA': 'Braquiária',
  'MOM': 'Mombaça',
  'MOMBACA': 'Mombaça',
  'ARAM': 'Arame',
  'ARAME': 'Arame',
  'FARP': 'Farpado',
  'FARPADO': 'Farpado',
  'OVAL': 'Ovalado',
  'OVALADO': 'Ovalado',
  'GALV': 'Galvanizado',
  'GALVANIZADO': 'Galvanizado',
  'BEBED': 'Bebedouro',
  'BEBEDOURO': 'Bebedouro',
  'COMED': 'Comedouro',
  'COMEDOURO': 'Comedouro',
  'BOT': 'Bota',
  'BOTA': 'Bota',
  'IMPERM': 'Impermeável',
  'IMPERMEAVEL': 'Impermeável',
  'TRAT': 'Tratamento',
  'TRATAMENTO': 'Tratamento',
  'VERM': 'Vermífugo',
  'VERMIF': 'Vermífugo',
  'VERMIFUGO': 'Vermífugo',
  'ANTIPAR': 'Antiparasitário',
  'ANTIPARASITARIO': 'Antiparasitário',
  'INJ': 'Injetável',
  'INJET': 'Injetável',
  'INJETAVEL': 'Injetável',
  'SOL': 'Solução',
  'SOLUCAO': 'Solução',
  'LIQ': 'Líquido',
  'LIQUIDO': 'Líquido',

  // Divisão Pet
  'RAC': 'Ração',
  'RACAO': 'Ração',
  'PREM': 'Premium',
  'PREMIUM': 'Premium',
  'ESP': 'Especial',
  'ESPEC': 'Especial',
  'ESPECIAL': 'Especial',
  'SPECIAL': 'Special',
  'SEL': 'Select',
  'SELECT': 'Select',
  'ADULT': 'Adulto',
  'ADTO': 'Adulto',
  'ADULTO': 'Adulto',
  'FILH': 'Filhote',
  'FLHT': 'Filhote',
  'FILHOTE': 'Filhote',
  'FILHOTES': 'Filhotes',
  'SENIOR': 'Sênior',
  'CAST': 'Castrado',
  'CASTR': 'Castrado',
  'CASTRADO': 'Castrado',
  'MED': 'Médio',
  'MEDIO': 'Médio',
  'PEQ': 'Pequeno',
  'PEQUENO': 'Pequeno',
  'GD': 'Grande',
  'GDE': 'Grande',
  'GRANDE': 'Grande',
  'PORT': 'Porte',
  'PORTE': 'Porte',
  'RACAS': 'Raças',
  'RCS': 'Raças',
  'CAO': 'Cão',
  'CAES': 'Cães',
  'GATO': 'Gato',
  'GATOS': 'Gatos',
  'CARN': 'Carne',
  'CARNE': 'Carne',
  'FRG': 'Frango',
  'FRANG': 'Frango',
  'FRANGO': 'Frango',
  'ARR': 'Arroz',
  'ARROZ': 'Arroz',
  'VEG': 'Vegetais',
  'VEGETAIS': 'Vegetais',
  'SALM': 'Salmão',
  'SALMAO': 'Salmão',
  'SHAMP': 'Shampoo',
  'SHAMPOO': 'Shampoo',
  'CONDIC': 'Condicionador',
  'CONDICIONADOR': 'Condicionador',
  'SAB': 'Sabonete',
  'SABONETE': 'Sabonete',
  'COLEIR': 'Coleira',
  'COLEIRA': 'Coleira',
  'ANTIPULG': 'Antipulgas',
  'ANTIPULGAS': 'Antipulgas',
  'TAP': 'Tapete',
  'TAPETE': 'Tapete',
  'HIG': 'Higiênico',
  'HIGIEN': 'Higiênico',
  'HIGIENICO': 'Higiênico',
  'AREI': 'Areia',
  'AREIA': 'Areia',
  'SANIT': 'Sanitária',
  'SANITARIA': 'Sanitária',
  'PETIS': 'Petisco',
  'PETISCO': 'Petisco',
  'BISC': 'Biscoito',
  'BISCOITO': 'Biscoito',
  'SACH': 'Sachê',
  'SACHE': 'Sachê',
  'LATA': 'Lata',

  // Embalagens & Apresentação
  'CX': 'Caixa',
  'CXA': 'Caixa',
  'PCT': 'Pacote',
  'PCTE': 'Pacote',
  'SC': 'Saco',
  'FD': 'Fardo',
  'UN': 'Unid.',
  'UND': 'Unid.',
  'UNID': 'Unid.',
};

// Conectores que devem permanecer em minúsculas
const LOWERCASE_WORDS = new Set([
  'de', 'da', 'do', 'das', 'dos',
  'e', 'em', 'com', 'sem', 'para', 'por', 'a', 'o', 'as', 'os'
]);

/**
 * Normaliza e higieniza uma string de título/descrição bruta de ERP.
 * 
 * @example
 * sanitizeErpTitle("RAC TUTTICANIS SEL 10.1KG") // "Ração Tutticanis Select 10.1 kg"
 * sanitizeErpTitle("PULV AGR MANUAL 20L") // "Pulverizador Agrícola Manual 20L"
 * sanitizeErpTitle("ADUBO NPK 10-10-10 1KG") // "Adubo NPK 10-10-10 1 kg"
 */
export function sanitizeErpTitle(rawTitle: string): string {
  if (!rawTitle || typeof rawTitle !== 'string') return '';

  // 1. Limpeza de ruídos fiscais/NFe (ex: asteriscos, códigos entre parênteses fiscais)
  let cleaned = rawTitle
    .replace(/[*#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 2. Quebra em palavras para expansão de dicionário e Title Case
  const words = cleaned.split(' ');
  const processedWords = words.map((word, index) => {
    if (!word) return '';

    // Remove pontuação de borda para checar dicionário
    const match = word.match(/^([^a-zA-Z0-9]*)(.*?)([^a-zA-Z0-9]*)$/);
    if (!match) return word;

    const [, leadingPunct, coreWord, trailingPunct] = match;
    const upperCore = coreWord.toUpperCase();

    // 2.1 Preserva acrônimos técnicos (NPK, PVC, etc.)
    if (ACRONYMS.has(upperCore)) {
      return `${leadingPunct}${upperCore}${trailingPunct}`;
    }

    // 2.2 Se for número acoplado com unidade (ex: "20L", "10.1KG", "500ML")
    const unitMatch = upperCore.match(/^(\d+(?:[.,]\d+)?)(KG|KGS|GR|G|ML|MLS|LT|LTS|L|MT|MTS|M|CM|MM)$/);
    if (unitMatch) {
      const [, num, unit] = unitMatch;
      if (unit === 'KG' || unit === 'KGS') return `${leadingPunct}${num} kg${trailingPunct}`;
      if (unit === 'GR' || unit === 'G') return `${leadingPunct}${num} g${trailingPunct}`;
      if (unit === 'ML' || unit === 'MLS') return `${leadingPunct}${num} ml${trailingPunct}`;
      if (unit === 'LT' || unit === 'LTS' || unit === 'L') return `${leadingPunct}${num}L${trailingPunct}`;
      if (unit === 'MT' || unit === 'MTS' || unit === 'M') return `${leadingPunct}${num}m${trailingPunct}`;
      if (unit === 'CM') return `${leadingPunct}${num} cm${trailingPunct}`;
      if (unit === 'MM') return `${leadingPunct}${num} mm${trailingPunct}`;
    }

    // 2.3 Se estiver no dicionário de abreviações e acentuação de ERP
    if (DICTIONARY[upperCore]) {
      return `${leadingPunct}${DICTIONARY[upperCore]}${trailingPunct}`;
    }

    // 2.4 Unidades de medida soltas
    if (upperCore === 'KG' || upperCore === 'KGS') return `${leadingPunct}kg${trailingPunct}`;
    if (upperCore === 'G' || upperCore === 'GR') return `${leadingPunct}g${trailingPunct}`;
    if (upperCore === 'ML') return `${leadingPunct}ml${trailingPunct}`;
    if (upperCore === 'L' || upperCore === 'LT' || upperCore === 'LTS') return `${leadingPunct}L${trailingPunct}`;

    // 2.5 Conectores em minúsculas (a menos que seja a primeira palavra)
    const lowerCore = coreWord.toLowerCase();
    if (index > 0 && LOWERCASE_WORDS.has(lowerCore)) {
      return `${leadingPunct}${lowerCore}${trailingPunct}`;
    }

    // 2.6 Se for número ou composto com hífen/barra (ex: "10-10-10", "480")
    if (/^[\d./-]+$/.test(coreWord)) {
      return `${leadingPunct}${coreWord}${trailingPunct}`;
    }

    // 2.7 Title Case padrão (primeira maiúscula, resto minúsculo)
    const capitalized = coreWord.charAt(0).toUpperCase() + coreWord.slice(1).toLowerCase();
    return `${leadingPunct}${capitalized}${trailingPunct}`;
  });

  return processedWords.filter(Boolean).join(' ');
}
