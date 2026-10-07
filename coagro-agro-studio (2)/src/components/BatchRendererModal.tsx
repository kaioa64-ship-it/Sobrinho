import React, { useEffect, useState, useRef } from 'react';
import { toPng, toJpeg } from 'html-to-image';
import { SingleArtRenderer } from './SingleArtRenderer';
import { BatchItem } from './ExcelBatchUploader';
import { jsPDF } from 'jspdf';
import { EMPTY_AGRO_CONTENT } from '../types/agro';
import { CheckCircle2, Loader2, X } from 'lucide-react';

interface BatchRendererModalProps {
  items: BatchItem[];
  exportFormat?: 'PNG' | 'PDF';
  templateLayout?: 'promo-agro-a4' | 'promo-text-only' | 'promo-mono-a4';
  headerText?: string;
  onClose: () => void;
}

export const BatchRendererModal: React.FC<BatchRendererModalProps> = ({ items, exportFormat = 'PNG', templateLayout = 'promo-text-only', headerText = 'OFERTA', onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const pdfRef = useRef<jsPDF | null>(null);

  useEffect(() => {
    if (exportFormat === 'PDF' && !pdfRef.current) {
      pdfRef.current = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true // Adds deflation compression
      });
    }
  }, [exportFormat]);

  useEffect(() => {
    if (items.length === 0) return;
    
    // Se terminou a lista ou foi cancelado, finaliza.
    if (currentIndex >= items.length || isCancelled) {
      if (!isComplete) {
        setIsComplete(true);
        if (exportFormat === 'PDF' && pdfRef.current) {
          pdfRef.current.save(`Coagro_Cartazes_A4_${Date.now()}.pdf`);
        }
      }
      return;
    }

    const timer = setTimeout(async () => {
      const item = items[currentIndex];
      const containerId = `batch-render-${item.id}`;
      const element = document.getElementById(containerId);
      
      if (element) {
        try {
          if (exportFormat === 'PDF') {
            // Usa JPEG com baixa resolução e compressão para evitar travamento em lotes grandes
            const dataUrl = await toJpeg(element, { quality: 0.8, pixelRatio: 1.2 });
            
            if (currentIndex > 0 && pdfRef.current) {
              pdfRef.current.addPage();
            }
            if (pdfRef.current) {
              pdfRef.current.addImage(dataUrl, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
            }
            setLogs((prev) => [`[${item.codigo}] ${item.titulo} adicionado ao PDF.`, ...prev]);
          } else {
            // PNG para artes soltas
            const dataUrl = await toPng(element, { quality: 0.95, pixelRatio: 1.5 });
            const filename = `Coagro_Promo_${item.codigo}_${Date.now()}.png`;
            const link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            link.click();
            setLogs((prev) => [`[${item.codigo}] ${item.titulo} gerado com sucesso!`, ...prev]);
          }
        } catch (error: any) {
          setLogs((prev) => [`[ERRO ${item.codigo}] Falha ao gerar: ${error.message}`, ...prev]);
        }
      }

      setCurrentIndex((prev) => prev + 1);
    }, 1500); // 1.5 seconds per render to ensure DOM is ready and fonts loaded

    return () => clearTimeout(timer);
  }, [currentIndex, items]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-['Inter']">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-xl font-black text-gray-800 font-exo2 uppercase tracking-wide">
              Gerador em Lote (Macro)
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isComplete ? 'Processo finalizado.' : `Processando ${currentIndex + 1} de ${items.length} artes...`}
            </p>
          </div>
          {isComplete && (
            <button onClick={onClose} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-[#004d40] h-full transition-all duration-300"
                style={{ width: `${(currentIndex / items.length) * 100}%` }}
              />
            </div>
            <span className="font-bold text-[#004d40]">
              {Math.round((currentIndex / items.length) * 100)}%
            </span>
          </div>

          <div className="bg-gray-900 text-green-400 font-mono text-xs p-4 rounded-xl h-48 overflow-y-auto space-y-1">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
            {!isComplete && (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Renderizando...
              </div>
            )}
          </div>

          {isComplete || isCancelled ? (
            <div className={`flex flex-col items-center justify-center gap-2 font-bold py-3 rounded-xl border text-center ${isCancelled ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
              <div className="flex items-center gap-2">
                {isCancelled ? <X className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                {isCancelled ? 'Geração cancelada pelo usuário!' : 'Todas as artes selecionadas foram processadas!'}
              </div>
              {exportFormat === 'PDF' && (
                <span className={`text-xs font-normal ${isCancelled ? 'text-red-500' : 'text-emerald-500'}`}>
                  {isCancelled ? 'Um PDF parcial com as artes processadas até aqui foi baixado.' : 'O arquivo PDF com todas as páginas unidas foi baixado.'}
                </span>
              )}
            </div>
          ) : (
            <button 
              onClick={() => setIsCancelled(true)}
              className="w-full mt-2 py-2.5 border-2 border-red-500 text-red-600 font-bold rounded-xl hover:bg-red-50 transition"
            >
              Cancelar Geração
            </button>
          )}
        </div>

        {/* Render Area for the current item (Off-screen but with dimensions so html-to-image works) */}
        <div className="fixed top-0 left-0 w-[420px] pointer-events-none z-[-10]">
          {currentIndex < items.length && (
            <div id={`batch-render-${items[currentIndex].id}`}>
              <SingleArtRenderer
                content={{
                  ...EMPTY_AGRO_CONTENT,
                  textos_hero: { titulo: items[currentIndex].titulo, palavra_destaque_ouro: '', subtitulo: '' },
                  modulo_preco: {
                    ativo: true,
                    valor_de: items[currentIndex].valorDe,
                    valor_por: items[currentIndex].valorPor,
                    condicoes_pagamento: ''
                  },
                  tipo_postagem: 'promocao'
                }}
                format="a4-retrato"
                theme="azul-coagro"
                templateLayout={templateLayout}
                imageBoxFormat="rectangular"
                codigoProduto={String(items[currentIndex].codigo)}
                containerId={`batch-render-${items[currentIndex].id}`}
                badgeText={headerText}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
