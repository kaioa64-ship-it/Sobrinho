import React from 'react';
import { Tag, ChevronDown, Info } from 'lucide-react';
import type { CommunicationMode } from '../../lib/communicationMode';
import type { PriceModule } from '../../types/agro';

/**
 * PARTE 2 · item 1: MODO COMERCIAL & PREÇO (edição direta / live preview).
 *
 * Extraído de `InputPanel.tsx` na decomposição do painel (passo 5 do plano).
 * O JSX foi movido **verbatim** — classes, rótulos e estrutura idênticos.
 *
 * Seção apresentacional: recebe o modo já resolvido (`currentMode`), o preço
 * atual e dois callbacks. Não guarda estado nem resolve regra de negócio — a
 * resolução do modo continua em `resolveCommunicationMode`, no pai.
 */
export interface LivePriceSectionProps {
  /** `true` quando a postagem não tem tipo explícito (o modo vem dos preços). */
  isExplicitAuto: boolean;
  currentMode: CommunicationMode;
  onModeChange: (mode: 'auto' | 'promocao' | 'preco-unico' | 'informativo') => void;
  currentPreco?: PriceModule;
  onPriceChange: (
    field: 'valor_de' | 'valor_por' | 'condicoes_pagamento',
    value: string
  ) => void;
}

export const LivePriceSection: React.FC<LivePriceSectionProps> = ({
  isExplicitAuto,
  currentMode,
  onModeChange,
  currentPreco,
  onPriceChange,
}) => {
  return (
    <details className="group p-3 bg-white rounded-lg border border-amber-200 shadow-2xs space-y-2.5 transition-all">
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-[#ffab00]" />
            Modo Comercial & Preço
          </span>
          <span className="text-[10px] font-bold text-[#001C71] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            {isExplicitAuto
              ? `Auto: ${
                  currentMode === 'PROMOTION'
                    ? 'Promoção'
                    : currentMode === 'SINGLE_PRICE'
                    ? 'Preço Único'
                    : 'Informativo'
                }`
              : currentMode === 'PROMOTION'
              ? 'Promoção'
              : currentMode === 'SINGLE_PRICE'
              ? 'Preço Único'
              : 'Informativo'}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-3 space-y-2.5">

      {/* 4 Opções de Seleção de Modo (Correção 3) */}
      <div className="grid grid-cols-4 gap-1 pt-0.5">
        <button
          type="button"
          onClick={() => onModeChange('auto')}
          className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
            isExplicitAuto
              ? 'bg-purple-700 text-white shadow-2xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span>⚡ Auto</span>
        </button>

        <button
          type="button"
          onClick={() => onModeChange('promocao')}
          className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
            !isExplicitAuto && currentMode === 'PROMOTION'
              ? 'bg-amber-500 text-white shadow-2xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span>🏷️ Promoção</span>
        </button>

        <button
          type="button"
          onClick={() => onModeChange('preco-unico')}
          className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
            !isExplicitAuto && currentMode === 'SINGLE_PRICE'
              ? 'bg-[#004d40] text-white shadow-2xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span>💰 Preço Único</span>
        </button>

        <button
          type="button"
          onClick={() => onModeChange('informativo')}
          className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
            !isExplicitAuto && currentMode === 'INFORMATIVE'
              ? 'bg-[#001C71] text-white shadow-2xs'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span>📢 Informativo</span>
        </button>
      </div>

      {currentMode === 'PROMOTION' && (
        <div className="space-y-2 pt-1 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">
                Valor DE (R$):
              </label>
              <input
                type="text"
                value={currentPreco?.valor_de || ''}
                onChange={(e) => onPriceChange('valor_de', e.target.value)}
                placeholder="Ex: 3.890,00"
                className="w-full text-xs p-1.5 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#ffab00]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                Valor POR (R$):
              </label>
              <input
                type="text"
                value={currentPreco?.valor_por || ''}
                onChange={(e) => onPriceChange('valor_por', e.target.value)}
                placeholder="Ex: 3.190,00"
                className="w-full text-xs p-1.5 rounded-md border border-amber-400 bg-amber-50/50 text-gray-900 font-black focus:outline-none focus:ring-1 focus:ring-[#ffab00]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">
              Condição de Pagamento (opcional):
            </label>
            <input
              type="text"
              value={currentPreco?.condicoes_pagamento || currentPreco?.condicao || ''}
              onChange={(e) => onPriceChange('condicoes_pagamento', e.target.value)}
              placeholder="Ex: À VISTA ou EM ATÉ 10X SEM JUROS"
              className="w-full text-xs p-1.5 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#ffab00]"
            />
          </div>
        </div>
      )}

      {currentMode === 'SINGLE_PRICE' && (
        <div className="space-y-2 pt-1 border-t border-gray-100">
          <div>
            <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
              Preço Vigente (R$):
            </label>
            <input
              type="text"
              value={currentPreco?.valor_por || ''}
              onChange={(e) => onPriceChange('valor_por', e.target.value)}
              placeholder="Ex: 3.190,00"
              className="w-full text-xs p-1.5 rounded-md border border-emerald-400 bg-emerald-50/40 text-gray-900 font-black focus:outline-none focus:ring-1 focus:ring-[#004d40]"
            />
            <p className="text-[9px] text-gray-500 mt-0.5">
              Exibe apenas &quot;R$ valor&quot; sem &quot;DE/POR&quot; e sem linguagem de desconto.
            </p>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">
              Condição de Pagamento (opcional):
            </label>
            <input
              type="text"
              value={currentPreco?.condicoes_pagamento || currentPreco?.condicao || ''}
              onChange={(e) => onPriceChange('condicoes_pagamento', e.target.value)}
              placeholder="Ex: À VISTA ou EM ATÉ 10X SEM JUROS"
              className="w-full text-xs p-1.5 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#004d40]"
            />
          </div>
        </div>
      )}

      {currentMode === 'INFORMATIVE' && (
        <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200/80 text-[11px] text-blue-900 leading-snug">
          <p className="font-semibold flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#001C71] shrink-0" />
            <span>Modo Informativo Ativo</span>
          </p>
          <p className="text-[10px] text-blue-800/80 mt-1">
            Nenhum cartão financeiro é renderizado na arte. O foco é a recomendação técnica, sanidade, manejo ou novidade.
          </p>
        </div>
      )}
        </div>
    </details>
  );
};
