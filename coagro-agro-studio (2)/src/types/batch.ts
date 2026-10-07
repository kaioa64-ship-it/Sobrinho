export interface Batch {
  id: string;
  name: string;
  fileName: string;
  importedAt: number;
  totalProducts: number;
  validProducts: number;
  locations: string[];
}

export interface BatchProduct {
  id: string;
  batchId: string;
  code: string;
  originalName: string;
  cleanName: string;
  subtitle?: string;
  priceFrom: string; // Ex: "58,00"
  priceTo: string;   // Ex: "44,00"
  locations: string[]; // Ex: ['Catedral', '15 de Novembro']
  status: 'pending' | 'approved' | 'rejected' | 'printed';
  isSelected: boolean;
  templateLayout?: 'promo-mono-a4' | 'promo-agro-a4' | 'promo-text-only';
  badgeText?: string;
}

export interface ProductFilter {
  search?: string;
  status?: 'all' | 'pending' | 'approved' | 'rejected' | 'printed';
  location?: 'all' | 'both' | string;
  onlySelected?: boolean;
}

export interface PaginatedProductsResult {
  products: BatchProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
