const AGRO_BACKGROUNDS = {
  rustic_barn: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80', // Galpão rústico de fazenda, fardos de feno, desfoque
  pasture_cattle: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1200&q=80', // Rebanho e pasto
  seed_pasture: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80',   // Pastagem pura e densa
  crop_field: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',     // Lavoura de grãos viçosa
  fertile_soil: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=80',   // Solo fértil e mudas
  corn_field: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=1200&q=80',     // Lavoura de milho
};

export function generateOptimizedPhotoPrompt(contextText: string): string {
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

export function inferAgroBackground(contextText: string): string {
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
