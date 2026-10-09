import { describe, it, expect } from 'vitest';
import {
  cleanNoise,
  normalizeBenefit,
  normalizeBenefits,
  resolveDefaultCta,
} from '../../src/lib/contentNormalizer';

/**
 * Normalização de textos vindos da IA/usuário antes de renderizar.
 *
 * A IA às vezes devolve ruído (ex.: "Divisão Agropecuária"), frases longas ou
 * tipos errados (string onde deveria ser lista). Esta camada protege o layout
 * de quebrar e é a última barreira antes do canvas.
 */

describe('cleanNoise', () => {
  it('remove o ruído "Divisão Agropecuária" (com e sem acento)', () => {
    expect(cleanNoise('Divisão Agropecuária')).toBe('');
    expect(cleanNoise('Divisao Agropecuaria')).toBe('');
    expect(cleanNoise('Divisão Agropecuária Ração Golden')).toBe('Ração Golden');
  });

  it('colapsa espaços repetidos e apara as pontas', () => {
    expect(cleanNoise('  muito    espaço  ')).toBe('muito espaço');
  });

  it('lida com entrada ausente', () => {
    expect(cleanNoise(undefined)).toBe('');
    expect(cleanNoise(null)).toBe('');
  });

  it('converte valores não-string', () => {
    expect(cleanNoise(0)).toBe('0');
  });
});

describe('normalizeBenefit', () => {
  it('remove pontuação final do item', () => {
    expect(normalizeBenefit('Item 1.')).toBe('Item 1');
    expect(normalizeBenefit('Item 1,')).toBe('Item 1');
    expect(normalizeBenefit('Item 1;')).toBe('Item 1');
  });

  it('aplica a limpeza de ruído antes', () => {
    expect(normalizeBenefit('  Divisão Agropecuária  ')).toBe('');
  });
});

describe('normalizeBenefits', () => {
  it('limita a lista a 3 itens (limite do layout)', () => {
    expect(normalizeBenefits(['a', 'b', 'c', 'd'])).toEqual(['a', 'b', 'c']);
  });

  it('descarta itens vazios da lista', () => {
    expect(normalizeBenefits(['a', '', '  ', 'b'])).toEqual(['a', 'b']);
  });

  it('aceita string única vinda da IA por engano', () => {
    expect(normalizeBenefits('Item único')).toEqual(['Item único']);
  });

  it('devolve lista vazia para entradas ausentes ou de tipo inesperado', () => {
    expect(normalizeBenefits(undefined)).toEqual([]);
    expect(normalizeBenefits(null)).toEqual([]);
    expect(normalizeBenefits({})).toEqual([]);
    expect(normalizeBenefits(42)).toEqual([]);
  });

  /**
   * ⚠️ COMPORTAMENTO DE BORDA (não é o ideal, mas é o atual):
   * quando a entrada é uma string, o ramo de string devolve o array SEM passar
   * pelo `filter(Boolean)` — então uma string só com espaços vira `['']` em vez
   * de `[]`. Isso pode gerar um bullet vazio no layout.
   * Se for corrigido, este teste vai falhar de propósito.
   */
  it('string em branco vira [""] em vez de [] (quirk documentado)', () => {
    expect(normalizeBenefits('   ')).toEqual(['']);
  });
});

describe('resolveDefaultCta', () => {
  it('CTA por modo de comunicação', () => {
    expect(resolveDefaultCta('PROMOTION')).toBe('GARANTA JÁ O SEU');
    expect(resolveDefaultCta('SINGLE_PRICE')).toBe('CONSULTE DISPONIBILIDADE');
    expect(resolveDefaultCta('INFORMATIVE')).toBe('SAIBA MAIS');
  });

  it('CTA informativo para categoria veterinária', () => {
    expect(resolveDefaultCta('INFORMATIVE', 'Vacinas & Sanidade')).toBe('FALE COM NOSSA EQUIPE');
    expect(resolveDefaultCta('INFORMATIVE', 'Veterinária')).toBe('FALE COM NOSSA EQUIPE');
  });

  it('categoria irrelevante mantém o CTA informativo padrão', () => {
    expect(resolveDefaultCta('INFORMATIVE', 'Pet')).toBe('SAIBA MAIS');
    expect(resolveDefaultCta('INFORMATIVE', 'Equipamentos')).toBe('SAIBA MAIS');
  });

  it('o modo tem precedência sobre a categoria', () => {
    expect(resolveDefaultCta('PROMOTION', 'Vacinas')).toBe('GARANTA JÁ O SEU');
    expect(resolveDefaultCta('SINGLE_PRICE', 'Veterinária')).toBe('CONSULTE DISPONIBILIDADE');
  });
});
