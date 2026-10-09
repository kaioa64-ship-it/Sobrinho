import React from 'react';
import { Type, Tag, Sparkles } from 'lucide-react';
import { sanitizeErpTitle } from '../lib/erpSanitizer';

interface PosterManualData {
  codigo: string;
  titulo: string;
  valorDe: string;
  valorPor: string;
}

interface PosterManualEditorProps {
  data: PosterManualData;
  onChange: (data: PosterManualData) => void;
}

export const PosterManualEditor: React.FC<PosterManualEditorProps> = ({ data, onChange }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-[#004d40]/10 flex items-center justify-center text-[#004d40]">
          <Type className="w-4 h-4" />
        </div>
        <h3 className="font-exo2 font-bold text-gray-800 text-lg">Informações do Cartaz</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            Código do Produto
          </label>
          <input
            type="text"
            value={data.codigo}
            onChange={(e) => {
              const novoCodigo = e.target.value;
              onChange({ ...data, codigo: novoCodigo });
              if (!novoCodigo || novoCodigo.trim().length === 0) return;

              import('../lib/productStorage').then(({ findProductBySku }) => {
                findProductBySku(novoCodigo).then(product => {
                  if (product) {
                    onChange({
                      ...data,
                      codigo: novoCodigo,
                      titulo: product.nome,
                      valorDe: product.valorDe || data.valorDe,
                      valorPor: product.valorPor || data.valorPor,
                    });
                  }
                });
              });
            }}
            placeholder="Ex: 12345"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] transition-all font-mono text-gray-800 text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
              Nome do Produto
            </label>
            {data.titulo && (
              <button
                type="button"
                onClick={() => onChange({ ...data, titulo: sanitizeErpTitle(data.titulo) })}
                className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded transition flex items-center gap-1"
                title="Expande abreviações e limpa siglas (ex: RAC -> Ração, 20L)"
              >
                <Sparkles className="w-3 h-3" /> Limpar Siglas
              </button>
            )}
          </div>
          <input
            type="text"
            value={data.titulo}
            onChange={(e) => onChange({ ...data, titulo: e.target.value })}
            placeholder="Ex: RAÇÃO TUTTICANIS SELECT 10.1 KG"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] transition-all font-medium text-gray-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5 text-gray-500">
              <Tag className="w-3.5 h-3.5" /> De (R$)
            </label>
            <input
              type="text"
              value={data.valorDe}
              onChange={(e) => onChange({ ...data, valorDe: e.target.value })}
              placeholder="Ex: 58,00"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-300 transition-all font-bold text-gray-600 line-through"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#d67022] uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Por (R$)
            </label>
            <input
              type="text"
              value={data.valorPor}
              onChange={(e) => onChange({ ...data, valorPor: e.target.value })}
              placeholder="Ex: 44,00"
              className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-[#d67022]/20 focus:border-[#d67022] transition-all font-bold text-[#d67022] text-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
