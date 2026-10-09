import { TemplateLayout } from '../types/agro';
import { getInternalProductByCode } from '../data/productDatabase';
import { sanitizeProductName } from './dataSanitizer';

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
}

const DB_NAME = 'CoagroStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'products';

// Memória cache local para fallback caso IndexedDB não esteja disponível (ex: Node/SSR/Vitest)
const memoryStore = new Map<string, StoredProduct>();

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
  };

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
