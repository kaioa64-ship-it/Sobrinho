import { describe, it, expect } from 'vitest';
import { resolveDefaultTemplate } from '../../src/lib/layoutRules';

/**
 * `resolveDefaultTemplate` é a "seleção defensiva" de layout usada ao alternar
 * de escopo ou de formato (App.tsx). Ela precisa respeitar o escopo por igual,
 * inclusive quando ele chega em caixa baixa.
 *
 * Nota de arquitetura (Fase 4): hoje esta função devolve templates *duplicados
 * por marca* (HeroCentral vs PetCentral). A convergência para um template único
 * + paleta do tenant está mapeada em ANALISE_COAGRO_STUDIO.md §6.4.
 */

describe('resolveDefaultTemplate', () => {
  it('PET em Story usa o template central do Pet', () => {
    expect(resolveDefaultTemplate('story', 'PET')).toBe('pet-central');
  });

  it('PET em Feed usa o template split do Pet', () => {
    expect(resolveDefaultTemplate('feed-quadrado', 'PET')).toBe('pet-split-vertical');
    expect(resolveDefaultTemplate('feed-retrato', 'PET')).toBe('pet-split-vertical');
  });

  it('AGRO em Story usa o HeroCentral', () => {
    expect(resolveDefaultTemplate('story', 'AGRO')).toBe('hero-central');
  });

  it('AGRO em Feed usa o SplitVertical', () => {
    expect(resolveDefaultTemplate('feed-quadrado', 'AGRO')).toBe('split-vertical');
  });

  it('sem escopo informado assume AGRO', () => {
    expect(resolveDefaultTemplate('story')).toBe('hero-central');
    expect(resolveDefaultTemplate('feed-quadrado')).toBe('split-vertical');
  });

  it('aceita o escopo em caixa baixa (normalização)', () => {
    expect(resolveDefaultTemplate('story', 'pet')).toBe('pet-central');
    expect(resolveDefaultTemplate('story', 'agro')).toBe('hero-central');
  });

  it('escopo desconhecido cai no comportamento AGRO', () => {
    expect(resolveDefaultTemplate('story', 'MARCA_X')).toBe('hero-central');
  });

  it('nunca devolve um template de mascote (reservados — ver roadmap §3)', () => {
    const formats = ['story', 'feed-quadrado', 'feed-retrato', 'a4-retrato'];
    const scopes = ['AGRO', 'PET', undefined];
    for (const f of formats) {
      for (const s of scopes) {
        expect(resolveDefaultTemplate(f, s)).not.toContain('mascot');
      }
    }
  });
});
