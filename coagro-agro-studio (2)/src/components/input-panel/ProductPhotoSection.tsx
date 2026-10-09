import React from 'react';
import { Upload, Wand2, Check, X, Sliders, Loader2, RefreshCw } from 'lucide-react';
import { AGRO_PRESETS } from '../../data/agroPresets';
import type { PresetProduct } from '../../types/agro';
import type { MaskPreset } from '../../lib/imageTransparency';

/**
 * PARTE 1 · item 1: FOTO DO PRODUTO / INSUMO.
 *
 * Extraído de `InputPanel.tsx` na decomposição do painel (passo 5 do plano).
 * O JSX foi movido **verbatim** — classes, textos e estrutura idênticos.
 *
 * Duas pequenas mudanças de contrato, ambas para manter a regra de que o
 * **estado pertence ao pai**:
 *  1. o botão "Zerar Tudo" recebe `onResetAll` em vez de tocar 6 setters;
 *  2. a condição de exibição do botão chega pronta como `showResetButton`.
 *
 * O `<input type="file">` continua aqui, mas o `ref` vem do pai
 * (`fileInputRef`) porque o pai também precisa limpar o campo ao zerar tudo.
 */
export interface ProductPhotoSectionProps {
  currentImage?: string;
  isProcessingBg: boolean;
  bgProcessingStage: string;
  bgProgressPercent: number;
  cachedRawCutout: string | null;
  maskPreset: MaskPreset;
  imageUploadedAlert: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  /** Condição já calculada pelo pai (imagem, comando, título ou preço ativos). */
  showResetButton: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onStripBackgroundNow: () => void;
  onPresetChange: (preset: MaskPreset) => void;
  onQuickExample: (preset: PresetProduct) => void;
  onResetAll: () => void;
}

export const ProductPhotoSection: React.FC<ProductPhotoSectionProps> = ({
  currentImage,
  isProcessingBg,
  bgProcessingStage,
  bgProgressPercent,
  cachedRawCutout,
  maskPreset,
  imageUploadedAlert,
  fileInputRef,
  showResetButton,
  onFileUpload,
  onRemoveImage,
  onStripBackgroundNow,
  onPresetChange,
  onQuickExample,
  onResetAll,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 font-exo2 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-[#004d40] text-white flex items-center justify-center text-[10px] font-black">
            1
          </span>
          <span>Foto do Produto / Insumo</span>
        </label>
        <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">
          Otimizado
        </span>
      </div>

      {currentImage ? (
        <div className="relative rounded-xl border-2 border-emerald-500/30 bg-emerald-50/20 p-3 space-y-2.5 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Checkerboard backdrop para demonstrar transparência */}
            <div
              className="w-18 h-18 rounded-lg overflow-hidden shadow-xs border border-gray-200 shrink-0 flex items-center justify-center p-1 relative"
              style={{
                backgroundImage: `linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)`,
                backgroundSize: '12px 12px',
                backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
                backgroundColor: '#ffffff',
              }}
            >
              <img
                src={currentImage}
                alt="Produto Selecionado"
                referrerPolicy="no-referrer"
                className={`w-full h-full object-contain filter drop-shadow-xs transition-opacity duration-300 ${isProcessingBg ? 'opacity-30' : 'opacity-100'}`}
              />
              {isProcessingBg && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                  <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {isProcessingBg ? (
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-emerald-700 font-exo2 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>{bgProcessingStage || 'Recortando...'}</span>
                  </p>
                  <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(15, bgProgressPercent)}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-gray-500">
                    Pode levar alguns segundos...
                  </p>
                </div>
              ) : cachedRawCutout ? (
                <div>
                  <p className="text-xs font-bold text-emerald-700 font-exo2 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Recorte IA Aplicado!</span>
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                    Modelo neural aplicado com sucesso.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-gray-700 font-exo2">
                    Recorte Rápido Aplicado
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                    Este é o recorte simples (instantâneo). Se o fundo não ficou perfeito, aprimore abaixo.
                  </p>
                  <button
                    type="button"
                    onClick={onStripBackgroundNow}
                    disabled={isProcessingBg}
                    className="mt-2 w-full flex justify-center items-center gap-1.5 px-3 py-1.5 bg-[#004d40] text-white rounded-md text-[10px] font-bold shadow-sm hover:bg-[#00382e] transition cursor-pointer"
                  >
                    <Wand2 className="w-3 h-3" />
                    <span>Aprimorar Recorte com IA (Melhor, + lento)</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 bg-white border border-gray-300 hover:border-gray-400 rounded-lg text-xs font-semibold text-gray-700 shadow-2xs transition cursor-pointer"
              >
                Trocar
              </button>
              <button
                type="button"
                onClick={onRemoveImage}
                title="Remover imagem"
                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3. Presets de Refinamento de Máscara (Abas Rápidas) só exibidas quando IA rodou */}
          {cachedRawCutout && (
            <div className="pt-2 border-t border-emerald-500/20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-[#004d40]" />
                  <span>Sintonia Fina da IA:</span>
                </span>
                <span className="text-[9px] text-gray-500 font-medium">
                  {maskPreset === 'standard' && 'Padrão (Equilibrado / Gôndola)'}
                  {maskPreset === 'aggressive' && 'Agressivo (Bordas Rígidas / Sacarias)'}
                  {maskPreset === 'details' && 'Detalhes (Vazados / Arames / Grades)'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => onPresetChange('standard')}
                  disabled={isProcessingBg}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer border ${
                    maskPreset === 'standard'
                      ? 'bg-[#004d40] text-white border-[#004d40] shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                  title="Equilibrado: Limpeza padrão de ruídos de fundo de gôndola"
                >
                  <span>Padrão</span>
                  <span className={`text-[8px] font-normal ${maskPreset === 'standard' ? 'text-emerald-100' : 'text-gray-400'}`}>
                    Equilibrado
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onPresetChange('aggressive')}
                  disabled={isProcessingBg}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer border ${
                    maskPreset === 'aggressive'
                      ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                  title="Agressivo: Corte severo para sacos de ração, caixas e produtos onde a prateleira colou"
                >
                  <span>Agressivo</span>
                  <span className={`text-[8px] font-normal ${maskPreset === 'aggressive' ? 'text-amber-100' : 'text-gray-400'}`}>
                    Sacos / Caixas
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onPresetChange('details')}
                  disabled={isProcessingBg}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer border ${
                    maskPreset === 'details'
                      ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                  title="Detalhes/Vazados: Preserva aberturas internas (arames, trituradores, grades e motores)"
                >
                  <span>Detalhes</span>
                  <span className={`text-[8px] font-normal ${maskPreset === 'details' ? 'text-blue-100' : 'text-gray-400'}`}>
                    Arames / Grades
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 hover:border-[#004d40] rounded-xl p-5 text-center cursor-pointer transition bg-gray-50/60 hover:bg-gray-50 flex flex-col items-center justify-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-100/80 text-[#004d40] flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800 font-exo2">
              Enviar foto do insumo, defensivo, vacina ou maquinário
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Clique ou arraste a imagem. Você poderá digitar o preço e a descrição com calma antes de gerar.
            </p>
          </div>
        </div>
      )}

      {imageUploadedAlert && (
        <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Foto carregada! Digite a descrição e clique em <strong>Gerar Arte & Legenda</strong> quando estiver pronto.</span>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Exemplos Rápidos com 1 Clique e Botão de Limpar Tudo */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] text-gray-400 font-medium">Exemplos rápidos:</span>
          {AGRO_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onQuickExample(p)}
              className="text-[10px] px-2 py-1 rounded-md bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-600 border border-gray-200 transition cursor-pointer"
            >
              {p.category}: {p.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {showResetButton && (
          <button
            type="button"
            onClick={onResetAll}
            className="text-[10px] px-2 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition cursor-pointer flex items-center gap-1"
            title="Limpar todos os campos e voltar ao estado inicial zerado"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            <span>Zerar Tudo</span>
          </button>
        )}
      </div>
    </div>
  );
};
