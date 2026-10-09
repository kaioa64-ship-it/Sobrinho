import type { LogoVariant } from '../assets/coagroLogos';

/**
 * Identificador de escopo/marca.
 *
 * Hoje a Coagro opera dois escopos ('AGRO' e 'PET'), mas este tipo é
 * intencionalmente ABERTO (`string & {}` mantém o autocomplete sem fechar a
 * união) para permitir novas marcas e filiais sem reescrever os templates.
 *
 * Ver ROADMAP_COAGRO_STUDIO.md — Fase 4 (Core White-Label).
 */
export type ScopeId = 'AGRO' | 'PET' | (string & {});

/**
 * Escopos com implementação de marca completa (paleta própria + regras de
 * layout). Adicionar um item aqui é o primeiro passo para suportar uma marca
 * nova de ponta a ponta.
 */
export type BrandScope = 'AGRO' | 'PET';

/** Escopo assumido quando nada é informado ou o valor é desconhecido. */
export const DEFAULT_SCOPE: BrandScope = 'AGRO';

/**
 * Normaliza qualquer entrada de escopo para um `BrandScope` conhecido.
 *
 * Aceita variações de caixa/ espaços ('agro', 'PET ', 'Coagro Pet' não é
 * reconhecido de propósito — apenas o id). Valores desconhecidos caem em
 * `DEFAULT_SCOPE` de forma silenciosa e previsível.
 */
export function normalizeScopeId(scopeId?: ScopeId | null): BrandScope {
  if (!scopeId) return DEFAULT_SCOPE;
  const normalized = String(scopeId).trim().toUpperCase();
  if (normalized === 'PET') return 'PET';
  if (normalized === 'AGRO') return 'AGRO';
  return DEFAULT_SCOPE;
}

/** Atalho de leitura: o escopo informado é o Pet? */
export function isPetScope(scopeId?: ScopeId | null): boolean {
  return normalizeScopeId(scopeId) === 'PET';
}

/**
 * Marcas que possuem logotipo próprio (componente dedicado, não uma variante
 * da logo Coagro Agro). Quando `true`, o `ArtHeader` ignora `logoVariant` e
 * renderiza a logo da marca.
 */
export function brandHasOwnLogo(scopeId?: ScopeId | null): boolean {
  return isPetScope(scopeId);
}

export interface BrandPalette {
  titleColor: string;
  highlightColor: string;
  subtitleColor: string;
  titleFont: string;
}

/**
 * Paleta de texto por escopo.
 *
 * NOTA (Fase 4): as cores ainda estão literais aqui em vez de virem de
 * `tenant.config.json`. Centralizar nesta função garante que a migração para
 * configuração por marca aconteça em UM lugar, sem tocar nos templates.
 */
export function getPalette(scopeId: ScopeId, isLight: boolean = false): BrandPalette {
  if (isPetScope(scopeId)) {
    return {
      titleColor: 'text-[#4897D0]',
      highlightColor: 'text-[#E96C2C]',
      subtitleColor: 'text-gray-100',
      titleFont: 'font-exo2 font-black tracking-tight',
    };
  }

  return {
    titleColor: isLight ? 'text-[#004d40]' : 'text-white',
    highlightColor: 'text-[#ffab00]',
    subtitleColor: isLight ? 'text-gray-700' : 'text-[#E5E7EB]',
    titleFont: 'font-exo2 font-black uppercase tracking-tight',
  };
}

/**
 * Resolve a variante da logo **da marca Coagro Agro**.
 *
 * Regra explícita de precedência:
 *   1. variante escolhida manualmente pelo operador;
 *   2. contraste do fundo (claro → logo azul, escuro → logo branca).
 *
 * Marcas com logotipo próprio (ver `brandHasOwnLogo`) ignoram este valor — o
 * `ArtHeader` usa o componente da marca.
 */
export function resolveLogoVariant(
  isLight: boolean,
  explicit?: LogoVariant
): LogoVariant {
  if (explicit) return explicit;
  return isLight ? 'h-azul' : 'h-mono-branca';
}

/**
 * Fundo radial padrão por escopo/tema, usado quando não há foto de fundo.
 * Centralizado aqui para que a Fase 4 possa trocar por cores de tenant.
 */
export function resolveBackgroundStyle(
  scopeId: ScopeId,
  isLight: boolean,
  isBlue: boolean
): { background: string } {
  if (isBlue) {
    return { background: 'radial-gradient(circle at 50% 40%, #002b82 0%, #001C71 80%)' };
  }
  if (isLight) {
    return { background: 'radial-gradient(circle at 50% 40%, #ffffff 0%, #f1f5f9 85%)' };
  }
  if (isPetScope(scopeId)) {
    return { background: 'radial-gradient(circle at 50% 40%, #001C71 0%, #001040 80%)' };
  }
  return { background: 'radial-gradient(circle at 50% 40%, #006b59 0%, #004d40 80%)' };
}
