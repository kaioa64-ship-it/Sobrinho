import { describe, it, expect } from 'vitest';
import { sanitizeErpTitle } from '../../src/lib/erpSanitizer';

describe('erpSanitizer (Higienização de Títulos e Siglas de ERP)', () => {
  it('retorna string vazia para entradas nulas ou vazias', () => {
    expect(sanitizeErpTitle('')).toBe('');
    expect(sanitizeErpTitle(null as any)).toBe('');
    expect(sanitizeErpTitle(undefined as any)).toBe('');
  });

  it('expande abreviações comuns da divisão Pet', () => {
    const input = 'RAC TUTTICANIS SEL 10.1KG';
    const output = sanitizeErpTitle(input);
    expect(output).toBe('Ração Tutticanis Select 10.1 kg');
  });

  it('expande abreviações comuns da divisão Agropecuária', () => {
    const input = 'PULV AGR MANUAL 20L';
    const output = sanitizeErpTitle(input);
    expect(output).toBe('Pulverizador Agrícola Manual 20L');
  });

  it('preserva acrônimos técnicos em caixa alta (ex: NPK, PVC)', () => {
    const input = 'ADUB NPK 10-10-10 1KG';
    const output = sanitizeErpTitle(input);
    expect(output).toBe('Adubo NPK 10-10-10 1 kg');
  });

  it('mantém conectores e preposições em minúsculas', () => {
    const input = 'COLEIR DE COURO PARA CAO COM GUIA';
    const output = sanitizeErpTitle(input);
    expect(output).toBe('Coleira de Couro para Cão com Guia');
  });

  it('remove ruídos fiscais de NFe como asteriscos e espaços extras', () => {
    const input = '*** RACAO FILH CARN E ARROZ 15KG ***';
    const output = sanitizeErpTitle(input);
    expect(output).toBe('Ração Filhote Carne e Arroz 15 kg');
  });

  it('trata unidades com decimais e pontuações', () => {
    const input = 'INSET LIQUIDO 500ML';
    const output = sanitizeErpTitle(input);
    expect(output).toBe('Inseticida Líquido 500 ml');
  });

  it('trata defensivos com siglas de formulação (ex: SC, EC)', () => {
    const input = 'HERB GLIFOSATO 480 SC 1L';
    const output = sanitizeErpTitle(input);
    expect(output).toBe('Herbicida Glifosato 480 SC 1L');
  });
});
