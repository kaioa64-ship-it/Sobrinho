import { describe, it, expect } from 'vitest';
import { COAGRO_STORES, CoagroStore } from '../../src/data/coagroStores';

describe('Brand Hub - Catálogo Oficial de Filiais Coagro', () => {
  it('deve conter exatamente as 12 filiais operacionais do Grupo Coagro', () => {
    expect(COAGRO_STORES).toHaveLength(12);
  });

  it('cada filial deve possuir IDs únicos e campos obrigatórios preenchidos', () => {
    const ids = new Set<string>();
    const cnpjs = new Set<string>();

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
      expect(store.mapUrl).toMatch(/^https?:\/\//);

      // Não pode haver CNPJs repetidos entre lojas
      expect(cnpjs.has(store.cnpj)).toBe(false);
      cnpjs.add(store.cnpj);
    });
  });

  it('deve cobrir as 3 praças estaduais de atuação da Coagro (AL, SE, BA)', () => {
    const estados = new Set(COAGRO_STORES.map(s => s.estado));
    expect(estados.has('AL')).toBe(true);
    expect(estados.has('SE')).toBe(true);
    expect(estados.has('BA')).toBe(true);
  });

  it('as lojas de Arapiraca, Maceió, Aracaju e Paripiranga devem estar presentes', () => {
    const cidades = COAGRO_STORES.map(s => s.cidade);
    expect(cidades).toContain('Arapiraca');
    expect(cidades).toContain('Maceió');
    expect(cidades).toContain('Aracaju');
    expect(cidades).toContain('Paripiranga');
  });
});
