import React from 'react';
import { Tag, Info, DollarSign, RefreshCw, Edit3, Sparkles } from 'lucide-react';
import type { ExtractedPriceInfo } from '../../lib/priceParser';

/**
 * PARTE 1 · item 2: DESCRIÇÃO / COMANDO DA PEÇA.
 *
 * Extraído de `InputPanel.tsx` na decomposição do painel (passo 5 do plano).
 * O JSX foi movido **verbatim** — classes, textos, placeholder e estrutura
 * idênticos. Extração mecânica não deve mudar pixel.
 *
 * Contrato de estado: os campos são **controlados** pelo pai (que é dono do
 * estado). A visibilidade dos campos de preço usa um único callback com
 * intenção explícita (`onPriceFieldsVisibilityChange`) em vez de expor o
 * `setState` cru — assim os dois pontos de uso (alternar e "aplicar detectado")
 * ficam legíveis.
 */
export interface ProductDescriptionSectionProps {
  appMode: 'AGRO' | 'PET';
  userCommand: string;
  onUserCommandChange: (value: string) => void;
  /** Preços detectados automaticamente no texto (hook do pai). */
  detectedPrices: ExtractedPriceInfo;
  /** Intenção de oferta detectada (badge do cabeçalho). */
  isPromotionIntent: boolean;
  currentImage?: string;
  showPriceFields: boolean;
  onPriceFieldsVisibilityChange: (visible: boolean) => void;
  valorDe: string;
  onValorDeChange: (value: string) => void;
  valorPor: string;
  onValorPorChange: (value: string) => void;
  condicoesPagamento: string;
  onCondicoesChange: (value: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
}

export const ProductDescriptionSection: React.FC<ProductDescriptionSectionProps> = ({
  appMode,
  userCommand,
  onUserCommandChange,
  detectedPrices,
  isPromotionIntent,
  currentImage,
  showPriceFields,
  onPriceFieldsVisibilityChange,
  valorDe,
  onValorDeChange,
  valorPor,
  onValorPorChange,
  condicoesPagamento,
  onCondicoesChange,
  isGenerating,
  onGenerate,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 font-exo2 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-[#004d40] text-white flex items-center justify-center text-[10px] font-black">
            2
          </span>
          <span>Descrição / Comando da Peça</span>
        </label>

        {/* Badge Dinâmico de Detecção Automática de Oferta */}
        {isPromotionIntent ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
            <Tag className="w-3 h-3 text-[#ffab00]" />
            <span>Oferta com Preço</span>
          </span>
        ) : userCommand.trim().length > 3 ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            <Info className="w-3 h-3 text-[#001C71]" />
            <span>Informativo / Novidade</span>
          </span>
        ) : null}
      </div>

      <textarea
        rows={2}
        value={userCommand}
        onChange={(e) => onUserCommandChange(e.target.value)}
        placeholder="Ex: Forrageira TRF 300 Trapp de R$ 3.890 por R$ 3.190 em até 10x sem juros (ou qualquer descrição com preço e condições)"
        className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004d40] focus:border-transparent transition shadow-2xs resize-none"
      />

      {/* Destaque Inteligente quando a IA detecta preços no texto */}
      {detectedPrices.hasPrice && (
        <div className="mt-1.5 p-2.5 bg-amber-50/90 rounded-xl border border-amber-300 flex items-center justify-between">
          <div className="text-[11px] text-amber-950 flex items-center gap-1.5 flex-wrap">
            <span className="font-bold flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              {detectedPrices.valorDe ? 'Promoção identificada:' : 'Preço identificado:'}
            </span>
            {detectedPrices.valorDe && (
              <span className="text-gray-600 font-medium">
                <span className="text-[10px] uppercase font-bold text-gray-500 mr-1">Mais Alto (DE):</span>
                <span className="line-through">R$ {detectedPrices.valorDe}</span>
              </span>
            )}
            <span className="font-black text-[#004d40] bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              {detectedPrices.valorDe ? 'MAIS BAIXO (POR):' : 'POR:'} R$ {detectedPrices.valorPor}
            </span>
            {detectedPrices.condicoes && (
              <span className="text-[10px] font-bold text-amber-900 bg-white px-1.5 py-0.5 rounded border border-amber-200">
                {detectedPrices.condicoes}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              if (detectedPrices.valorDe) onValorDeChange(detectedPrices.valorDe);
              if (detectedPrices.valorPor) onValorPorChange(detectedPrices.valorPor);
              if (detectedPrices.condicoes) onCondicoesChange(detectedPrices.condicoes);
              onPriceFieldsVisibilityChange(true);
            }}
            className="text-[10px] font-bold text-[#004d40] hover:text-[#00796b] underline ml-2 shrink-0 cursor-pointer"
          >
            Ajustar campos manuais
          </button>
        </div>
      )}

      {/* Campos Opcionais de Preço De / Por */}
      <div className="mt-2">
        <button
          type="button"
          onClick={() => onPriceFieldsVisibilityChange(!showPriceFields)}
          className="text-[11px] text-[#004d40] hover:text-[#00796b] font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Tag className="w-3 h-3 text-[#ffab00]" />
          <span>{showPriceFields ? 'Ocultar campos manuais de preço' : '+ Ajustar valores De / Por / Condições manualmente'}</span>
        </button>

        {showPriceFields && (
          <div className="space-y-2 mt-2 p-2.5 bg-amber-50/50 rounded-xl border border-amber-200/80">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                  Valor De (Mais Alto):
                </label>
                <input
                  type="text"
                  value={valorDe}
                  onChange={(e) => onValorDeChange(e.target.value)}
                  placeholder="Ex: 3.890,00"
                  className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#ffab00]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                  Valor Por (Mais Baixo):
                </label>
                <input
                  type="text"
                  value={valorPor}
                  onChange={(e) => onValorPorChange(e.target.value)}
                  placeholder="Ex: 3.190,00"
                  className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white text-gray-800 font-bold focus:outline-none focus:ring-1 focus:ring-[#ffab00]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                Condição de Pagamento (opcional):
              </label>
              <input
                type="text"
                value={condicoesPagamento}
                onChange={(e) => onCondicoesChange(e.target.value)}
                placeholder="Ex: À VISTA ou EM ATÉ 10X SEM JUROS"
                className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#ffab00]"
              />
              <p className="text-[9px] text-gray-400 mt-0.5">
                Se preenchido, será exibido abaixo do preço. Se deixado vazio, nenhum texto financeiro será inventado.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Requisitos Obrigatórios: Foto + Descrição para Liberação da Geração */}
      <div className="pt-3 space-y-2">
        <div className="p-2 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
              currentImage ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {currentImage ? '✓' : '1'}
            </span>
            <span className={currentImage ? 'text-emerald-800 font-semibold' : 'text-gray-500'}>
              {currentImage ? 'Foto do Produto pronta' : '1. Envie a foto do produto'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
              userCommand.trim() ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {userCommand.trim() ? '✓' : '2'}
            </span>
            <span className={userCommand.trim() ? 'text-emerald-800 font-semibold' : 'text-gray-500'}>
              {userCommand.trim() ? 'Descrição preenchida' : '2. Digite a descrição'}
            </span>
          </div>
        </div>

        {/* Botão Principal de Geração IA (Bloqueado até que a descrição esteja presente) */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !userCommand.trim()}
          className={`w-full py-3.5 px-4 rounded-xl font-exo2 font-black text-sm tracking-wider uppercase transition flex items-center justify-center gap-2 border shadow-md ${
            !userCommand.trim()
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : appMode === 'PET' 
                ? 'bg-gradient-to-r from-[#4897D0] via-[#4897D0] to-[#3A7AA8] text-white hover:shadow-lg hover:brightness-105 active:scale-[0.99] border-blue-500/30 cursor-pointer'
                : 'bg-gradient-to-r from-[#004d40] via-[#004d40] to-[#00695c] text-white hover:shadow-lg hover:brightness-105 active:scale-[0.99] border-emerald-500/30 cursor-pointer'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#ffab00]" />
              <span>Analisando e gerando arte...</span>
            </>
          ) : !userCommand.trim() ? (
            <>
              <Edit3 className="w-4 h-4 text-amber-600" />
              <span>Digite a descrição para poder gerar</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-current" />
              <span>{appMode === 'PET' ? 'Gerar Arte Pet com IA' : 'Gerar Arte & Legenda com IA'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
