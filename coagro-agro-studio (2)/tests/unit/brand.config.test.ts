import { describe, it, expect } from 'vitest';
import {
  DEFAULT_SCOPE,
  normalizeScopeId,
  isPetScope,
  brandHasOwnLogo,
  getPalette,
  resolveLogoVariant,
  resolveBackgroundStyle,
} from '../../src/lib/brand.config';

/**
 * Estes testes protegem o *seam* de escopo/marca criado na Fase 1.
 *
 * Contexto (ver ANALISE_COAGRO_STUDIO.md §6.2): antes o escopo era inferido da
 * cor do fundo, o que impedia uma marca de usar qualquer paleta. A resolução
 * agora é explícita e centralizada aqui. Se estes testes quebrarem, o
 * comportamento de AGRO↔PET mudou.
 */

describe('normalizeScopeId', () => {
  it('usa AGRO como padrão quando nada é informado', () => {
    expect(DEFAULT_SCOPE).toBe('AGRO');
    expect(normalizeScopeId()).toBe('AGRO');
    expect(normalizeScopeId(undefined)).toBe('AGRO');
    expect(normalizeScopeId(null)).toBe('AGRO');
    expect(normalizeScopeId('')).toBe('AGRO');
  });

  it('reconhece o escopo PET', () => {
    expect(normalizeScopeId('PET')).toBe('PET');
  });

  it('reconhece o escopo AGRO', () => {
    expect(normalizeScopeId('AGRO')).toBe('AGRO');
  });

  it('normaliza caixa e espaços', () => {
    expect(normalizeScopeId('pet')).toBe('PET');
    expect(normalizeScopeId('Pet')).toBe('PET');
    expect(normalizeScopeId('  PET  ')).toBe('PET');
    expect(normalizeScopeId('agro')).toBe('AGRO');
  });

  it('cai no padrão para escopos desconhecidos (comportamento documentado do seam)', () => {
    // Escopos novos só passam a existir quando entrarem em BrandScope.
    // Até lá, o fallback é silencioso e previsível — ver Fase 4 do roadmap.
    expect(normalizeScopeId('COAGRO_PET')).toBe('AGRO');
    expect(normalizeScopeId('EXPEDITO')).toBe('AGRO');
  });
});

describe('isPetScope', () => {
  it('identifica PET', () => {
    expect(isPetScope('PET')).toBe(true);
    expect(isPetScope('pet')).toBe(true);
  });

  it('não confunde AGRO nem ausência de valor com PET', () => {
    expect(isPetScope('AGRO')).toBe(false);
    expect(isPetScope(undefined)).toBe(false);
    expect(isPetScope(null)).toBe(false);
  });
});

describe('brandHasOwnLogo', () => {
  it('PET tem logotipo próprio; AGRO usa variantes da logo Coagro', () => {
    expect(brandHasOwnLogo('PET')).toBe(true);
    expect(brandHasOwnLogo('AGRO')).toBe(false);
    expect(brandHasOwnLogo(undefined)).toBe(false);
  });
});

describe('getPalette', () => {
  it('AGRO em fundo escuro: título branco e destaque ouro', () => {
    const p = getPalette('AGRO', false);
    expect(p.titleColor).toBe('text-white');
    expect(p.highlightColor).toBe('text-[#ffab00]');
    expect(p.titleFont).toContain('uppercase');
  });

  it('AGRO em fundo claro: título verde institucional', () => {
    const p = getPalette('AGRO', true);
    expect(p.titleColor).toBe('text-[#004d40]');
    expect(p.subtitleColor).toBe('text-gray-700');
  });

  it('PET: azul + laranja Pet, sem caixa alta forçada', () => {
    const p = getPalette('PET', false);
    expect(p.titleColor).toBe('text-[#4897D0]');
    expect(p.highlightColor).toBe('text-[#E96C2C]');
    expect(p.subtitleColor).toBe('text-gray-100');
    expect(p.titleFont).not.toContain('uppercase');
  });

  it('PET em fundo claro: alto contraste com azul escuro e subtítulo escuro', () => {
    const p = getPalette('PET', true);
    expect(p.titleColor).toBe('text-[#001C71]');
    expect(p.subtitleColor).toBe('text-gray-700');
    expect(p.highlightColor).toBe('text-[#E96C2C]');
  });

  it('PET em fundo escuro: azul claro e subtítulo claro', () => {
    const p = getPalette('PET', false);
    expect(p.titleColor).toBe('text-[#4897D0]');
    expect(p.subtitleColor).toBe('text-gray-100');
  });
});

describe('resolveLogoVariant', () => {
  it('fundo escuro usa a logo monocromática branca', () => {
    expect(resolveLogoVariant(false)).toBe('h-mono-branca');
  });

  it('fundo claro usa a logo azul', () => {
    expect(resolveLogoVariant(true)).toBe('h-azul');
  });

  it('a escolha manual do operador respeita segurança de contraste', () => {
    expect(resolveLogoVariant(false, 'h-branca')).toBe('h-branca');
    expect(resolveLogoVariant(true, 'v-azul')).toBe('v-azul');
    // Segurança: se operador pedir branca em fundo claro, forçado azul
    expect(resolveLogoVariant(true, 'h-mono-branca')).toBe('h-azul');
    // Segurança: se operador pedir azul em fundo escuro, forçado branca
    expect(resolveLogoVariant(false, 'h-azul')).toBe('h-mono-branca');
  });
});

describe('resolveBackgroundStyle', () => {
  it('tema azul publicitário tem precedência', () => {
    const s = resolveBackgroundStyle('AGRO', true, true);
    expect(s.background).toContain('#001C71');
  });

  it('AGRO escuro usa o verde institucional', () => {
    expect(resolveBackgroundStyle('AGRO', false, false).background).toContain('#004d40');
  });

  it('AGRO claro usa fundo branco/clean', () => {
    expect(resolveBackgroundStyle('AGRO', true, false).background).toContain('#ffffff');
  });

  it('PET escuro usa o azul Pet (não o verde do Agro)', () => {
    const pet = resolveBackgroundStyle('PET', false, false);
    expect(pet.background).toContain('#001C71');
    expect(pet.background).not.toContain('#004d40');
  });
});
