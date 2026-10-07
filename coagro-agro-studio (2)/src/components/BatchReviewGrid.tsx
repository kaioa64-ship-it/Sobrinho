import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as xlsx from 'xlsx';
import { Batch, BatchProduct, ProductFilter } from '../types/batch';
import { batchRepository } from '../lib/batchRepository';
import { sanitizeProductName, formatBrlStrict, validateProductRow } from '../lib/dataSanitizer';
import { SingleArtRenderer } from './SingleArtRenderer';
import { EMPTY_AGRO_CONTENT } from '../types/agro';
import { BatchItem } from './ExcelBatchUploader';
import { 
  Upload, Search, CheckCircle2, Clock, Check, CheckCheck, 
  ChevronLeft, ChevronRight, Sparkles, Filter, Store, Printer,
  FileSpreadsheet, ArrowRight, RotateCcw, Tag, Eye, Zap, CheckSquare, X
} from 'lucide-react';

interface BatchReviewGridProps {
  onStartExport: (items: BatchItem[], template: 'promo-mono-a4' | 'promo-agro-a4' | 'promo-text-only', badgeText: string) => void;
}

export const BatchReviewGrid: React.FC<BatchReviewGridProps> = ({ onStartExport }) => {
  // Estado do Modo de Operação (Chavinha de Agilidade)
  // false = Modo Rápido (Direto / Ágil, como a planilha anterior com deduplicação)
  // true = Modo Revisão (Workstation Split-Screen para validação fina um-a-um)
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [quickPreviewProduct, setQuickPreviewProduct] = useState<BatchProduct | null>(null);

  // Estado dos Lotes e Dados
  const [currentBatch, setCurrentBatch] = useState<Batch | null>(null);
  const [products, setProducts] = useState<BatchProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<BatchProduct | null>(null);
  const [allBatches, setAllBatches] = useState<Batch[]>([]);

  // Estados de Paginação e Filtros
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [locationFilter, setLocationFilter] = useState<'all' | 'both' | string>('all');
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  // Contadores globais do lote ativo
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });

  // Configuração de Template do Cartaz para o Preview e Exportação
  const [activeTemplate, setActiveTemplate] = useState<'promo-mono-a4' | 'promo-agro-a4' | 'promo-text-only'>('promo-mono-a4');
  const [activeBadgeText, setActiveBadgeText] = useState('OFERTA');

  // Loading
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carrega lotes existentes na inicialização
  useEffect(() => {
    loadBatchesList();
  }, []);

  const loadBatchesList = async () => {
    try {
      const list = await batchRepository.getBatches();
      setAllBatches(list);
      if (list.length > 0 && !currentBatch) {
        selectBatch(list[0]);
      }
    } catch (err) {
      console.error('Erro ao listar lotes:', err);
    }
  };

  const selectBatch = async (batch: Batch) => {
    setCurrentBatch(batch);
    setAvailableLocations(batch.locations || []);
    setPage(1);
    await loadProductsPage(batch.id, 1, searchQuery, statusFilter, locationFilter);
    await refreshStats(batch.id);
  };

  const refreshStats = async (batchId: string) => {
    try {
      const all = await batchRepository.getProducts(batchId, 1, 100000);
      const total = all.total;
      const approved = all.products.filter(p => p.status === 'approved').length;
      const pending = total - approved;
      setStats({ total, approved, pending });
    } catch (err) {
      console.error('Erro ao atualizar estatísticas:', err);
    }
  };

  const loadProductsPage = async (
    batchId: string,
    targetPage: number,
    query: string,
    status: 'all' | 'pending' | 'approved',
    location: string
  ) => {
    setIsLoading(true);
    try {
      const filter: ProductFilter = {
        search: query,
        status: status === 'all' ? undefined : status,
        location: location === 'all' ? undefined : location,
      };

      const result = await batchRepository.getProducts(batchId, targetPage, pageSize, filter);
      setProducts(result.products);
      setTotalPages(result.totalPages);
      setTotalCount(result.total);
      setPage(result.page);

      // Se nenhum item estiver selecionado ou o atual não estiver mais na lista, seleciona o primeiro
      if (result.products.length > 0) {
        setSelectedProduct(prev => {
          if (!prev) return result.products[0];
          const exists = result.products.find(p => p.id === prev.id);
          return exists || result.products[0];
        });
      }
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Efeito para recarregar quando mudam os filtros
  useEffect(() => {
    if (currentBatch) {
      loadProductsPage(currentBatch.id, page, searchQuery, statusFilter, locationFilter);
    }
  }, [page, searchQuery, statusFilter, locationFilter]);

  // 1. INGESTÃO E DEDUPLICAÇÃO DE PLANILHA
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = xlsx.read(new Uint8Array(arrayBuffer), { type: 'array' });

      // Busca memória de itens já aprovados anteriormente no IndexedDB
      const previouslyApprovedMap = await batchRepository.getPreviouslyValidatedMap();

      // Mapa de deduplicação por código do produto
      interface TempItem {
        code: string;
        originalName: string;
        priceFrom: string;
        priceTo: string;
        locations: Set<string>;
      }
      const deduplicationMap = new Map<string, TempItem>();
      const detectedSheets: string[] = [];

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) continue;

        const rawData = xlsx.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        if (!rawData || rawData.length === 0) continue;

        // Localiza cabeçalho com 'codigo' e 'descricao'
        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(10, rawData.length); i++) {
          const row = rawData[i];
          if (row && row.some(cell => String(cell).toLowerCase().includes('codigo'))) {
            headerRowIdx = i;
            break;
          }
        }

        // Se a aba não tiver coluna de código, ignora (ex: aba de instrução ou controle)
        if (headerRowIdx === -1) continue;

        detectedSheets.push(sheetName);

        for (let i = headerRowIdx + 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row || row.length < 2) continue;

          const rawCodigo = row[0];
          const rawDescricao = row[1];
          const rawDe = row[2];
          const rawPor = row[3];

          // Validação de consistência comercial
          const validation = validateProductRow(rawCodigo, rawDescricao, rawPor);
          if (!validation.isValid) continue;

          const codeStr = String(rawCodigo).trim();
          const cleanDe = formatBrlStrict(rawDe);
          const cleanPor = formatBrlStrict(rawPor);

          if (deduplicationMap.has(codeStr)) {
            // Mescla filial
            const existing = deduplicationMap.get(codeStr)!;
            existing.locations.add(sheetName);
          } else {
            const locs = new Set<string>();
            locs.add(sheetName);
            deduplicationMap.set(codeStr, {
              code: codeStr,
              originalName: String(rawDescricao).trim(),
              priceFrom: cleanDe,
              priceTo: cleanPor,
              locations: locs
            });
          }
        }
      }

      if (deduplicationMap.size === 0) {
        alert('Nenhum produto válido encontrado nas abas da planilha.');
        setIsImporting(false);
        return;
      }

      // Cria lote
      const batchId = `batch_${Date.now()}`;
      const batchList: BatchProduct[] = [];

      deduplicationMap.forEach((temp, code) => {
        const locationsArray = Array.from(temp.locations);
        const previouslyValidated = previouslyApprovedMap.get(code);

        const isAutoApproved = !!previouslyValidated;
        const cleanName = previouslyValidated ? previouslyValidated.cleanName : sanitizeProductName(temp.originalName);
        const subtitle = previouslyValidated ? previouslyValidated.subtitle : '';

        batchList.push({
          id: `${batchId}_${code}`,
          batchId,
          code,
          originalName: temp.originalName,
          cleanName,
          subtitle,
          priceFrom: temp.priceFrom,
          priceTo: temp.priceTo,
          locations: locationsArray,
          status: isAutoApproved ? 'approved' : 'pending',
          isSelected: true,
          templateLayout: 'promo-mono-a4',
          badgeText: 'OFERTA'
        });
      });

      const newBatch: Batch = {
        id: batchId,
        name: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        importedAt: Date.now(),
        totalProducts: deduplicationMap.size,
        validProducts: batchList.length,
        locations: detectedSheets
      };

      await batchRepository.saveBatch(newBatch, batchList);
      await loadBatchesList();
      await selectBatch(newBatch);

      alert(`Planilha importada com sucesso!\n• ${detectedSheets.length} filiais consolidadas: ${detectedSheets.join(', ')}\n• ${batchList.length} produtos únicos cadastrados.`);
    } catch (err: any) {
      console.error('Erro ao importar planilha:', err);
      alert(`Falha ao importar planilha: ${err.message}`);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 2. FLUXO DE TRABALHO: APROVAR E AVANÇAR
  const handleApproveAndNext = async () => {
    if (!selectedProduct) return;

    try {
      const updatedProduct: BatchProduct = {
        ...selectedProduct,
        status: 'approved'
      };

      await batchRepository.updateProduct(selectedProduct.id, updatedProduct);

      // Atualiza lista local
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updatedProduct : p));

      // Atualiza contadores
      if (currentBatch) {
        refreshStats(currentBatch.id);
      }

      // Procura o próximo item PENDENTE
      const currentIndex = products.findIndex(p => p.id === selectedProduct.id);
      const nextPendingInView = products.slice(currentIndex + 1).find(p => p.status === 'pending');

      if (nextPendingInView) {
        setSelectedProduct(nextPendingInView);
      } else {
        // Se não houver mais na página atual, avança página ou seleciona o próximo
        if (currentIndex < products.length - 1) {
          setSelectedProduct(products[currentIndex + 1]);
        }
      }
    } catch (err) {
      console.error('Erro ao aprovar produto:', err);
    }
  };

  // Salva edições manuais no produto selecionado
  const handleProductFieldChange = async (field: keyof BatchProduct, value: any) => {
    if (!selectedProduct) return;

    const updated = { ...selectedProduct, [field]: value };
    setSelectedProduct(updated);
    setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updated : p));

    try {
      await batchRepository.updateProduct(selectedProduct.id, { [field]: value });
    } catch (err) {
      console.error('Erro ao salvar alteração do produto:', err);
    }
  };

  // Alterna seleção individual de checkbox
  const handleToggleSelect = async (id: string, currentSelected: boolean) => {
    const newVal = !currentSelected;
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isSelected: newVal } : p));
    if (selectedProduct?.id === id) {
      setSelectedProduct({ ...selectedProduct, isSelected: newVal });
    }
    await batchRepository.updateProduct(id, { isSelected: newVal });
  };

  // Marcar/Desmarcar todos os visíveis na página
  const handleToggleAllVisible = async (select: boolean) => {
    for (const p of products) {
      await batchRepository.updateProduct(p.id, { isSelected: select });
    }
    setProducts(prev => prev.map(p => ({ ...p, isSelected: select })));
  };

  // Marcar ou Desmarcar TODOS os produtos do lote inteiro (1 clique)
  const handleSelectAllBatch = async (select: boolean) => {
    if (!currentBatch) return;
    setIsLoading(true);
    try {
      await batchRepository.updateAllSelection(currentBatch.id, select);
      await loadProductsPage(currentBatch.id, page, searchQuery, statusFilter, locationFilter);
    } catch (err) {
      console.error('Erro ao alterar seleção do lote:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Aprovar TODOS os produtos do lote de uma vez só (1 clique)
  const handleApproveAllBatch = async () => {
    if (!currentBatch) return;
    const confirmApprove = window.confirm(`Deseja marcar todos os ${stats.total} produtos deste lote como Aprovados?`);
    if (!confirmApprove) return;

    setIsLoading(true);
    try {
      await batchRepository.updateAllStatus(currentBatch.id, 'approved');
      await refreshStats(currentBatch.id);
      await loadProductsPage(currentBatch.id, page, searchQuery, statusFilter, locationFilter);
    } catch (err) {
      console.error('Erro ao aprovar lote:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Dispara exportação em lote para o PDF (Super Ágil no Modo Rápido)
  const handleTriggerExport = async () => {
    if (!currentBatch) return;

    try {
      let selected = await batchRepository.getAllSelectedProducts(currentBatch.id);
      
      // Se nenhum item foi marcado individualmente pelo checkbox:
      if (selected.length === 0) {
        const confirmAll = window.confirm(
          `Nenhum produto está marcado com caixa de seleção.\n\nDeseja gerar todos os ${stats.total} cartazes do lote agora?`
        );
        if (!confirmAll) return;

        // Recupera todos os produtos do lote
        const allRes = await batchRepository.getProducts(currentBatch.id, 1, 100000);
        selected = allRes.products;
      }

      if (selected.length === 0) {
        alert('Nenhum produto disponível para gerar.');
        return;
      }

      // Converte para o formato BatchItem esperado pelo BatchRendererModal
      const batchItems: BatchItem[] = selected.map(p => ({
        id: p.id,
        codigo: p.code,
        titulo: p.cleanName,
        valorDe: p.priceFrom,
        valorPor: p.priceTo,
        selected: true
      }));

      onStartExport(batchItems, activeTemplate, activeBadgeText);
    } catch (err: any) {
      console.error('Erro ao preparar exportação:', err);
      alert('Falha ao exportar lote: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 font-['Inter']">
      
      {/* 1. BARRA SUPERIOR DE FILTROS E MÉTRICAS */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        
        {/* Importação e Seletor de Lote */}
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xlsx, .xls"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold shadow-xs hover:opacity-95 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-brand-secondary" />
            <span>{isImporting ? 'Processando Planilha...' : 'Importar Planilha (.xlsx)'}</span>
          </button>

          {allBatches.length > 1 && (
            <select
              value={currentBatch?.id || ''}
              onChange={(e) => {
                const found = allBatches.find(b => b.id === e.target.value);
                if (found) selectBatch(found);
              }}
              className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              {allBatches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.totalProducts} itens)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Métricas do Lote */}
        {currentBatch && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
              📦 Total Únicos: <strong className="text-slate-900">{stats.total}</strong>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Aprovados: <strong>{stats.approved}</strong>
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Pendentes: <strong>{stats.pending}</strong>
            </span>
          </div>
        )}

        {/* CHAVINHA DO MODO (Agilidade vs Auditoria) */}
        {currentBatch && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setIsReviewMode(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                !isReviewMode
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Modo Rápido: gere seus cartazes sem aprovação manual obrigatória"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Modo Rápido</span>
            </button>
            <button
              type="button"
              onClick={() => setIsReviewMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                isReviewMode
                  ? 'bg-brand-primary text-white shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Modo Revisão: valide cada cartaz individualmente na bancada de auditoria"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Modo Revisão</span>
            </button>
          </div>
        )}

        {/* Ação de Exportação Principal */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerExport}
            disabled={!currentBatch || stats.total === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-secondary text-slate-900 rounded-xl text-sm font-black shadow-md hover:brightness-105 transition cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>Gerar Lote de Cartazes (PDF)</span>
          </button>
        </div>
      </div>

      {/* 2. BARRA DE BUSCA E FILTROS DINÂMICOS */}
      {currentBatch && (
        <div className="bg-slate-100/70 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Campo de Busca */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por código ou descrição do produto..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              />
            </div>

            {/* Filtro por Filial / Loja */}
            <div className="flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={locationFilter}
                onChange={(e) => {
                  setLocationFilter(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                <option value="all">Todas as Lojas</option>
                <option value="both">Ambas as Lojas (Comuns)</option>
                {availableLocations.map(loc => (
                  <option key={loc} value={loc}>Só {loc}</option>
                ))}
              </select>
            </div>

            {/* Filtro por Status */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Apenas Pendentes</option>
                <option value="approved">Apenas Aprovados</option>
              </select>
            </div>
          </div>

          {/* Ações em Massa: Seleção e Aprovação em 1 Clique */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleAllVisible(true)}
              className="text-slate-600 hover:text-slate-900 font-semibold text-xs transition"
              title="Marcar produtos desta página"
            >
              Marcar Página
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => handleSelectAllBatch(true)}
              className="text-brand-primary hover:text-brand-primary/80 font-bold text-xs transition"
              title="Marcar todos os produtos do lote inteiro"
            >
              Marcar Todo o Lote ({stats.total})
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => handleSelectAllBatch(false)}
              className="text-rose-600 hover:text-rose-800 font-semibold text-xs transition"
              title="Desmarcar todos os produtos"
            >
              Desmarcar Todos
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleApproveAllBatch}
              className="text-emerald-700 hover:text-emerald-900 font-bold text-xs transition flex items-center gap-1"
              title="Marcar todo o lote como Aprovado no banco"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Aprovar Lote Inteiro
            </button>
          </div>
        </div>
      )}

      {/* 3. SPLIT SCREEN: LISTA À ESQUERDA (60%) E PREVIEW/EDIÇÃO À DIREITA (40%) */}
      {!currentBatch ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-exo2 text-slate-800 mb-2">Nenhuma Planilha Carregada</h3>
          <p className="text-slate-500 text-sm max-w-md mb-6">
            Importe o arquivo <strong>.xlsx</strong> contendo as abas de preços das filiais para cruzamento e geração sem duplicidades.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-brand-primary text-white rounded-xl font-bold shadow-md hover:opacity-95 transition"
          >
            Selecionar Arquivo Excel
          </button>
        </div>
      ) : isReviewMode ? (
        /* 3A. MODO REVISÃO (SPLIT SCREEN: 7 COLUNAS LISTA + 5 COLUNAS WORKSTATION) */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* PAINEL ESQUERDO: TABELA CONSOLIDADA */}
          <div className="lg:col-span-7 flex flex-col border-r border-slate-200 bg-white overflow-hidden">
            
            {/* Lista com rolagem suave */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {isLoading ? (
                <div className="p-8 text-center text-slate-400 text-sm">Carregando itens...</div>
              ) : products.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm">Nenhum produto encontrado com os filtros atuais.</div>
              ) : (
                products.map((p) => {
                  const isSelectedCurrent = selectedProduct?.id === p.id;
                  const isBoth = p.locations && p.locations.length > 1;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className={`px-4 py-3 flex items-center gap-3 transition cursor-pointer select-none ${
                        isSelectedCurrent 
                          ? 'bg-brand-primary/5 border-l-4 border-brand-primary' 
                          : 'hover:bg-slate-50/80 border-l-4 border-transparent'
                      }`}
                    >
                      {/* Checkbox de seleção */}
                      <input
                        type="checkbox"
                        checked={p.isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(p.id, p.isSelected);
                        }}
                        className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary cursor-pointer"
                      />

                      {/* Indicador de Status */}
                      <div title={p.status === 'approved' ? 'Aprovado' : 'Pendente'}>
                        {p.status === 'approved' ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs" />
                        )}
                      </div>

                      {/* Código */}
                      <span className="font-mono text-xs font-bold text-slate-400 min-w-[50px]">
                        #{p.code}
                      </span>

                      {/* Detalhes do Produto */}
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {/* Badge de Loja */}
                          {isBoth ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                              Ambas
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800">
                              {p.locations[0] || 'Loja'}
                            </span>
                          )}

                          <h4 className="text-sm font-semibold text-slate-800 truncate">
                            {p.cleanName}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          Original: {p.originalName}
                        </p>
                      </div>

                      {/* Preços */}
                      <div className="text-right shrink-0">
                        {p.priceFrom && (
                          <span className="block text-[11px] text-slate-400 line-through font-mono">
                            De: {p.priceFrom}
                          </span>
                        )}
                        <span className="block text-sm font-black text-amber-600 font-mono">
                          Por: R$ {p.priceTo}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Paginação inferior */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>
                Mostrando <strong>{products.length}</strong> de <strong>{totalCount}</strong> produtos
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* PAINEL DIREITO: EDIÇÃO E PREVIEW EM TEMPO REAL (5 colunas) */}
          <div className="lg:col-span-5 flex flex-col bg-slate-100/50 overflow-y-auto p-5 space-y-5">
            {selectedProduct ? (
              <>
                {/* 1. Header do Painel de Edição */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 rounded-md text-slate-600">
                        Código: #{selectedProduct.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        selectedProduct.status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {selectedProduct.status === 'approved' ? '✓ Aprovado' : '⏳ Pendente'}
                      </span>
                    </div>

                    {/* Botão APROVAR E AVANÇAR */}
                    <button
                      onClick={handleApproveAndNext}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer"
                    >
                      <span>Aprovar e Avançar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Campos Editáveis */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                          Nome do Cartaz (Título)
                        </label>
                        <button
                          onClick={() => handleProductFieldChange('cleanName', sanitizeProductName(selectedProduct.originalName))}
                          title="Restaurar nome higienizado automaticamente"
                          className="text-[11px] text-brand-primary hover:underline flex items-center gap-1 font-semibold"
                        >
                          <RotateCcw className="w-3 h-3" /> Re-sanitizar
                        </button>
                      </div>
                      <input
                        type="text"
                        value={selectedProduct.cleanName}
                        onChange={(e) => handleProductFieldChange('cleanName', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                          De (R$)
                        </label>
                        <input
                          type="text"
                          value={selectedProduct.priceFrom}
                          onChange={(e) => handleProductFieldChange('priceFrom', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-600 line-through"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-amber-600 uppercase tracking-wide mb-1">
                          Por (R$)
                        </label>
                        <input
                          type="text"
                          value={selectedProduct.priceTo}
                          onChange={(e) => handleProductFieldChange('priceTo', e.target.value)}
                          className="w-full px-3 py-2 bg-amber-50/60 border border-amber-200 rounded-xl text-sm font-mono font-black text-amber-700"
                        />
                      </div>
                    </div>

                    {/* Chamada e Template do Cartaz */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                          Chamada do Cartaz
                        </label>
                        <select
                          value={activeBadgeText}
                          onChange={(e) => setActiveBadgeText(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                        >
                          <option value="OFERTA">OFERTA</option>
                          <option value="LIQUIDAÇÃO">LIQUIDAÇÃO</option>
                          <option value="PROMOÇÃO">PROMOÇÃO</option>
                          <option value="SUPER PREÇO">SUPER PREÇO</option>
                          <option value="ESPECIAL">ESPECIAL</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                          Modelo de Impressão
                        </label>
                        <select
                          value={activeTemplate}
                          onChange={(e) => setActiveTemplate(e.target.value as any)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                        >
                          <option value="promo-mono-a4">Laser P&B (Econômico)</option>
                          <option value="promo-agro-a4">Promocional Colorido</option>
                          <option value="promo-text-only">Apenas Texto (Limpo)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. PREVIEW REAL DO CARTAZ A4 */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    <Eye className="w-3.5 h-3.5" />
                    Preview do Cartaz (A4)
                  </div>

                  <div className="w-full max-w-sm flex justify-center scale-90 sm:scale-95 origin-top">
                    <SingleArtRenderer
                      content={{
                        ...EMPTY_AGRO_CONTENT,
                        textos_hero: { titulo: selectedProduct.cleanName, palavra_destaque_ouro: '', subtitulo: '' },
                        modulo_preco: {
                          ativo: true,
                          valor_de: selectedProduct.priceFrom,
                          valor_por: selectedProduct.priceTo,
                          condicoes_pagamento: ''
                        },
                        tipo_postagem: 'promocao'
                      }}
                      format="a4-retrato"
                      theme="azul-coagro"
                      templateLayout={activeTemplate}
                      imageBoxFormat="rectangular"
                      codigoProduto={selectedProduct.code}
                      containerId="preview-poster-batch"
                      badgeText={activeBadgeText}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                Selecione um produto da lista para editar e visualizar o preview.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 3B. MODO RÁPIDO / DIRETO (LARGURA TOTAL, SEM AMARRAS DE APROVAÇÃO, AGILIDADE MÁXIMA) */
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          
          {/* Barra de Configuração de Impressão Rápida */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Modo Rápido Ativo:
              </span>
              <span className="text-slate-500">
                Selecione os produtos desejados ou gere a lista inteira direto em PDF, sem precisar aprovar 1 por 1.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600">Modelo:</span>
                <select
                  value={activeTemplate}
                  onChange={(e) => setActiveTemplate(e.target.value as any)}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700"
                >
                  <option value="promo-mono-a4">Laser P&B (Econômico)</option>
                  <option value="promo-agro-a4">Promocional Colorido</option>
                  <option value="promo-text-only">Apenas Texto</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600">Chamada:</span>
                <select
                  value={activeBadgeText}
                  onChange={(e) => setActiveBadgeText(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700"
                >
                  <option value="OFERTA">OFERTA</option>
                  <option value="LIQUIDAÇÃO">LIQUIDAÇÃO</option>
                  <option value="PROMOÇÃO">PROMOÇÃO</option>
                  <option value="SUPER PREÇO">SUPER PREÇO</option>
                  <option value="ESPECIAL">ESPECIAL</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabela de Produtos em Largura Total */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Carregando itens...</div>
            ) : products.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">Nenhum produto encontrado com os filtros atuais.</div>
            ) : (
              products.map((p) => {
                const isBoth = p.locations && p.locations.length > 1;

                return (
                  <div
                    key={p.id}
                    className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/90 transition select-none"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={p.isSelected}
                        onChange={() => handleToggleSelect(p.id, p.isSelected)}
                        className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary cursor-pointer"
                      />

                      {/* Status */}
                      <div title={p.status === 'approved' ? 'Aprovado' : 'Pendente'}>
                        {p.status === 'approved' ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-xs" />
                        )}
                      </div>

                      {/* Código */}
                      <span className="font-mono text-xs font-bold text-slate-400 min-w-[55px]">
                        #{p.code}
                      </span>

                      {/* Badge da Loja */}
                      {isBoth ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 shrink-0">
                          Ambas as Lojas
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 shrink-0">
                          {p.locations[0] || 'Loja'}
                        </span>
                      )}

                      {/* Título Higienizado e Nome Original */}
                      <div className="flex-1 min-w-0 pr-4">
                        <h4 className="text-sm font-bold text-slate-800 truncate">
                          {p.cleanName}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">
                          Planilha: {p.originalName}
                        </p>
                      </div>
                    </div>

                    {/* Preços e Ação de Visualização Rápida */}
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        {p.priceFrom && (
                          <span className="block text-[11px] text-slate-400 line-through font-mono">
                            De: {p.priceFrom}
                          </span>
                        )}
                        <span className="block text-sm font-black text-amber-600 font-mono">
                          Por: R$ {p.priceTo}
                        </span>
                      </div>

                      {/* Botão de Preview Rápido */}
                      <button
                        onClick={() => setQuickPreviewProduct(p)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-brand-primary hover:text-white text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                        title="Ver cartaz deste produto em janela rápida"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Cartaz</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Paginação inferior do Modo Rápido */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 px-6">
            <span>
              Mostrando <strong>{products.length}</strong> de <strong>{totalCount}</strong> produtos consolidados
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL DE PREVIEW RÁPIDO (PARA O MODO RÁPIDO) */}
      {quickPreviewProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-800">Preview do Cartaz (A4)</h4>
                <p className="text-xs text-slate-400">#{quickPreviewProduct.code} - {quickPreviewProduct.cleanName}</p>
              </div>
              <button
                onClick={() => setQuickPreviewProduct(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex justify-center items-center overflow-y-auto">
              <div className="w-full max-w-[320px]">
                <SingleArtRenderer
                  content={{
                    ...EMPTY_AGRO_CONTENT,
                    textos_hero: { titulo: quickPreviewProduct.cleanName, palavra_destaque_ouro: '', subtitulo: '' },
                    modulo_preco: {
                      ativo: true,
                      valor_de: quickPreviewProduct.priceFrom,
                      valor_por: quickPreviewProduct.priceTo,
                      condicoes_pagamento: ''
                    },
                    tipo_postagem: 'promocao'
                  }}
                  format="a4-retrato"
                  theme="azul-coagro"
                  templateLayout={activeTemplate}
                  imageBoxFormat="rectangular"
                  codigoProduto={quickPreviewProduct.code}
                  containerId="preview-poster-quick-modal"
                  badgeText={activeBadgeText}
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setQuickPreviewProduct(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
