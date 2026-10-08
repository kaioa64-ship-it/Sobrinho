export function analyzeAgroDescriptionServer(
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
    if (!/^\\d+(?:HP|CV|W|KW|V|KG|L|X)$/i.test(candidate)) {
      model = candidate;
    }
  }

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
