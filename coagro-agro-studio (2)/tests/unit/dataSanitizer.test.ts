import { describe, it, expect } from 'vitest';
import {
  removeLeadingInternalCodes,
  expandCommercialAbbreviations,
  smartTitleCase,
  formatBrlStrict,
  sanitizeProductName,
  validateProductRow,
} from '../../src/lib/dataSanitizer';

/**
 * Higienização de nomes de produto vindos do ERP/planilha.
 *
 * É a camada que transforma uma linha crua ("00123/ bco 15kg cx") em algo
 * imprimível num cartaz ("Branco 15kg Caixa"). Errar aqui aparece direto na
 * gôndola, então as regras de título, siglas e unidades ficam travadas.
 */

describe('removeLeadingInternalCodes', () => {
  it('remove código numérico com separador', () => {
    expect(removeLeadingInternalCodes('12345 - Ração Golden 15kg')).toBe('Ração Golden 15kg');
  });

  it('remove código seguido de barra', () => {
    expect(removeLeadingInternalCodes('00123/ Semente Milho')).toBe('Semente Milho');
  });

  it('remove código entre colchetes ou parênteses', () => {
    expect(removeLeadingInternalCodes('[0491] Arame Belgo')).toBe('Arame Belgo');
    expect(removeLeadingInternalCodes('(0491) Arame Belgo')).toBe('Arame Belgo');
  });

  it('remove código alfanumérico com prefixo explícito', () => {
    expect(removeLeadingInternalCodes('COD123 - Ração')).toBe('Ração');
    expect(removeLeadingInternalCodes('REF 998: Arame')).toBe('Arame');
  });

  it('preserva textos sem código inicial', () => {
    expect(removeLeadingInternalCodes('Ração Golden')).toBe('Ração Golden');
  });

  it('não remove números curtos (exige 3+ dígitos)', () => {
    expect(removeLeadingInternalCodes('12 - Ração')).toBe('12 - Ração');
  });

  it('lida com entrada vazia', () => {
    expect(removeLeadingInternalCodes('')).toBe('');
  });
});

describe('expandCommercialAbbreviations', () => {
  it('expande siglas de embalagem e cor', () => {
    expect(expandCommercialAbbreviations('Ração 15kg CX')).toBe('Ração 15kg Caixa');
    expect(expandCommercialAbbreviations('BCO')).toBe('Branco');
    expect(expandCommercialAbbreviations('PCT')).toBe('Pacote');
  });

  it('expande os atalhos C/ P/ S/', () => {
    expect(expandCommercialAbbreviations('C/ TAMPA')).toBe('Com TAMPA');
    expect(expandCommercialAbbreviations('P/ CÃES')).toBe('Para CÃES');
    expect(expandCommercialAbbreviations('S/ SAL')).toBe('Sem SAL');
  });

  it('preserva palavras que não são abreviações', () => {
    expect(expandCommercialAbbreviations('Ração Golden')).toBe('Ração Golden');
  });

  it('lida com entrada vazia', () => {
    expect(expandCommercialAbbreviations('')).toBe('');
  });
});

describe('smartTitleCase', () => {
  it('capitaliza palavras e mantém unidades técnicas', () => {
    expect(smartTitleCase('ração golden special 15kg')).toBe('Ração Golden Special 15kg');
  });

  it('mantém conectivos em minúsculas no meio da frase', () => {
    expect(smartTitleCase('arame de aço')).toBe('Arame de Aço');
  });

  it('capitaliza o conectivo quando é a primeira palavra', () => {
    expect(smartTitleCase('de milho')).toBe('De Milho');
  });

  it('preserva siglas estritas em maiúsculas', () => {
    expect(smartTitleCase('led')).toBe('LED');
    expect(smartTitleCase('xp16')).toBe('XP16');
  });

  it('normaliza códigos de modelo e grandezas', () => {
    expect(smartTitleCase('triturador tr-30 2hp')).toBe('Triturador TR-30 2HP');
    expect(smartTitleCase('motor 220v')).toBe('Motor 220V');
  });

  it('preserva pontuação anexada à palavra', () => {
    expect(smartTitleCase('milho, seco')).toBe('Milho, Seco');
  });

  it('lida com entrada vazia', () => {
    expect(smartTitleCase('')).toBe('');
    expect(smartTitleCase('   ')).toBe('');
  });
});

describe('formatBrlStrict', () => {
  it('formata número com 2 casas no padrão pt-BR', () => {
    expect(formatBrlStrict(44.5)).toBe('44,50');
    expect(formatBrlStrict('44.5')).toBe('44,50');
    expect(formatBrlStrict('159,9')).toBe('159,90');
  });

  it('trata separador de milhar em ambos os formatos', () => {
    expect(formatBrlStrict('1.250,00')).toBe('1.250,00');
    expect(formatBrlStrict('1,250.00')).toBe('1.250,00');
  });

  it('remove o símbolo R$', () => {
    expect(formatBrlStrict('R$ 44,90')).toBe('44,90');
  });

  it('devolve vazio para valor ausente, zero, negativo ou inválido', () => {
    expect(formatBrlStrict(null)).toBe('');
    expect(formatBrlStrict(undefined)).toBe('');
    expect(formatBrlStrict('')).toBe('');
    expect(formatBrlStrict(0)).toBe('');
    expect(formatBrlStrict('0')).toBe('');
    expect(formatBrlStrict(-5)).toBe('');
    expect(formatBrlStrict('abc')).toBe('');
  });
});

describe('sanitizeProductName', () => {
  it('aplica o pipeline completo (código + siglas + título)', () => {
    expect(sanitizeProductName('12345 - ração golden special 15kg')).toBe('Ração Golden Special 15kg');
    expect(sanitizeProductName('00123/ bco 15kg cx')).toBe('Branco 15kg Caixa');
  });

  it('remove pontuação solta no final', () => {
    expect(sanitizeProductName('Arame Belgo -')).toBe('Arame Belgo');
  });

  it('lida com entrada vazia', () => {
    expect(sanitizeProductName('')).toBe('');
  });
});

describe('validateProductRow', () => {
  it('rejeita linha sem nome do produto', () => {
    expect(validateProductRow('123', '', '10')).toEqual({
      isValid: false,
      reason: 'Nome do produto ausente',
    });
  });

  it('rejeita nome curto demais após higienização', () => {
    expect(validateProductRow('123', 'X', '10')).toEqual({
      isValid: false,
      reason: 'Nome do produto muito curto ou inválido',
    });
  });

  it('rejeita preço promocional inválido ou zero', () => {
    expect(validateProductRow('123', 'Ração Golden', '0')).toEqual({
      isValid: false,
      reason: 'Preço promocional inválido ou zero',
    });
  });

  it('aceita linha válida', () => {
    expect(validateProductRow('123', 'Ração Golden', '44,90')).toEqual({ isValid: true });
  });

  it('não exige código para considerar a linha válida', () => {
    // O código é usado para compor o cartaz, mas não invalida a linha.
    expect(validateProductRow(undefined, 'Ração Golden', '44,90')).toEqual({ isValid: true });
  });
});
