import { isPetScope, type ScopeId } from './brand.config';

export const STORY_LAYOUT = {
  safeArea: { top: 72, right: 64, bottom: 84, left: 64 },
  rows: '9% 15% 43% 17% 8%',
  logo: { maxWidthRatio: 0.34, maxHeight: 140 },
  title: { maxLines: 2, maxWidth: 920, minFontSize: 62, maxFontSize: 88 },
  subtitle: { maxLines: 2, maxWidth: 860, minFontSize: 34, maxFontSize: 44 },
  product: { maxWidth: 780, maxHeight: 720, anchor: 'BOTTOM_CENTER' },
  priceTag: { maxWidth: 470, maxHeight: 230, rotation: -2 },
  benefit: { maxLines: 2, maxCharacters: 34, minFontSize: 29 },
  cta: { maxWidth: 920, minHeight: 110 },
} as const;

export const CONTENT_LIMITS = {
  title: {
    maxCharacters: 35,
    maxWords: 4,
  },
  subtitle: {
    maxCharacters: 70,
  },
  benefit: {
    maxCharacters: 38,
    maxItems: 3,
  },
  cta: {
    maxCharacters: 42,
  },
} as const;

/**
 * Seleção defensiva de template ao trocar de escopo/formato.
 *
 * Aceita `ScopeId` (tipo aberto) para não fechar a porta a novas marcas —
 * ver src/lib/brand.config.ts.
 */
export function resolveDefaultTemplate(
  format: string,
  scopeId?: ScopeId
): 'hero-central' | 'split-vertical' | 'pet-central' | 'pet-split-vertical' {
  if (isPetScope(scopeId)) {
    return format === 'story' ? 'pet-central' : 'pet-split-vertical';
  }
  return format === 'story' ? 'hero-central' : 'split-vertical';
}
