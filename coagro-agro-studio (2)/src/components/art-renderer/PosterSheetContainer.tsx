import React from 'react';
import { Scissors } from 'lucide-react';

export type PosterSheetGrid = '1_PER_PAGE' | '2_PER_PAGE' | '4_PER_PAGE';

interface PosterSheetContainerProps {
  id?: string;
  grid: PosterSheetGrid;
  children: React.ReactNode;
}

/**
 * Container inteligente para montagem de folhas de impressão A4 de cartazes de loja.
 * - 1_PER_PAGE: Cartaz A4 cheio (210x297mm Retrato)
 * - 2_PER_PAGE: Cartaz Duplo Meia-Folha A5 (297x210mm Paisagem com linha de corte central)
 * - 4_PER_PAGE: Grade 2x2 de Mini-Cartazes de Gôndola (210x297mm Retrato com linhas de corte em cruz)
 */
export const PosterSheetContainer: React.FC<PosterSheetContainerProps> = ({
  id = 'preview-poster-sheet',
  grid,
  children,
}) => {
  if (grid === '2_PER_PAGE') {
    // Folha A4 em Paisagem (297 x 210 mm) com dois cartazes A5 lado a lado
    return (
      <div
        id={id}
        className="w-full max-w-[620px] aspect-[297/210] bg-white border border-gray-300 shadow-xl relative overflow-hidden select-none box-border grid grid-cols-2 p-1.5"
      >
        {/* Lado Esquerdo */}
        <div className="h-full w-full pr-1.5 flex items-center justify-center overflow-hidden">
          <div className="h-full aspect-[210/297] w-auto">
            {children}
          </div>
        </div>

        {/* Linha Guia Tracejada Central de Corte */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0 border-l-2 border-dashed border-gray-400 z-30 flex flex-col items-center justify-between py-2 pointer-events-none">
          <span className="bg-white px-1 text-[8px] font-mono font-bold text-gray-500 uppercase tracking-tighter flex items-center gap-0.5 shadow-2xs rounded">
            <Scissors className="w-2.5 h-2.5" /> CORTE
          </span>
          <span className="bg-white px-1 text-[8px] font-mono font-bold text-gray-400 rotate-90">
            A5 MEIA-FOLHA
          </span>
          <span className="bg-white px-1 text-[8px] font-mono font-bold text-gray-500 uppercase tracking-tighter flex items-center gap-0.5 shadow-2xs rounded">
            <Scissors className="w-2.5 h-2.5 rotate-180" /> CORTE
          </span>
        </div>

        {/* Lado Direito */}
        <div className="h-full w-full pl-1.5 flex items-center justify-center overflow-hidden">
          <div className="h-full aspect-[210/297] w-auto">
            {children}
          </div>
        </div>
      </div>
    );
  }

  if (grid === '4_PER_PAGE') {
    // Folha A4 em Retrato (210 x 297 mm) com grade 2x2 de Mini-Cartazes
    return (
      <div
        id={id}
        className="w-full max-w-[440px] aspect-[210/297] bg-white border border-gray-300 shadow-xl relative overflow-hidden select-none box-border grid grid-cols-2 grid-rows-2 p-1.5"
      >
        {/* Linha Tracejada Vertical */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0 border-l-2 border-dashed border-gray-400 z-30 pointer-events-none" />

        {/* Linha Tracejada Horizontal */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0 border-t-2 border-dashed border-gray-400 z-30 pointer-events-none" />

        {/* Marca Central de Corte em Cruz */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1 border border-gray-300 z-40 shadow-xs pointer-events-none">
          <Scissors className="w-3 h-3 text-gray-600" />
        </div>

        {/* Quadrante 1 (Topo Esquerdo) */}
        <div className="p-1 flex items-center justify-center overflow-hidden">
          <div className="h-full aspect-[210/297] w-auto">
            {children}
          </div>
        </div>

        {/* Quadrante 2 (Topo Direito) */}
        <div className="p-1 flex items-center justify-center overflow-hidden">
          <div className="h-full aspect-[210/297] w-auto">
            {children}
          </div>
        </div>

        {/* Quadrante 3 (Base Esquerda) */}
        <div className="p-1 flex items-center justify-center overflow-hidden">
          <div className="h-full aspect-[210/297] w-auto">
            {children}
          </div>
        </div>

        {/* Quadrante 4 (Base Direita) */}
        <div className="p-1 flex items-center justify-center overflow-hidden">
          <div className="h-full aspect-[210/297] w-auto">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Padrão: 1 por folha (A4 Cheio Retrato)
  return (
    <div
      id={id}
      className="w-full max-w-[420px] aspect-[210/297] bg-white border border-gray-200 shadow-lg relative overflow-hidden select-none box-border flex items-center justify-center"
    >
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  );
};
