import { describe, it, expect } from 'vitest';
import { resolveCommunicationMode } from '../../src/lib/communicationMode';

/**
 * O Modo de Comunicação define qual template e quais blocos a arte mostra
 * (promoção com DE/POR, preço único ou informativo sem preço).
 *
 * Ele é o gate do roteamento automático de template — se ele errar, uma arte
 * promocional pode sair sem o preço, ou uma arte informativa pode aparecer com
 * um módulo de preço vazio. Por isso a precedência é travada aqui.
 */

describe('resolveCommunicationMode — tipo explícito', () => {
  it('reconhece promoção em todas as grafias', () => {
    expect(resolveCommunicationMode('promocao', undefined)).toBe('PROMOTION');
    expect(resolveCommunicationMode('promoção', undefined)).toBe('PROMOTION');
    expect(resolveCommunicationMode('promotion', undefined)).toBe('PROMOTION');
  });

  it('reconhece preço único em todas as grafias', () => {
    expect(resolveCommunicationMode('preco-unico', undefined)).toBe('SINGLE_PRICE');
    expect(resolveCommunicationMode('preço-único', undefined)).toBe('SINGLE_PRICE');
    expect(resolveCommunicationMode('single-price', undefined)).toBe('SINGLE_PRICE');
  });

  it('reconhece informativo em todas as grafias', () => {
    expect(resolveCommunicationMode('informativo', undefined)).toBe('INFORMATIVE');
    expect(resolveCommunicationMode('informative', undefined)).toBe('INFORMATIVE');
    expect(resolveCommunicationMode('informativo_novidade', undefined)).toBe('INFORMATIVE');
  });

  it('ignora caixa e espaços do tipo informado', () => {
    expect(resolveCommunicationMode('  PROMOCAO  ', undefined)).toBe('PROMOTION');
    expect(resolveCommunicationMode('Single-Price', undefined)).toBe('SINGLE_PRICE');
  });

  it('o tipo explícito tem precedência sobre os preços preenchidos', () => {
    const comDoisPrecos = { ativo: true, valor_de: '1992', valor_por: '1575' };
    expect(resolveCommunicationMode('informativo', comDoisPrecos)).toBe('INFORMATIVE');
    expect(resolveCommunicationMode('preco-unico', comDoisPrecos)).toBe('SINGLE_PRICE');
  });
});

describe('resolveCommunicationMode — inferência pelos preços', () => {
  it('DE + POR ativos => promoção', () => {
    expect(
      resolveCommunicationMode(undefined, { ativo: true, valor_de: '1992', valor_por: '1575' })
    ).toBe('PROMOTION');
  });

  it('apenas POR ativo => preço único', () => {
    expect(resolveCommunicationMode(undefined, { ativo: true, valor_por: '1575' })).toBe(
      'SINGLE_PRICE'
    );
  });

  it('módulo de preço inativo => informativo', () => {
    expect(
      resolveCommunicationMode(undefined, { ativo: false, valor_de: '1992', valor_por: '1575' })
    ).toBe('INFORMATIVE');
  });

  it('sem módulo de preço => informativo', () => {
    expect(resolveCommunicationMode(undefined, undefined)).toBe('INFORMATIVE');
    expect(resolveCommunicationMode(undefined, {})).toBe('INFORMATIVE');
    expect(resolveCommunicationMode(undefined, { ativo: true })).toBe('INFORMATIVE');
  });

  it('valores só com espaços não contam como preço preenchido', () => {
    expect(
      resolveCommunicationMode(undefined, { ativo: true, valor_de: '   ', valor_por: '1575' })
    ).toBe('SINGLE_PRICE');
  });

  it('tipo desconhecido cai na inferência pelos preços', () => {
    expect(
      resolveCommunicationMode('tipo-inexistente', { ativo: true, valor_por: '99' })
    ).toBe('SINGLE_PRICE');
    expect(resolveCommunicationMode('tipo-inexistente', undefined)).toBe('INFORMATIVE');
  });
});
