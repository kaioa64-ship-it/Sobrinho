import { TemplateLayout } from '../types/agro';
import { getInternalProductByCode } from '../data/productDatabase';
import { sanitizeProductName } from './dataSanitizer';

export const STORAGE_SCHEMA_VERSION = 2;

export interface StoredProduct {
  codigo: string;
  nome: string;
  subtitulo?: string;
  imagemUrl?: string;
  imagemRecortada?: string;
  imagemOriginal?: string;
  valorDe?: string;
  valorPor?: string;
  diferenciais?: string[];
  templateLayout?: TemplateLayout;
  categoria?: 'AGRO' | 'PET';
  updatedAt: number;
  schemaVersion?: number;
}

const DB_NAME = 'CoagroStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'products';

// Memória cache local para fallback caso IndexedDB não esteja disponível (ex: Node/SSR/Vitest)
// Limite máximo de 80 produtos em memória RAM para prevenir Memory Leaks com base64
const MAX_MEMORY_CACHE_ITEMS = 80;
const memoryStore = new Map<string, StoredProduct>();

/**
 * Libera explicitamente o cache em memória RAM sob demanda
 */
export function clearMemoryStorage(): void {
  memoryStore.clear();
}

function getIndexedDB(): IDBFactory | null {
  if (typeof window !== 'undefined' && window.indexedDB) {
    return window.indexedDB;
  }
  return null;
}

function openDatabase(): Promise<IDBDatabase> {
  const idb = getIndexedDB();
  if (!idb) {
    return Promise.reject(new Error('IndexedDB não suportado neste ambiente.'));
  }

  return new Promise((resolve, reject) => {
    const request = idb.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'codigo' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Salva ou atualiza um produto no cache local (IndexedDB com fallback em memória)
 */
export async function saveProductToStorage(product: StoredProduct): Promise<void> {
  const sanitizedCode = String(product.codigo).trim();
  if (!sanitizedCode) return;

  const item: StoredProduct = {
    ...product,
    codigo: sanitizedCode,
    updatedAt: Date.now(),
    schemaVersion: STORAGE_SCHEMA_VERSION,
  };

  // Mantém controle de limite defensivo no Map de RAM
  if (memoryStore.size >= MAX_MEMORY_CACHE_ITEMS && !memoryStore.has(sanitizedCode)) {
    const oldestKey = memoryStore.keys().next().value;
    if (oldestKey) memoryStore.delete(oldestKey);
  }
  memoryStore.set(sanitizedCode, item);

  const idb = getIndexedDB();
  if (!idb) return;

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[productStorage] Erro ao gravar no IndexedDB, mantido em memória:', err);
  }
}

/**
 * Recupera um produto salvo pelo código
 */
export async function getProductFromStorage(codigo: string | number): Promise<StoredProduct | null> {
  const sanitizedCode = String(codigo).trim();
  if (!sanitizedCode) return null;

  const idb = getIndexedDB();
  if (!idb) {
    return memoryStore.get(sanitizedCode) || null;
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(sanitizedCode);

      request.onsuccess = () => {
        const result = (request.result as StoredProduct) || memoryStore.get(sanitizedCode) || null;
        resolve(result);
      };
      request.onerror = () => {
        resolve(memoryStore.get(sanitizedCode) || null);
      };
    });
  } catch {
    return memoryStore.get(sanitizedCode) || null;
  }
}

/**
 * Exclui um produto do cache local
 */
export async function deleteProductFromStorage(codigo: string | number): Promise<void> {
  const sanitizedCode = String(codigo).trim();
  if (!sanitizedCode) return;

  memoryStore.delete(sanitizedCode);

  const idb = getIndexedDB();
  if (!idb) return;

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(sanitizedCode);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[productStorage] Erro ao excluir do IndexedDB:', err);
  }
}

/**
 * Retorna todos os produtos armazenados no cache da loja
 */
export async function getAllStoredProducts(): Promise<StoredProduct[]> {
  const idb = getIndexedDB();
  if (!idb) {
    return Array.from(memoryStore.values());
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const list = (request.result as StoredProduct[]) || [];
        resolve(list);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return Array.from(memoryStore.values());
  }
}

/**
 * Busca inteligente por SKU:
 * 1. Procura no cache local do operador (IndexedDB).
 * 2. Se não encontrar, consulta o catálogo fixo e higieniza com regras de ERP.
 */
export async function findProductBySku(codigo: string | number): Promise<StoredProduct | null> {
  const codeStr = String(codigo).trim();
  if (!codeStr) return null;

  // 1. Tenta cache local
  const cached = await getProductFromStorage(codeStr);
  if (cached) return cached;

  // 2. Consulta catálogo interno
  const internal = getInternalProductByCode(codeStr);
  if (internal) {
    const cleanName = sanitizeProductName(internal.nome);
    const textos = internal.jsonBase?.textos_da_arte;
    
    return {
      codigo: codeStr,
      nome: cleanName,
      subtitulo: textos?.subtitulo || internal.descricao || '',
      imagemUrl: internal.imagemUrl || '',
      imagemRecortada: internal.imagemRecortada || internal.imagemUrl || '',
      valorDe: internal.valorDe || internal.jsonBase?.modulo_preco?.valor_de || '',
      valorPor: internal.valorPor || internal.jsonBase?.modulo_preco?.valor_por || '',
      categoria: internal.categoria,
      templateLayout: internal.templateLayout,
      diferenciais: textos?.bullets_tecnicos || [],
      updatedAt: Date.now()
    };
  }

  return null;
}

export interface StorageStats {
  totalCount: number;
  memoryCount: number;
  oldestUpdatedAt: number | null;
  newestUpdatedAt: number | null;
  schemaVersion: number;
}

/**
 * Remove produtos obsoletos com base em TTL (em dias).
 * Funciona de forma híbrida: limpa o memoryStore em RAM (usado em Node/Vitest)
 * e o IndexedDB quando disponível no navegador.
 * Retorna a quantidade total de registros expurgados.
 */
export async function pruneExpiredProducts(maxAgeDays = 60): Promise<number> {
  const cutoffTime = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
  let deletedFromMemory = 0;

  // 1. Limpeza garantida no memoryStore (RAM / Vitest)
  for (const [code, item] of memoryStore.entries()) {
    if ((item.updatedAt || 0) < cutoffTime) {
      memoryStore.delete(code);
      deletedFromMemory++;
    }
  }

  // 2. Limpeza no IndexedDB do navegador
  const idb = getIndexedDB();
  if (!idb) {
    return deletedFromMemory;
  }

  try {
    const all = await getAllStoredProducts();
    const toDelete = all.filter((item) => (item.updatedAt || 0) < cutoffTime);
    if (toDelete.length > 0) {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        for (const item of toDelete) {
          store.delete(item.codigo);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      return toDelete.length;
    }
  } catch (err) {
    console.warn('[productStorage] Erro durante prune no IndexedDB:', err);
  }

  return deletedFromMemory;
}

/**
 * Retorna estatísticas consolidadas de uso e volumetria do cache de produtos.
 */
export async function getStorageStats(): Promise<StorageStats> {
  const all = await getAllStoredProducts();
  const timestamps = all.map((p) => p.updatedAt || 0).filter((t) => t > 0);

  return {
    totalCount: all.length,
    memoryCount: memoryStore.size,
    oldestUpdatedAt: timestamps.length > 0 ? Math.min(...timestamps) : null,
    newestUpdatedAt: timestamps.length > 0 ? Math.max(...timestamps) : null,
    schemaVersion: STORAGE_SCHEMA_VERSION,
  };
}
