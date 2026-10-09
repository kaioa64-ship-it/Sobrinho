import { describe, it, expect } from 'vitest';
import {
  formatBrlValue,
  formatBrlWithSymbol,
  calculateSavings,
} from '../../src/lib/priceFormatter';
import {
  parsePriceToFloat,
  normalizeAgroPrice,
  extractPriceFromText,
} from '../../src/lib/priceParser';

/**
 * A moeda é o dado mais sensível do produto: um preço errado no cartaz é um
 * problema comercial. Estes testes travam as regras brasileiras (vírgula como
 * decimal, ponto como milhar) e a regra de coerência DE > POR.
 */

describe('formatBrlValue', () => {
  it('valor inteiro ganha ",00"', () => {
    expect(formatBrlValue('359')).toBe('359,00');
    expect(formatBrlValue(58)).toBe('58,00');
  });

  it('aplica separador de milhar', () => {
    expect(formatBrlValue('1250')).toBe('1.250,00');
    expect(formatBrlValue('1992')).toBe('1.992,00');
  });

  it('ponto com 1-2 casas é tratado como decimal', () => {
    expect(formatBrlValue('359.9')).toBe('359,90');
    expect(formatBrlValue('359.50')).toBe('359,50');
  });

  it('ponto com 3 casas é tratado como separador de milhar', () => {
    expect(formatBrlValue('1.250')).toBe('1.250,00');
  });

  it('preserva a vírgula decimal informada', () => {
    expect(formatBrlValue('359,90')).toBe('359,90');
    expect(formatBrlValue('45,9')).toBe('45,90');
    expect(formatBrlValue('1.250,00')).toBe('1.250,00');
  });

  it('remove o símbolo R$', () => {
    expect(formatBrlValue('R$ 1.250,90')).toBe('1.250,90');
    expect(formatBrlValue('r$ 45,9')).toBe('45,90');
  });

  it('é idempotente para valor já formatado', () => {
    const once = formatBrlValue('1250,5');
    expect(formatBrlValue(once)).toBe(once);
  });

  it('devolve string vazia para entrada ausente ou sem dígitos', () => {
    expect(formatBrlValue(undefined)).toBe('');
    expect(formatBrlValue(null)).toBe('');
    expect(formatBrlValue('')).toBe('');
    expect(formatBrlValue('   ')).toBe('');
    expect(formatBrlValue('abc')).toBe('');
    expect(formatBrlValue('R$')).toBe('');
  });
});

describe('formatBrlWithSymbol', () => {
  it('prefixa R$ apenas quando há valor', () => {
    expect(formatBrlWithSymbol('1250')).toBe('R$ 1.250,00');
    expect(formatBrlWithSymbol('45,9')).toBe('R$ 45,90');
  });

  it('não produz "R$ " solto quando o valor é inválido', () => {
    expect(formatBrlWithSymbol('')).toBe('');
    expect(formatBrlWithSymbol('abc')).toBe('');
    expect(formatBrlWithSymbol(undefined)).toBe('');
  });
});

describe('calculateSavings', () => {
  it('calcula a economia quando o preço antigo é maior', () => {
    expect(calculateSavings('1250', '1950')).toBe('700,00');
    expect(calculateSavings('44,00', '58,00')).toBe('14,00');
  });

  it('aplica separador de milhar na economia', () => {
    expect(calculateSavings('1000', '2500')).toBe('1.500,00');
  });

  it('devolve vazio quando não há economia real', () => {
    expect(calculateSavings('1950', '1250')).toBe('');
    expect(calculateSavings('100', '100')).toBe('');
  });

  it('devolve vazio quando falta um dos valores', () => {
    expect(calculateSavings('', '1950')).toBe('');
    expect(calculateSavings('1250', '')).toBe('');
    expect(calculateSavings(undefined, undefined)).toBe('');
  });
});

describe('parsePriceToFloat', () => {
  it('converte BRL para número', () => {
    expect(parsePriceToFloat('1.250,90')).toBeCloseTo(1250.9, 2);
    expect(parsePriceToFloat('R$ 1.992,00')).toBeCloseTo(1992, 2);
    expect(parsePriceToFloat('1992')).toBeCloseTo(1992, 2);
    expect(parsePriceToFloat('45,90')).toBeCloseTo(45.9, 2);
  });

  it('devolve 0 para entrada inválida', () => {
    expect(parsePriceToFloat(undefined)).toBe(0);
    expect(parsePriceToFloat(null)).toBe(0);
    expect(parsePriceToFloat('')).toBe(0);
    expect(parsePriceToFloat('abc')).toBe(0);
  });
});

describe('normalizeAgroPrice', () => {
  it('sem vírgula: trata como inteiro com ,00 (regra estrita Coagro)', () => {
    expect(normalizeAgroPrice('1992')).toBe('1.992,00');
    expect(normalizeAgroPrice('3890')).toBe('3.890,00');
    expect(normalizeAgroPrice('39')).toBe('39,00');
  });

  it('com vírgula: mantém os centavos exatos', () => {
    expect(normalizeAgroPrice('1575,50')).toBe('1.575,50');
    expect(normalizeAgroPrice('45,9')).toBe('45,90');
    expect(normalizeAgroPrice('3190,50')).toBe('3.190,50');
  });

  it('ponto de milhar em PT-BR vira inteiro com ,00', () => {
    expect(normalizeAgroPrice('R$ 1.992')).toBe('1.992,00');
  });

  it('ponto decimal americano é respeitado', () => {
    expect(normalizeAgroPrice('1575.50')).toBe('1.575,50');
  });

  it('devolve vazio para entrada inválida', () => {
    expect(normalizeAgroPrice(undefined)).toBe('');
    expect(normalizeAgroPrice(null)).toBe('');
    expect(normalizeAgroPrice('')).toBe('');
    expect(normalizeAgroPrice('abc')).toBe('');
  });
});

describe('extractPriceFromText', () => {
  it('sem texto ou sem números, não há preço', () => {
    expect(extractPriceFromText('')).toEqual({ hasPrice: false });
    expect(extractPriceFromText(null)).toEqual({ hasPrice: false });
    expect(extractPriceFromText('Ração Premium para cães')).toEqual({ hasPrice: false });
  });

  it('descarta grandezas técnicas e códigos de modelo', () => {
    // 2HP, 220V, 30L são grandezas; TR30 é código de modelo. Nada é preço.
    expect(extractPriceFromText('Triturador TR30 2HP 220V 30L').hasPrice).toBe(false);
  });

  it('reconhece um preço único', () => {
    const r = extractPriceFromText('Pulverizador XP16 por 1992');
    expect(r.hasPrice).toBe(true);
    expect(r.valorPor).toBe('1.992,00');
    expect(r.valorDe).toBeUndefined();
  });

  it('aplica a regra de coerência: o MAIOR valor é sempre o "de"', () => {
    const r = extractPriceFromText('de 1575 por 1992');
    expect(r.hasPrice).toBe(true);
    expect(r.valorDe).toBe('1.992,00');
    expect(r.valorPor).toBe('1.575,00');
  });

  it('corrige a ordem invertida na frase (de/por trocados)', () => {
    const r = extractPriceFromText('por 1992 de 1575');
    expect(r.valorDe).toBe('1.992,00');
    expect(r.valorPor).toBe('1.575,00');
  });

  it('reconhece valores com R$ e separador de milhar', () => {
    const r = extractPriceFromText('de R$ 1.992,00 por R$ 1.575,00');
    expect(r.valorDe).toBe('1.992,00');
    expect(r.valorPor).toBe('1.575,00');
  });

  it('extrai a condição de pagamento parcelada junto do preço', () => {
    const r = extractPriceFromText('Ração Golden 1992 em 10x de 180');
    expect(r.hasPrice).toBe(true);
    expect(r.valorPor).toBe('1.992,00');
    expect(r.condicoes).toContain('EM 10X DE R$ 180,00');
  });

  it('extrai condição à vista / pix', () => {
    const r = extractPriceFromText('Ração Golden 1992 à vista no pix');
    expect(r.hasPrice).toBe(true);
    expect(r.valorPor).toBe('1.992,00');
  });

  /**
   * Multiplicador de parcelas NÃO é preço (defeito corrigido).
   *
   * Antes, em "10x de 180" o parser descartava o VALOR da parcela (180) mas
   * promovia o MULTIPLICADOR (10) a preço principal, devolvendo
   * `valorPor: '10,00'` — um preço que não existe no texto.
   *
   * A correção mascara expressões de parcelamento antes da varredura de
   * candidatos (ver `maskNonPriceSegments` em src/lib/priceParser.ts).
   */
  it('não trata o multiplicador de parcelas como preço', () => {
    expect(extractPriceFromText('10x de 180').hasPrice).toBe(false);
  });

  it('não confunde a contagem de parcelas com preço mesmo havendo produto', () => {
    expect(extractPriceFromText('Ração Golden 10x de 180').hasPrice).toBe(false);
  });

  it('não trata o multiplicador como preço em "em até 12x sem juros"', () => {
    expect(extractPriceFromText('Ração Golden em até 12x sem juros').hasPrice).toBe(false);
  });
});
