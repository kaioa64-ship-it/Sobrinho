export type CommunicationType =
  | 'promocao'
  | 'preco-unico'
  | 'informativo'
  | 'promotion'
  | 'single-price'
  | 'informative'
  | 'informativo_novidade';

export type CommunicationSelection =
  | 'auto'
  | 'promocao'
  | 'preco-unico'
  | 'informativo';

export interface PriceModule {
  ativo?: boolean;
  valor_de?: string;
  valor_por?: string;
  condicoes_pagamento?: string;
  unidade?: string;
  condicao?: string;
}

export type ModuloPreco = PriceModule;

export interface CaixaTitulo {
  texto: string;
  palavra_ouro: string;
  palavra_ouro_destaque?: string;
  caracteres_usados?: number;
  limite?: number;
}

export interface CaixaSubtitulo {
  texto: string;
  caracteres_usados?: number;
  limite?: number;
}

export type CanvasFormat = 'feed-quadrado' | 'feed-retrato' | 'story' | 'a4-retrato';

export type TemplateLayout = 'unified-central' | 'unified-split' | 'unified-central-mascot' | 'unified-split-mascot' | 'informative-central' | 'informative-split' | 'promo-simples' | 'split-vertical' | 'hero-central' | 'pet-central' | 'pet-split-vertical' | 'pet-split' | 'promo-text-only' | 'promo-agro-a4' | 'promo-mono-a4';

export type CanvasTheme =
  | 'verde-coagro'   // #004d40 Dominante Institucional
  | 'azul-coagro'    // #001C71 Azul Publicitário Oficial
  | 'clean-branco'   // #FFFFFF Fundo Claro
  | 'campo-agro'     // Fundo com foto do campo
  | 'fundo-gerado';

export interface TextosDaArte {
  titulo_impacto: string;
  palavra_destaque: string;
  subtitulo: string;
  bullets_tecnicos: string[];
  cta: string;
  modulo_preco?: ModuloPreco;
}

export interface TextosHero {
  titulo: string;
  palavra_destaque_ouro: string;
  subtitulo: string;
}

export type PorteVisual = 'frasco_minimo' | 'pequeno_horizontal' | 'medio' | 'grande_saco' | 'maquina_pesada';
export type TipoAncoragem = 'chao' | 'flutuante_central';

export interface RenderizacaoVisual {
  porte_visual: PorteVisual;
  tipo_ancoragem: TipoAncoragem;
  fator_ocupacao_percentual: number;
}

export interface AgroPostContent {
  linha?: string;
  tipo_postagem?: CommunicationType | string;
  categoria_produto?: string;
  formato_gerado?: 'Feed' | 'Story' | string;
  formato: 'feed' | 'story' | string;
  template_layout?: TemplateLayout;
  image_box_format?: 'rectangular' | 'square';
  tema?: CanvasTheme;
  prompt_fundo_ia?: string;
  fundo_imagem?: string;
  fundo_imagem_url?: string;
  textos_hero?: TextosHero;
  diferenciais_tecnicos?: string[];
  textos_da_arte?: TextosDaArte;
  renderizacao_visual?: RenderizacaoVisual;
  caixa_titulo?: CaixaTitulo;
  caixa_subtitulo?: CaixaSubtitulo;
  beneficios_tecnicos?: string[];
  modulo_preco?: ModuloPreco;
  legenda_instagram?: string;
  legenda_post?: string;
  fundo_texto?: boolean;
  fundo_cor_hex?: string; // Cor sólida do Promo Simples: 'branco' | 'verde' | 'azul' | 'laranja'
}

export type AgroContent = AgroPostContent;

export interface PresetProduct {
  id: string;
  name: string;
  category: 'Defensivos' | 'Vacinas & Sanidade' | 'Fertilizantes' | 'Pecuária' | 'Sementes' | 'Equipamentos';
  description: string;
  imageUrl: string;
  badge: string;
  defaultContent: AgroPostContent;
  backgroundSampleUrl?: string;
}

export const EMPTY_AGRO_CONTENT: AgroPostContent = {
  linha: '',
  tipo_postagem: undefined,
  categoria_produto: '',
  formato: 'story',
  formato_gerado: 'Story',
  template_layout: 'hero-central',
  tema: 'campo-agro',
  textos_hero: {
    titulo: '',
    palavra_destaque_ouro: '',
    subtitulo: '',
  },
  textos_da_arte: {
    titulo_impacto: '',
    palavra_destaque: '',
    subtitulo: '',
    bullets_tecnicos: [],
    cta: '',
    modulo_preco: {
      ativo: false,
      valor_de: '',
      valor_por: '',
      condicoes_pagamento: '',
    },
  },
  caixa_titulo: {
    texto: '',
    palavra_ouro: '',
  },
  caixa_subtitulo: {
    texto: '',
  },
  diferenciais_tecnicos: [],
  beneficios_tecnicos: [],
  modulo_preco: {
    ativo: false,
    valor_de: '',
    valor_por: '',
    condicoes_pagamento: '',
  },
  legenda_instagram: '',
  legenda_post: '',
  fundo_imagem: '',
  fundo_imagem_url: '',
};

export const EMPTY_PET_CONTENT: AgroPostContent = {
  ...EMPTY_AGRO_CONTENT,
  template_layout: 'pet-central',
  tema: 'clean-branco',
};
