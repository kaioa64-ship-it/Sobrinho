import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveProductToStorage,
  getProductFromStorage,
  clearMemoryStorage,
  pruneExpiredProducts,
  getStorageStats,
  STORAGE_SCHEMA_VERSION,
} from '../../src/lib/productStorage';

describe('productStorageVersioning — Versionamento de Cache e TTL Pruning', () => {
  beforeEach(() => {
    clearMemoryStorage();
  });

  it('grava novos produtos com STORAGE_SCHEMA_VERSION', async () => {
    await saveProductToStorage({
      codigo: 'SKU_VER_1',
      nome: 'PRODUTO TESTE VERSAO',
      updatedAt: Date.now(),
    });

    const stored = await getProductFromStorage('SKU_VER_1');
    expect(stored).not.toBeNull();
    expect(stored?.schemaVersion).toBe(STORAGE_SCHEMA_VERSION);
    expect(stored?.schemaVersion).toBe(2);
  });

  it('retorna estatísticas corretas do storage via getStorageStats', async () => {
    const now = Date.now();
    await saveProductToStorage({
      codigo: 'SKU_STAT_1',
      nome: 'PRODUTO 1',
      updatedAt: now - 5000,
    });
    await saveProductToStorage({
      codigo: 'SKU_STAT_2',
      nome: 'PRODUTO 2',
      updatedAt: now,
    });

    const stats = await getStorageStats();
    expect(stats.totalCount).toBeGreaterThanOrEqual(2);
    expect(stats.memoryCount).toBeGreaterThanOrEqual(2);
    expect(stats.schemaVersion).toBe(2);
    expect(stats.oldestUpdatedAt).not.toBeNull();
    expect(stats.newestUpdatedAt).not.toBeNull();
  });

  it('expurga registros com mais de X dias via pruneExpiredProducts (TTL híbrido)', async () => {
    const now = Date.now();
    const fortyFiveDaysAgo = now - 45 * 24 * 60 * 60 * 1000;
    const tenDaysAgo = now - 10 * 24 * 60 * 60 * 1000;

    // Salva produto recente (10 dias atrás)
    await saveProductToStorage({
      codigo: 'RECENT_SKU',
      nome: 'PRODUTO RECENTE',
      updatedAt: tenDaysAgo,
    });

    // Salva produto antigo e força timestamp de 45 dias atrás
    await saveProductToStorage({
      codigo: 'OLD_SKU',
      nome: 'PRODUTO ANTIGO',
      updatedAt: fortyFiveDaysAgo,
    });
    // Força updatedAt antigo no storage para simular passagem do tempo
    const oldItem = await getProductFromStorage('OLD_SKU');
    if (oldItem) {
      oldItem.updatedAt = fortyFiveDaysAgo;
    }

    // Executa expurgo com TTL de 30 dias
    const prunedCount = await pruneExpiredProducts(30);

    expect(prunedCount).toBe(1);

    const oldRetrieved = await getProductFromStorage('OLD_SKU');
    const recentRetrieved = await getProductFromStorage('RECENT_SKU');

    expect(oldRetrieved).toBeNull();
    expect(recentRetrieved).not.toBeNull();
    expect(recentRetrieved?.codigo).toBe('RECENT_SKU');
  });
});
