import type { AgroPostContent, CanvasTheme } from '../types/agro';
import { EMPTY_AGRO_CONTENT, EMPTY_PET_CONTENT } from '../types/agro';

export interface SocialManualData {
  codigo?: string;
  titulo: string;
  subtitulo: string;
  valorDe: string;
  valorPor: string;
  diferenciais: string[];
  backgroundImageUrl?: string;
  backgroundColorHex?: string;
  badge?: string;
  theme?: string;
  textBackground?: boolean;
  cta?: string;
  preserveProductBackground?: boolean;
}

/**
 * Fornece dados iniciais contextualizados por escopo para evitar vazamento
 * de copy ou temas entre marcas Agro e Pet no modo de edição manual.
 */
export function getDefaultSocialManualData(appMode: 'AGRO' | 'PET'): SocialManualData {
  if (appMode === 'PET') {
    return {
      codigo: undefined,
      titulo: 'Ração Golden Special 15kg',
      subtitulo: 'Sabor irresistível e nutrição balanceada para cães',
      valorDe: '159,90',
      valorPor: '129,90',
      diferenciais: ['15kg rende mais', 'Sem corantes artificiais'],
      backgroundImageUrl: '',
      backgroundColorHex: '',
      theme: 'clean-branco',
      textBackground: undefined,
      badge: 'Oferta Pet',
      cta: 'Aproveite a oferta!',
      preserveProductBackground: undefined,
    };
  }

  return {
    codigo: undefined,
    titulo: 'Pulverizador Costal 16L',
    subtitulo: 'Eficiência e durabilidade máxima na lavoura',
    valorDe: '289,90',
    valorPor: '239,90',
    diferenciais: ['Tanque ergonômico 16L', 'Lança reforçada regulável'],
    backgroundImageUrl: '',
    backgroundColorHex: '',
    theme: 'campo-agro',
    textBackground: undefined,
    badge: 'Oferta Campo',
    cta: 'Garanta já o seu!',
    preserveProductBackground: undefined,
  };
}

/**
 * Sincroniza deterministicamente o estado do formulário manual com o AgroPostContent,
 * garantindo isolamento estrito de temas, fallbacks e estruturas de marca.
 */
export function syncSocialManualDataToContent(
  data: SocialManualData,
  appMode: 'AGRO' | 'PET'
): AgroPostContent {
  const baseContent = appMode === 'PET' ? EMPTY_PET_CONTENT : EMPTY_AGRO_CONTENT;

  return {
    ...baseContent,
    linha: appMode,
    textos_hero: {
      titulo: data.titulo,
      subtitulo: data.subtitulo,
      palavra_destaque_ouro: '',
    },
    textos_da_arte: {
      titulo_impacto: data.titulo,
      subtitulo: data.subtitulo,
      palavra_destaque: '',
      bullets_tecnicos: data.diferenciais,
      cta: data.cta || '',
    },
    diferenciais_tecnicos: data.diferenciais,
    modulo_preco: {
      ativo: Boolean(data.valorPor),
      valor_de: data.valorDe,
      valor_por: data.valorPor,
    },
    fundo_imagem_url: data.backgroundImageUrl || '',
    fundo_imagem: data.backgroundImageUrl || '',
    fundo_cor_hex: data.backgroundColorHex || '',
    tipo_postagem: data.valorPor ? 'promocao' : 'informativo',
    fundo_texto: data.textBackground,
  };
}

/**
 * Converte um AgroPostContent existente de volta para o formato do formulário manual.
 */
export function syncContentToSocialManualData(
  content: AgroPostContent,
  existing?: Partial<SocialManualData>
): SocialManualData {
  const titulo =
    content.textos_da_arte?.titulo_impacto ||
    content.textos_hero?.titulo ||
    content.headline_principal ||
    content.titulo ||
    '';

  const subtitulo =
    content.textos_da_arte?.subtitulo ||
    content.textos_hero?.subtitulo ||
    content.subtitulo ||
    '';

  const preco = content.modulo_preco || content.textos_da_arte?.modulo_preco;
  const diferenciais =
    content.textos_da_arte?.bullets_tecnicos ||
    content.diferenciais_tecnicos ||
    [];

  return {
    codigo: existing?.codigo,
    titulo,
    subtitulo,
    valorDe: preco?.valor_de || '',
    valorPor: preco?.valor_por || '',
    diferenciais: Array.isArray(diferenciais) ? diferenciais : [],
    backgroundImageUrl: content.fundo_imagem_url || content.fundo_imagem || '',
    backgroundColorHex: content.fundo_cor_hex || '',
    badge: existing?.badge,
    theme: (content.tema as CanvasTheme) || existing?.theme,
    textBackground: content.fundo_texto,
    cta: content.textos_da_arte?.cta || existing?.cta || '',
    preserveProductBackground: existing?.preserveProductBackground,
  };
}
