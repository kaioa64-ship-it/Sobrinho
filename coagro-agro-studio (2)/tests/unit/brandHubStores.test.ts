import { describe, it, expect } from 'vitest';
import { COAGRO_STORES, COAGRO_CORPORATE_INFO, CoagroStore } from '../../src/data/coagroStores';

describe('Brand Hub - Catálogo Oficial de Filiais e Unidades Coagro', () => {
  it('deve conter as 12 filiais operacionais de varejo do Grupo Coagro', () => {
    const filiais = COAGRO_STORES.filter(s => s.tipo !== 'corporativo');
    expect(filiais.length).toBeGreaterThanOrEqual(12);
  });

  it('deve conter a Matriz Administrativa com o CNPJ oficial 0001-60', () => {
    const matriz = COAGRO_STORES.find(s => s.id === 'matriz-adm');
    expect(matriz).toBeDefined();
    expect(matriz?.cnpj).toBe('02.895.028/0001-60');
    expect(COAGRO_CORPORATE_INFO.cnpjMatriz).toBe('02.895.028/0001-60');
  });

  it('cada unidade cadastrada deve possuir ID único e CNPJ formatado', () => {
    const ids = new Set<string>();

    COAGRO_STORES.forEach((store: CoagroStore) => {
      expect(store.id).toBeTruthy();
      expect(ids.has(store.id)).toBe(false);
      ids.add(store.id);

      expect(store.nome).toBeTruthy();
      expect(store.razaoSocial).toBeTruthy();
      expect(store.cidade).toBeTruthy();
      expect(store.estado).toMatch(/^(AL|SE|BA)$/);
      expect(store.endereco).toBeTruthy();
      expect(store.cep).toMatch(/^\d{5}-\d{3}$/);
      expect(store.cnpj).toMatch(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/);
      expect(store.telefone).toBeTruthy();
      expect(store.telefoneFormatado).toBeTruthy();
    });
  });

  it('as informações corporativas oficiais devem apontar para grupocoagro.com.br', () => {
    expect(COAGRO_CORPORATE_INFO.emailDomain).toBe('grupocoagro.com.br');
    expect(COAGRO_CORPORATE_INFO.website).toBe('www.grupocoagro.com.br');
    expect(COAGRO_CORPORATE_INFO.instagram).toBe('@grupocoagro');
  });

  it('deve cobrir as 3 praças estaduais de atuação da Coagro (AL, SE, BA)', () => {
    const estados = new Set(COAGRO_STORES.map(s => s.estado));
    expect(estados.has('AL')).toBe(true);
    expect(estados.has('SE')).toBe(true);
    expect(estados.has('BA')).toBe(true);
  });
});
