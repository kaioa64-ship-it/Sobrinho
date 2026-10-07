import { Batch, BatchProduct, ProductFilter, PaginatedProductsResult } from '../types/batch';

const DB_NAME = 'SobrinhoStudioDB';
const DB_VERSION = 1;
const STORE_BATCHES = 'batches';
const STORE_PRODUCTS = 'products';

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store para Lotes
      if (!db.objectStoreNames.contains(STORE_BATCHES)) {
        const batchStore = db.createObjectStore(STORE_BATCHES, { keyPath: 'id' });
        batchStore.createIndex('importedAt', 'importedAt', { unique: false });
      }

      // Store para Produtos individuais
      if (!db.objectStoreNames.contains(STORE_PRODUCTS)) {
        const productStore = db.createObjectStore(STORE_PRODUCTS, { keyPath: 'id' });
        productStore.createIndex('batchId', 'batchId', { unique: false });
        productStore.createIndex('code', 'code', { unique: false });
        productStore.createIndex('status', 'status', { unique: false });
        productStore.createIndex('batch_status', ['batchId', 'status'], { unique: false });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(new Error(`Falha ao abrir banco IndexedDB: ${request.error?.message}`));
    };
  });
}

export const batchRepository = {
  /**
   * Salva um lote e todos os seus produtos em uma única transação de alta performance.
   */
  async saveBatch(batch: Batch, products: BatchProduct[]): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_BATCHES, STORE_PRODUCTS], 'readwrite');
      const batchStore = transaction.objectStore(STORE_BATCHES);
      const productStore = transaction.objectStore(STORE_PRODUCTS);

      batchStore.put(batch);

      for (const product of products) {
        productStore.put(product);
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  /**
   * Lista todos os lotes importados ordenados do mais recente para o mais antigo.
   */
  async getBatches(): Promise<Batch[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_BATCHES, 'readonly');
      const store = transaction.objectStore(STORE_BATCHES);
      const index = store.index('importedAt');
      const request = index.openCursor(null, 'prev');
      const results: Batch[] = [];

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Recupera metadados de um lote por ID.
   */
  async getBatchById(batchId: string): Promise<Batch | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_BATCHES, 'readonly');
      const store = transaction.objectStore(STORE_BATCHES);
      const request = store.get(batchId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Busca produtos paginados com suporte a filtros de texto, status e seleção.
   */
  async getProducts(
    batchId: string,
    page: number = 1,
    pageSize: number = 20,
    filter?: ProductFilter
  ): Promise<PaginatedProductsResult> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PRODUCTS, 'readonly');
      const store = transaction.objectStore(STORE_PRODUCTS);
      const index = store.index('batchId');
      const request = index.getAll(batchId);

      request.onsuccess = () => {
        let items: BatchProduct[] = request.result || [];

        // Filtro por texto (código ou nome limpo)
        if (filter?.search && filter.search.trim()) {
          const q = filter.search.toLowerCase().trim();
          items = items.filter(
            p => String(p.code).toLowerCase().includes(q) ||
                 p.cleanName.toLowerCase().includes(q) ||
                 p.originalName.toLowerCase().includes(q)
          );
        }

        // Filtro por status
        if (filter?.status && filter.status !== 'all') {
          items = items.filter(p => p.status === filter.status);
        }

        // Filtro por filial/loja
        if (filter?.location && filter.location !== 'all') {
          if (filter.location === 'both') {
            items = items.filter(p => p.locations && p.locations.length > 1);
          } else {
            items = items.filter(p => p.locations && p.locations.includes(filter.location!));
          }
        }

        // Filtro por apenas selecionados
        if (filter?.onlySelected) {
          items = items.filter(p => p.isSelected);
        }

        const total = items.length;
        const totalPages = Math.ceil(total / pageSize) || 1;
        const start = (page - 1) * pageSize;
        const paginated = items.slice(start, start + pageSize);

        resolve({
          products: paginated,
          total,
          page,
          pageSize,
          totalPages
        });
      };

      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Atualiza campos de um produto específico.
   */
  async updateProduct(id: string, updates: Partial<BatchProduct>): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PRODUCTS, 'readwrite');
      const store = transaction.objectStore(STORE_PRODUCTS);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const current = getReq.result;
        if (!current) {
          return reject(new Error(`Produto ${id} não encontrado`));
        }

        const updated = { ...current, ...updates };
        store.put(updated);
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  /**
   * Marca ou desmarca todos os produtos de um lote de uma só vez.
   */
  async updateAllSelection(batchId: string, isSelected: boolean): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PRODUCTS, 'readwrite');
      const store = transaction.objectStore(STORE_PRODUCTS);
      const index = store.index('batchId');
      const request = index.openCursor(batchId);

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const product = cursor.value as BatchProduct;
          product.isSelected = isSelected;
          cursor.update(product);
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  /**
   * Atualiza o status de todos os produtos de um lote de uma só vez (ex: aprovação em massa).
   */
  async updateAllStatus(batchId: string, status: 'approved' | 'pending'): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PRODUCTS, 'readwrite');
      const store = transaction.objectStore(STORE_PRODUCTS);
      const index = store.index('batchId');
      const request = index.openCursor(batchId);

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const product = cursor.value as BatchProduct;
          product.status = status;
          cursor.update(product);
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  /**
   * Remove um produto do lote.
   */
  async deleteProduct(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PRODUCTS, 'readwrite');
      const store = transaction.objectStore(STORE_PRODUCTS);
      store.delete(id);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  /**
   * Remove um lote inteiro e todos os seus produtos associados.
   */
  async deleteBatch(batchId: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_BATCHES, STORE_PRODUCTS], 'readwrite');
      const batchStore = transaction.objectStore(STORE_BATCHES);
      const productStore = transaction.objectStore(STORE_PRODUCTS);

      batchStore.delete(batchId);

      const index = productStore.index('batchId');
      const req = index.openCursor(batchId);

      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  /**
   * Obtém todos os produtos selecionados de um lote (usado para gerar PDF/PNG em lote).
   */
  async getAllSelectedProducts(batchId: string): Promise<BatchProduct[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PRODUCTS, 'readonly');
      const store = transaction.objectStore(STORE_PRODUCTS);
      const index = store.index('batchId');
      const request = index.getAll(batchId);

      request.onsuccess = () => {
        const all: BatchProduct[] = request.result || [];
        resolve(all.filter(p => p.isSelected));
      };

      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Retorna um mapa de produtos previamente validados/aprovados em lotes anteriores.
   * Usado para auto-aprovar e reaproveitar nomes limpos ao ingerir novas planilhas.
   */
  async getPreviouslyValidatedMap(): Promise<Map<string, { cleanName: string; subtitle?: string }>> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_PRODUCTS, 'readonly');
      const store = transaction.objectStore(STORE_PRODUCTS);
      const request = store.openCursor();
      const map = new Map<string, { cleanName: string; subtitle?: string }>();

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const product = cursor.value as BatchProduct;
          if (product.status === 'approved') {
            map.set(String(product.code).trim(), {
              cleanName: product.cleanName,
              subtitle: product.subtitle
            });
          }
          cursor.continue();
        } else {
          resolve(map);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
};
