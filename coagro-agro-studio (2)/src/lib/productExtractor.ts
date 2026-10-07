/**
 * Extrator e normalizador inteligente de dados de produtos agropecuários.
 * Analisa descrições digitadas pelo usuário para identificar:
 * 1. Nome comercial do produto
 * 2. Marca / Fabricante
 * 3. Modelo / Versão
 * 4. Subtítulo ideal para a arte (Nome + Marca)
 * 5. Melhor layout recomendado (Split Vertical vs Hero Central)
 * 6. Título comercial de impacto pré-acertado (Oferta Especial, Oferta Relâmpago, etc.)
 */

export interface ExtractedProductAnalysis {
  productName: string;
  brand: string;
  model: string;
  subtitle: string;
  recommendedLayout: 'split-vertical' | 'hero-central';
  suggestedTitle: string;
  suggestedHighlight: string;
  category: string;
}

// Lista curada de marcas agrícolas comuns no Brasil
const KNOWN_AGRO_BRANDS = [
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
  'Nutron',
  'Premix',
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
  'Kärcher',
  'Guarany',
  'Magnojet',
  'Teejet',
];

// Termos que indicam maquinários e equipamentos pesados/médios (layout ideal = split-vertical)
const SPLIT_LAYOUT_KEYWORDS = [
  'triturador',
  'forrageira',
  'ensiladeira',
  'picadeira',
  'moenda',
  'motobomba',
  'bomba',
  'gerador',
  'motor',
  'roçadeira',
  'motosserra',
  'pulverizador',
  'soprador',
  'furadeira',
  'trator',
  'arado',
  'grade',
  'plantadeira',
  'semeadora',
  'colhedora',
  'vagão',
  'misturador',
  'desintegrador',
  'esmeril',
  'lavadora',
  'compressor',
  'cerca',
  'arame',
  'carreta',
  'guindaste',
  'guincho',
];

export function analyzeAgroDescription(
  text: string,
  hasTwoPrices: boolean = false,
  hasSinglePrice: boolean = false
): ExtractedProductAnalysis {
  const clean = (text || '').trim();
  const lower = clean.toLowerCase();

  // 1. Identifica Marca
  let brand = '';
  for (const b of KNOWN_AGRO_BRANDS) {
    const regex = new RegExp(`\\b${b}\\b`, 'i');
    if (regex.test(clean)) {
      brand = b;
      break;
    }
  }

  // 2. Identifica Códigos de Modelo (ex: TR30, TR-30, XP16, GT50, B4T, etc.)
  let model = '';
  const modelMatch = clean.match(/\b([a-zA-Z]{1,4}[-_]?\d{1,4}[a-zA-Z]?)\b/);
  if (modelMatch) {
    const candidate = modelMatch[1].toUpperCase();
    // Garante que não é apenas unidade técnica como "2HP" ou "220V"
    if (!/^\d+(?:HP|CV|W|KW|V|KG|L|X)$/i.test(candidate)) {
      model = candidate;
    }
  }

  // 3. Determina o Melhor Layout (Roteamento de Layout Obrigatório)
  // - "split-vertical" obrigatoriamente para: Maquinários, roçadeiras, motores, trituradores e equipamentos horizontais.
  // - "hero-central" obrigatoriamente para: Insumos, frascos de vacina, sacarias, galões de defensivos e itens verticais compactos.
  const isSplitMandatory =
    SPLIT_LAYOUT_KEYWORDS.some((kw) => lower.includes(kw)) ||
    lower.includes('maquinário') ||
    lower.includes('maquinario') ||
    lower.includes('máquina') ||
    lower.includes('maquina') ||
    lower.includes('roçadeira') ||
    lower.includes('rocadeira') ||
    lower.includes('motor') ||
    lower.includes('triturador') ||
    lower.includes('equipamento') ||
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

  // 4. Identifica Categoria e Nome Base
  let category = 'Equipamentos';
  let baseProduct = '';

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
  } else if (lower.includes('roçadeira')) {
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
  } else if (lower.includes('adubo') || lower.includes('fertilizante') || lower.includes('npk')) {
    baseProduct = 'Fertilizante NPK';
    category = 'Fertilizantes';
  } else if (lower.includes('semente') || lower.includes('capim') || lower.includes('brachiaria')) {
    baseProduct = 'Sementes de Pastagem';
    category = 'Sementes';
  } else if (lower.includes('herbicida') || lower.includes('inseticida') || lower.includes('fungicida')) {
    baseProduct = 'Defensivo Agrícola';
    category = 'Defensivos';
  } else {
    // Tenta extrair as primeiras 2 a 4 palavras antes dos números
    const words = clean.split(/\s+/).filter((w) => !/^\d+/.test(w) && !/^r\$/i.test(w));
    baseProduct = words.slice(0, 3).join(' ') || 'Produto Agro';
  }

  // 5. Monta o Subtítulo Inteligente: O NOME DO PRODUTO + MODELO + MARCA
  // Exemplo de ouro do usuário: "Triturador TR30 Tramontina"
  let subtitle = '';
  const parts: string[] = [];

  if (baseProduct) parts.push(baseProduct);
  if (model && !baseProduct.toUpperCase().includes(model)) parts.push(model);
  if (brand && !baseProduct.toUpperCase().includes(brand.toUpperCase())) parts.push(brand);

  if (parts.length > 0) {
    subtitle = parts.join(' ').trim();
  } else {
    subtitle = 'Soluções de alta performance para o produtor rural.';
  }

  // 6. Título Comercial de Impacto Pré-Acertado
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
    suggestedTitle = 'QUALIDADE COMPROVADA';
    suggestedHighlight = 'QUALIDADE';
  }

  return {
    productName: baseProduct,
    brand,
    model,
    subtitle,
    recommendedLayout,
    suggestedTitle,
    suggestedHighlight,
    category,
  };
}
