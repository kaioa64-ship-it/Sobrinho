import React from 'react';
import { Columns2, Columns, Maximize2, Wand2, Box } from 'lucide-react';
import type { CanvasFormat, TemplateLayout } from '../../types/agro';

/**
 * PARTE 4 (MOVIDA): MATRIZ DE DIAGRAMAÇÃO & TEMPLATE.
 *
 * Extraído de `InputPanel.tsx` na decomposição do painel (passo 5 do plano).
 * O JSX foi movido **verbatim** — nenhuma classe, texto ou handler mudou — para
 * que a extração seja livre de regressão visual. A única adição é esta
 * interface de props explícita, que documenta o acoplamento real da seção.
 *
 * Seção puramente apresentacional: não guarda estado próprio.
 */
export interface TemplateMatrixSectionProps {
  /** Escopo ativo — decide se a matriz mostra os templates Agro ou Pet. */
  appMode: 'AGRO' | 'PET';
  selectedFormat: CanvasFormat;
  onSelectFormat: (format: CanvasFormat) => void;
  selectedTemplate: TemplateLayout;
  onSelectTemplate: (template: TemplateLayout) => void;
  imageBoxFormat: 'rectangular' | 'square';
  onSelectImageBoxFormat?: (format: 'rectangular' | 'square') => void;
}

export const TemplateMatrixSection: React.FC<TemplateMatrixSectionProps> = ({
  appMode,
  selectedFormat,
  onSelectFormat,
  selectedTemplate,
  onSelectTemplate,
  imageBoxFormat,
  onSelectImageBoxFormat,
}) => {
  return (
    <div className="pt-2 space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 font-exo2 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-[#004d40] text-white flex items-center justify-center text-[10px] font-black">
            1
          </span>
          <span>Formato & Template</span>
        </label>
      </div>

      {/* Proporção (Formato da Peça: 1:1, 4:5, 9:16) - Oculto no MVP */}
      <div className="hidden">
        <span className="block text-[11px] font-semibold text-gray-700 mb-1.5">
          Proporção da Arte:
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled
            className="py-2 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition opacity-50 cursor-not-allowed border-gray-200 text-gray-600 bg-gray-50"
            title="Em breve"
          >
            <div className="w-3.5 h-3.5 border-2 border-current rounded-xs shrink-0" />
            <span className="truncate">1:1 (Feed)</span>
            <span className="text-[10px] ml-1">🔒</span>
          </button>

          <button
            type="button"
            disabled
            className="py-2 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition opacity-50 cursor-not-allowed border-gray-200 text-gray-600 bg-gray-50"
            title="Em breve"
          >
            <div className="w-3 h-4 border-2 border-current rounded-xs shrink-0" />
            <span className="truncate">4:5 (Retrato)</span>
            <span className="text-[10px] ml-1">🔒</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectFormat('story')}
            className={`py-2 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              selectedFormat === 'story'
                ? 'border-[#004d40] bg-[#004d40]/10 text-[#004d40] ring-2 ring-[#004d40]/20 font-bold shadow-xs'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="w-2.5 h-4 border-2 border-current rounded-xs shrink-0" />
            <span>9:16 (Story)</span>
          </button>
        </div>
      </div>

      {/* Matriz de Diagramação (Split Vertical vs Hero Central vs Pet Central) */}
      <div>
        <div className="grid grid-cols-3 gap-2.5">
          {appMode === 'AGRO' && (
            <>
              {/* Template 1: Split Vertical */}
              <button
                type="button"
                onClick={() => onSelectTemplate('split-vertical')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  selectedTemplate === 'split-vertical'
                    ? 'border-[#004d40] bg-[#004d40]/5 ring-2 ring-[#004d40]/20 shadow-xs'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-exo2 font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <Columns2 className="w-3.5 h-3.5 text-[#004d40]" />
                    Split Vertical
                  </span>
                  {selectedTemplate === 'split-vertical' && (
                    <span className="w-2 h-2 rounded-full bg-[#004d40]" />
                  )}
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">
                  Produto à esquerda
                </p>
              </button>

              {/* Template 2: Hero Central */}
              <button
                type="button"
                onClick={() => onSelectTemplate('hero-central')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  selectedTemplate === 'hero-central'
                    ? 'border-[#004d40] bg-[#004d40]/5 ring-2 ring-[#004d40]/20 shadow-xs'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-exo2 font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-[#ffab00]" />
                    Hero Central
                  </span>
                  {selectedTemplate === 'hero-central' && (
                    <span className="w-2 h-2 rounded-full bg-[#ffab00]" />
                  )}
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">
                  Produto centralizado
                </p>
              </button>
            </>
          )}

          {appMode === 'PET' && (
            <>
              {/* Template 3: Pet Central */}
              <button
                type="button"
                onClick={() => onSelectTemplate('pet-central')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  selectedTemplate === 'pet-central'
                    ? 'border-[#4897D0] bg-[#4897D0]/5 ring-2 ring-[#4897D0]/20 shadow-xs'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-exo2 font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-[#4897D0]" />
                    Pet Central
                  </span>
                  {selectedTemplate === 'pet-central' && (
                    <span className="w-2 h-2 rounded-full bg-[#4897D0]" />
                  )}
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">
                  Padrão Coagro Pet
                </p>
              </button>

              {/* Template 4: Pet Split */}
              <button
                type="button"
                onClick={() => onSelectTemplate('pet-split')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  selectedTemplate === 'pet-split'
                    ? 'border-[#4897D0] bg-[#4897D0]/5 ring-2 ring-[#4897D0]/20 shadow-xs'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-exo2 font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <Columns className="w-3.5 h-3.5 text-[#4897D0]" />
                    Pet Split
                  </span>
                  {selectedTemplate === 'pet-split' && (
                    <span className="w-2 h-2 rounded-full bg-[#4897D0]" />
                  )}
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">
                  Produto à esquerda
                </p>
              </button>
            </>
          )}
        </div>

        {/* Seletor dinâmico de Bounding Box para Hero Central (Resolução Base 1080x1920) */}
        {selectedTemplate === 'hero-central' && onSelectImageBoxFormat && (
          <div className="mt-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-800 font-exo2 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-[#004d40]" />
                <span>Zona de Segurança da Imagem (Bounding Box)</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded font-bold">
                Story 1080x1920
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSelectImageBoxFormat('rectangular')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  imageBoxFormat === 'rectangular'
                    ? 'bg-[#004d40] text-white shadow-xs font-bold'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>Retangular (900x630)</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectImageBoxFormat('square')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  imageBoxFormat === 'square'
                    ? 'bg-[#004d40] text-white shadow-xs font-bold'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>Quadrado (630x630)</span>
              </button>
            </div>
            <p className="text-[9px] text-gray-500 leading-tight">
              Contém estritamente o produto com <code>object-bottom</code> e garante que textos nunca sobreponham a imagem.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
