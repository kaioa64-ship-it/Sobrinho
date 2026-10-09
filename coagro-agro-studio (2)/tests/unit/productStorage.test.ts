import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveProductToStorage,
  getProductFromStorage,
  deleteProductFromStorage,
  getAllStoredProducts,
  findProductBySku,
  StoredProduct,
} from '../../src/lib/productStorage';

describe('productStorage — Cache Local de Produtos por SKU', () => {
  const mockProduct: StoredProduct = {
    codigo: '998877',
    nome: 'ADUBO ESPECIAL NPK 20-05-20',
    subtitulo: 'Nutrição Máxima para o Milho',
    valorDe: '180,00',
    valorPor: '145,00',
    imagemRecortada: 'data:image/png;base64,mockRecorte123',
    diferenciais: ['Ação Rápida', 'Maior Rendimento'],
    templateLayout: 'hero-central',
    updatedAt: Date.now(),
  };

  beforeEach(async () => {
    await deleteProductFromStorage('998877');
    await deleteProductFromStorage('112233');
  });

  it('salva e recupera um produto por código no storage local', async () => {
    await saveProductToStorage(mockProduct);
    const retrieved = await getProductFromStorage('998877');

    expect(retrieved).not.toBeNull();
    expect(retrieved?.codigo).toBe('998877');
    expect(retrieved?.nome).toBe('ADUBO ESPECIAL NPK 20-05-20');
    expect(retrieved?.imagemRecortada).toBe('data:image/png;base64,mockRecorte123');
    expect(retrieved?.valorPor).toBe('145,00');
  });

  it('exclui um produto do storage local com sucesso', async () => {
    await saveProductToStorage(mockProduct);
    await deleteProductFromStorage('998877');

    const retrieved = await getProductFromStorage('998877');
    expect(retrieved).toBeNull();
  });

  it('lista todos os produtos armazenados no cache da loja', async () => {
    await saveProductToStorage(mockProduct);
    await saveProductToStorage({
      codigo: '112233',
      nome: 'RAÇÃO PREMIUM FILHOTE 10KG',
      updatedAt: Date.now(),
    });

    const all = await getAllStoredProducts();
    const codes = all.map(p => p.codigo);
    expect(codes).toContain('998877');
    expect(codes).toContain('112233');
  });

  describe('findProductBySku — Busca inteligente com fallback', () => {
    it('retorna o produto do cache local quando ele já foi salvo pelo operador', async () => {
      await saveProductToStorage(mockProduct);
      const found = await findProductBySku('998877');

      expect(found).not.toBeNull();
      expect(found?.nome).toBe('ADUBO ESPECIAL NPK 20-05-20');
      expect(found?.imagemRecortada).toBe('data:image/png;base64,mockRecorte123');
    });

    it('faz fallback para o catálogo fixo e higieniza nome quando não está no cache local', async () => {
      // '67890' é o Pulverizador Jacto XP-16 no productDatabase
      const found = await findProductBySku('67890');

      expect(found).not.toBeNull();
      expect(found?.codigo).toBe('67890');
      expect(found?.nome).toContain('Pulverizador');
      expect(found?.templateLayout).toBe('hero-central');
    });

    it('recupera com sucesso o código de teste rápido 00 (Ração Golden Special 15kg Pet)', async () => {
      const found = await findProductBySku('00');

      expect(found).not.toBeNull();
      expect(found?.codigo).toBe('00');
      expect(found?.nome).toContain('Ração Golden Special');
      expect(found?.categoria).toBe('PET');
      expect(found?.valorDe).toBe('179,90');
      expect(found?.valorPor).toBe('144,90');
      expect(found?.templateLayout).toBe('whatsapp-status');
      expect(found?.imagemRecortada).toContain('data:image/svg+xml');
    });

    it('recupera com sucesso o código de teste rápido 01 (Pulverizador XP 16L Agro)', async () => {
      const found = await findProductBySku('01');

      expect(found).not.toBeNull();
      expect(found?.codigo).toBe('01');
      expect(found?.nome).toContain('Pulverizador Costal');
      expect(found?.categoria).toBe('AGRO');
      expect(found?.valorDe).toBe('299,90');
      expect(found?.valorPor).toBe('249,90');
      expect(found?.templateLayout).toBe('whatsapp-status');
    });

    it('retorna null para código inexistente ou vazio', async () => {
      const nonExistent = await findProductBySku('99999999999');
      expect(nonExistent).toBeNull();

      const empty = await findProductBySku('   ');
      expect(empty).toBeNull();
    });
  });
});
