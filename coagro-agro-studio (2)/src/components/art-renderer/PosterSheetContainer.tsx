import React from 'react';

export type PosterSheetGrid = '1_PER_PAGE' | '2_PER_PAGE' | '4_PER_PAGE';

interface PosterSheetContainerProps {
  id?: string;
  grid: PosterSheetGrid;
  children: React.ReactNode;
}

/**
 * Container inteligente para montagem de folhas de impressão A4 de cartazes de loja.
 * - 1_PER_PAGE: Cartaz A4 cheio (210x297mm Retrato)
 * - 2_PER_PAGE: Cartaz Duplo Meia-Folha A5 (297x210mm Paisagem com linha de corte central discreta)
 * - 4_PER_PAGE: Grade 2x2 de Mini-Cartazes de Gôndola (210x297mm Retrato com linhas de corte em cruz discretas)
 * 
 * Suporta tanto 1 único cartaz (replicado na folha para teste/demo) quanto múltiplos cartazes distintos
 * passados como array/filhos para impressão sequencial em lote.
 */
export const PosterSheetContainer: React.FC<PosterSheetContainerProps> = ({
  id = 'preview-poster-sheet',
  grid,
  children,
}) => {
  const childArray = React.Children.toArray(children);
  const isSingle = childArray.length <= 1;
  const item0 = childArray[0] ?? null;
  const item1 = childArray[1] ?? (isSingle ? item0 : null);
  const item2 = childArray[2] ?? (isSingle ? item0 : null);
  const item3 = childArray[3] ?? (isSingle ? item0 : null);

  if (grid === '2_PER_PAGE') {
    // Folha A4 em Paisagem (297 x 210 mm) com dois cartazes A5 lado a lado
    return (
      <div
        id={id}
        className="w-full max-w-[620px] aspect-[297/210] bg-white border border-gray-300 shadow-xl relative overflow-hidden select-none box-border grid grid-cols-2 p-1.5"
      >
        {/* Lado Esquerdo */}
        <div className="h-full w-full pr-1.5 flex items-center justify-center overflow-hidden">
          {item0 && (
            <div className="h-full aspect-[210/297] w-auto">
              {item0}
            </div>
          )}
        </div>

        {/* Linha Guia Tracejada Central de Corte Limpa (Sem tesouras sobrepondo elementos da Coagro) */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0 border-l border-dashed border-gray-300 z-20 pointer-events-none" />

        {/* Lado Direito */}
        <div className="h-full w-full pl-1.5 flex items-center justify-center overflow-hidden">
          {item1 && (
            <div className="h-full aspect-[210/297] w-auto">
              {item1}
            </div>
          )}
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
        {/* Linhas Tracejadas de Corte Limpas (Sem ícones de tesoura poluindo o centro) */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0 border-l border-dashed border-gray-300 z-20 pointer-events-none" />
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0 border-t border-dashed border-gray-300 z-20 pointer-events-none" />

        {/* Quadrante 1 (Topo Esquerdo) */}
        <div className="p-1 flex items-center justify-center overflow-hidden">
          {item0 && (
            <div className="h-full aspect-[210/297] w-auto">
              {item0}
            </div>
          )}
        </div>

        {/* Quadrante 2 (Topo Direito) */}
        <div className="p-1 flex items-center justify-center overflow-hidden">
          {item1 && (
            <div className="h-full aspect-[210/297] w-auto">
              {item1}
            </div>
          )}
        </div>

        {/* Quadrante 3 (Base Esquerda) */}
        <div className="p-1 flex items-center justify-center overflow-hidden">
          {item2 && (
            <div className="h-full aspect-[210/297] w-auto">
              {item2}
            </div>
          )}
        </div>

        {/* Quadrante 4 (Base Direita) */}
        <div className="p-1 flex items-center justify-center overflow-hidden">
          {item3 && (
            <div className="h-full aspect-[210/297] w-auto">
              {item3}
            </div>
          )}
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
        {item0 || children}
      </div>
    </div>
  );
};
