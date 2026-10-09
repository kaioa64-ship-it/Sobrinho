import React, { useState, useRef } from 'react';
import * as xlsx from 'xlsx';
import { Upload, Check, Trash2, Download, Search, Sparkles } from 'lucide-react';
import { sanitizeErpTitle } from '../lib/erpSanitizer';

export interface BatchItem {
  id: string;
  codigo: string | number;
  titulo: string;
  rawTitulo?: string;
  valorDe: string;
  valorPor: string;
  selected: boolean;
}

interface ExcelBatchUploaderProps {
  onProcessBatch: (items: BatchItem[], format: 'PNG' | 'PDF') => void;
}

export const ExcelBatchUploader: React.FC<ExcelBatchUploaderProps> = ({ onProcessBatch }) => {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [autoSanitizeErp, setAutoSanitizeErp] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = xlsx.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Read as array of arrays to handle dynamic headers
        const rawData = xlsx.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        
        // Find the actual header row (we know the file has some intro rows)
        // Header usually contains 'Codigo', 'Descricao', 'De (R$)', 'Por (R$)'
        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(10, rawData.length); i++) {
          const row = rawData[i];
          if (row && row.length >= 2 && String(row[0]).toLowerCase().includes('codigo')) {
            headerRowIdx = i;
            break;
          }
        }

        if (headerRowIdx === -1) {
          alert('Não foi possível encontrar o cabeçalho na planilha. Certifique-se de que as colunas "Codigo", "Descricao", "De" e "Por" existam.');
          setIsProcessing(false);
          return;
        }

        const parsedItems: BatchItem[] = [];
        for (let i = headerRowIdx + 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row || row.length < 4) continue; // Skip empty or invalid rows
          
          const codigo = row[0];
          const titulo = row[1];
          const de = row[2];
          const por = row[3];

          if (!titulo || !por) continue;

          const rawTitulo = String(titulo).trim();
          parsedItems.push({
            id: `item-${i}`,
            codigo: codigo,
            rawTitulo,
            titulo: autoSanitizeErp ? sanitizeErpTitle(rawTitulo) : rawTitulo,
            valorDe: de ? Number(de).toFixed(2).replace('.', ',') : '',
            valorPor: por ? Number(por).toFixed(2).replace('.', ',') : '',
            selected: true, // Auto-select all initially
          });
        }

        setItems(parsedItems);
      } catch (err) {
        console.error('Erro ao ler planilha:', err);
        alert('Ocorreu um erro ao ler a planilha. Tente novamente.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
    
    // Limpa o input para poder carregar o mesmo arquivo se quiser
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleToggleSanitize = (checked: boolean) => {
    setAutoSanitizeErp(checked);
    setItems(items.map(it => ({
      ...it,
      titulo: checked 
        ? sanitizeErpTitle(it.rawTitulo || it.titulo) 
        : (it.rawTitulo || it.titulo)
    })));
  };

  const toggleSelection = (id: string) => {
    setItems(items.map(it => it.id === id ? { ...it, selected: !it.selected } : it));
  };

  const selectAll = (select: boolean) => {
    setItems(items.map(it => ({ ...it, selected: select })));
  };

  const handleGenerate = (format: 'PNG' | 'PDF') => {
    const selectedItems = items.filter(it => it.selected);
    if (selectedItems.length === 0) {
      alert('Selecione ao menos um item para gerar as artes.');
      return;
    }
    onProcessBatch(selectedItems, format);
  };

  const filteredItems = items.filter(it => 
    String(it.codigo).toLowerCase().includes(searchQuery.toLowerCase()) || 
    it.titulo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCount = items.filter(it => it.selected).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-exo2 font-bold text-gray-800 flex items-center gap-2">
          <Upload className="w-5 h-5 text-[#004d40]" />
          Importação em Lote (Excel)
        </h3>
        
        {items.length === 0 && (
          <div>
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="px-4 py-2 bg-[#004d40] hover:bg-[#00382e] text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
            >
              {isProcessing ? <span className="animate-pulse">Lendo...</span> : 'Selecionar Planilha'}
            </button>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-gray-600 bg-gray-50 px-3 py-3 rounded-lg border border-gray-100 gap-3">
            <div className="flex flex-wrap gap-4 items-center">
              <button onClick={() => selectAll(true)} className="hover:text-emerald-700 font-semibold underline underline-offset-2">Selecionar Todos</button>
              <button onClick={() => selectAll(false)} className="hover:text-rose-700 font-semibold underline underline-offset-2">Limpar Seleção</button>
              <div className="font-bold font-exo2 bg-white px-2 py-1 rounded-md border border-gray-200">
                <span className="text-[#004d40]">{selectedCount}</span> de {items.length} marcados
              </div>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 hover:bg-emerald-100 transition select-none">
                <input
                  type="checkbox"
                  checked={autoSanitizeErp}
                  onChange={(e) => handleToggleSanitize(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Higienizar siglas de ERP</span>
              </label>
            </div>
            
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar código ou produto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-[#004d40] focus:border-[#004d40] bg-white"
              />
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 sticky top-0 uppercase text-[10px] font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="px-4 py-3 w-10"></th>
                  <th className="px-4 py-3">Cód</th>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3 text-right">De (R$)</th>
                  <th className="px-4 py-3 text-right">Por (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`transition-colors hover:bg-emerald-50/50 cursor-pointer ${item.selected ? 'bg-emerald-50/20' : ''}`}
                    onClick={() => toggleSelection(item.id)}
                  >
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={item.selected}
                        onChange={() => toggleSelection(item.id)}
                        className="w-4 h-4 text-[#004d40] rounded border-gray-300 focus:ring-[#004d40] cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{item.codigo}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 line-clamp-2">{item.titulo}</td>
                    <td className="px-4 py-3 text-right line-through text-gray-400">{item.valorDe}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#d67022]">{item.valorPor}</td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Nenhum item encontrado na busca.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => handleGenerate('PNG')}
              disabled={selectedCount === 0}
              className="flex-1 py-3 bg-[#d67022] hover:bg-[#b55b17] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-xs sm:text-sm font-bold font-exo2 tracking-wide uppercase flex items-center justify-center gap-1 sm:gap-2 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              Gerar {selectedCount} PNGs
            </button>
            <button
              onClick={() => handleGenerate('PDF')}
              disabled={selectedCount === 0}
              className="flex-1 py-3 bg-[#004d40] hover:bg-[#00382e] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-xs sm:text-sm font-bold font-exo2 tracking-wide uppercase flex items-center justify-center gap-1 sm:gap-2 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              Gerar {selectedCount} em PDF
            </button>
            <button
              onClick={() => setItems([])}
              className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
              title="Descartar Planilha"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
