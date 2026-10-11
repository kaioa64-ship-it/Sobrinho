import { describe, it, expect } from 'vitest';
import { calculateDiscount, parseBrlToNumber } from '../../src/lib/priceCalculator';

describe('priceCalculator', () => {
  it('converte strings BRL para número corretamente', () => {
    expect(parseBrlToNumber('58,00')).toBe(58);
    expect(parseBrlToNumber('R$ 129,90')).toBe(129.9);
    expect(parseBrlToNumber('1.250,50')).toBe(1250.5);
    expect(parseBrlToNumber('')).toBe(0);
    expect(parseBrlToNumber(null)).toBe(0);
  });

  it('calcula desconto e economia de 58,00 para 44,00 corretamente (24% OFF)', () => {
    const res = calculateDiscount('58,00', '44,00');
    expect(res).not.toBeNull();
    expect(res?.percent).toBe(24);
    expect(res?.savingsBrl).toBe('14,00');
    expect(res?.badgeText).toBe('24% OFF');
  });

  it('calcula desconto de 159,90 para 129,90 corretamente (19% OFF)', () => {
    const res = calculateDiscount('159,90', '129,90');
    expect(res).not.toBeNull();
    expect(res?.percent).toBe(19);
    expect(res?.savingsBrl).toBe('30,00');
    expect(res?.badgeText).toBe('19% OFF');
  });

  it('retorna null se preço de for menor ou igual ao preço por', () => {
    expect(calculateDiscount('50,00', '50,00')).toBeNull();
    expect(calculateDiscount('40,00', '50,00')).toBeNull();
  });

  it('retorna null se qualquer valor for zero ou inválido', () => {
    expect(calculateDiscount('0,00', '40,00')).toBeNull();
    expect(calculateDiscount('50,00', '0,00')).toBeNull();
    expect(calculateDiscount('', '')).toBeNull();
  });
});
