import React, { useEffect, useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { SingleArtRenderer } from './SingleArtRenderer';
import { BatchItem } from './ExcelBatchUploader';
import { PosterSheetContainer, PosterSheetGrid } from './art-renderer/PosterSheetContainer';
import { jsPDF } from 'jspdf';
import { EMPTY_AGRO_CONTENT } from '../types/agro';
import type { PosterTemplateLayout } from '../types/agro';
import type { ScopeId } from '../lib/brand.config';
import { calculateDiscount } from '../lib/priceCalculator';
import { CheckCircle2, Loader2, X } from 'lucide-react';

interface BatchRendererModalProps {
  items: BatchItem[];
  exportFormat?: 'PNG' | 'PDF';
  templateLayout?: PosterTemplateLayout;
  headerText?: string;
  gridFormat?: PosterSheetGrid;
  /** Escopo/marca do lote (vem do tenant ativo). Ver src/lib/brand.config.ts. */
  scope?: ScopeId;
  onClose: () => void;
}

export const BatchRendererModal: React.FC<BatchRendererModalProps> = ({ 
  items, 
  exportFormat = 'PDF', 
  templateLayout = 'promo-mono-a4', 
  headerText = 'OFERTA', 
  gridFormat = '1_PER_PAGE',
  scope, 
  onClose 
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const pdfRef = useRef<jsPDF | null>(null);

  const chunkSize = gridFormat === '4_PER_PAGE' ? 4 : gridFormat === '2_PER_PAGE' ? 2 : 1;
  const totalPages = Math.ceil(items.length / chunkSize);
  const isLandscape = gridFormat === '2_PER_PAGE';

  useEffect(() => {
    if (exportFormat === 'PDF' && !pdfRef.current) {
      pdfRef.current = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true // Adds deflation compression
      });
    }
  }, [exportFormat, isLandscape]);

  useEffect(() => {
    if (items.length === 0) return;
    
    // Se terminou todas as páginas ou foi cancelado, finaliza.
    if (currentPageIndex >= totalPages || isCancelled) {
      if (!isComplete) {
        setIsComplete(true);
        if (exportFormat === 'PDF' && pdfRef.current) {
          pdfRef.current.save(`Coagro_Cartazes_${gridFormat}_${Date.now()}.pdf`);
        }
      }
      return;
    }

    const delay = currentPageIndex === 0 ? 500 : 250;
    const timer = setTimeout(async () => {
      const containerId = 'batch-page-render';
      const element = document.getElementById(containerId);
      const startIdx = currentPageIndex * chunkSize;
      const pageItems = items.slice(startIdx, startIdx + chunkSize);
      
      if (element) {
        try {
          if (exportFormat === 'PDF') {
            // Usa PNG de alta resolução gráfica (300 DPI) com compressão Deflate sem perdas
            const dataUrl = await toPng(element, { quality: 1, pixelRatio: 3.125, cacheBust: true });
            
            if (currentPageIndex > 0 && pdfRef.current) {
              pdfRef.current.addPage();
            }
            if (pdfRef.current) {
              if (isLandscape) {
                pdfRef.current.addImage(dataUrl, 'PNG', 0, 0, 297, 210, undefined, 'FAST');
              } else {
                pdfRef.current.addImage(dataUrl, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
              }
            }
            const codesSummary = pageItems.map(p => p.codigo).join(', ');
            setLogs((prev) => [`[Folha ${currentPageIndex + 1}/${totalPages}] Itens: ${codesSummary} adicionados em 300 DPI.`, ...prev]);
          } else {
            // PNG por folha montada em alta resolução (300 DPI)
            const dataUrl = await toPng(element, { quality: 1, pixelRatio: 3.125, cacheBust: true });
            const filename = `Coagro_Folha_${currentPageIndex + 1}_${Date.now()}.png`;
            const link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            link.click();
            setLogs((prev) => [`[Folha ${currentPageIndex + 1}/${totalPages}] Gerada em alta resolução!`, ...prev]);
          }
        } catch (error: any) {
          setLogs((prev) => [`[ERRO Folha ${currentPageIndex + 1}] Falha: ${error.message}`, ...prev]);
        }
      }

      setCurrentPageIndex((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentPageIndex, totalPages, items, isCancelled, isComplete, exportFormat, isLandscape, chunkSize, gridFormat]);

  const currentStartIdx = currentPageIndex * chunkSize;
  const currentPageItems = items.slice(currentStartIdx, currentStartIdx + chunkSize);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-['Inter']">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-xl font-black text-gray-800 font-exo2 uppercase tracking-wide">
              Gerador em Lote ({gridFormat === '4_PER_PAGE' ? '4 por Folha' : gridFormat === '2_PER_PAGE' ? '2 por Folha' : 'A4 Cheio'})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isComplete 
                ? 'Processo finalizado com sucesso!' 
                : `Gerando folha ${currentPageIndex + 1} de ${totalPages} (${items.length} itens no total)...`}
            </p>
          </div>
          {isComplete && (
            <button onClick={onClose} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition cursor-pointer">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-[#004d40] h-full transition-all duration-300"
                style={{ width: `${totalPages > 0 ? (currentPageIndex / totalPages) * 100 : 0}%` }}
              />
            </div>
            <span className="font-bold text-[#004d40]">
              {totalPages > 0 ? Math.round((currentPageIndex / totalPages) * 100) : 0}%
            </span>
          </div>

          <div className="bg-gray-900 text-green-400 font-mono text-xs p-4 rounded-xl h-48 overflow-y-auto space-y-1">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
            {!isComplete && (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Renderizando página...
              </div>
            )}
          </div>

          {isComplete || isCancelled ? (
            <div className={`flex flex-col items-center justify-center gap-2 font-bold py-3 rounded-xl border text-center ${isCancelled ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
              <div className="flex items-center gap-2">
                {isCancelled ? <X className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                {isCancelled ? 'Geração cancelada pelo usuário!' : 'Todas as folhas selecionadas foram processadas!'}
              </div>
              {exportFormat === 'PDF' && (
                <span className={`text-xs font-normal ${isCancelled ? 'text-red-500' : 'text-emerald-500'}`}>
                  {isCancelled ? 'Um PDF parcial com as folhas processadas até aqui foi baixado.' : 'O arquivo PDF com todas as folhas unidas foi baixado com sucesso.'}
                </span>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setIsCancelled(true)}
              className="w-full mt-2 py-2.5 border-2 border-red-500 text-red-600 font-bold rounded-xl hover:bg-red-50 transition cursor-pointer"
            >
              Cancelar Geração
            </button>
          )}
        </div>

        {/* Área Oculta para Renderização e Captura da Folha (com dimensões precisas de A4 300 DPI) */}
        <div className={`fixed top-0 left-0 ${isLandscape ? 'w-[1123px]' : 'w-[794px]'} pointer-events-none z-[-10]`}>
          {currentPageIndex < totalPages && (
            <div id="batch-page-render">
              <PosterSheetContainer grid={gridFormat} className="max-w-none w-full" id="batch-sheet-container">
                {currentPageItems.map((item, idx) => (
                  <SingleArtRenderer
                    key={`${item.id}-${idx}`}
                    content={{
                      ...EMPTY_AGRO_CONTENT,
                      linha: scope,
                      textos_hero: { titulo: item.titulo, palavra_destaque_ouro: '', subtitulo: '' },
                      modulo_preco: {
                        ativo: true,
                        valor_de: item.valorDe,
                        valor_por: item.valorPor,
                        condicoes_pagamento: ''
                      },
                      tipo_postagem: 'promocao'
                    }}
                    format="a4-retrato"
                    theme="azul-coagro"
                    templateLayout={templateLayout}
                    imageBoxFormat="rectangular"
                    codigoProduto={String(item.codigo)}
                    containerId={`batch-subart-${item.id}-${idx}`}
                    badgeText={headerText}
                    scopeOverride={scope}
                    discountBadge={(() => {
                      const discount = calculateDiscount(item.valorDe, item.valorPor);
                      return discount ? discount.badgeText : undefined;
                    })()}
                  />
                ))}
              </PosterSheetContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
