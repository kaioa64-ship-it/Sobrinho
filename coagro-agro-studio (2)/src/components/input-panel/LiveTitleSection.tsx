import React from 'react';
import { Sparkles, ChevronDown, CheckCircle2, AlertTriangle, AlertCircle, Check } from 'lucide-react';

/**
 * PARTE 2 · item 2: TÍTULO DE IMPACTO & PALAVRA DESTAQUE.
 *
 * Extraído de `InputPanel.tsx` na decomposição do painel (passo 5 do plano).
 * O JSX foi movido **verbatim** — classes, textos, placeholders e as três
 * mensagens de status (ideal / recomendado / acima do ideal) idênticos.
 *
 * As métricas do título (`titleCharCount`, `titleWordsCount`, `titleStatus`)
 * foram **movidas junto**, porque eram derivadas puras de `renderedTitulo` e
 * usadas exclusivamente por este bloco. Isso derruba o contrato de 11 para 7
 * props e faz a regra de UI viajar com a UI que a usa. Era o único ponto do
 * painel que conhecia o limite ideal de caracteres.
 */
export interface LiveTitleSectionProps {
  appMode: 'AGRO' | 'PET';
  renderedTitulo: string;
  onTitleChange: (value: string) => void;
  renderedPalavraOuro: string;
  onGoldenWordChange: (word: string) => void;
  /** Título anterior, para o botão "Desfazer redução". */
  previousTitle: string | null;
  onPreviousTitleChange: (title: string | null) => void;
}

export const LiveTitleSection: React.FC<LiveTitleSectionProps> = ({
  appMode,
  renderedTitulo,
  onTitleChange,
  renderedPalavraOuro,
  onGoldenWordChange,
  previousTitle,
  onPreviousTitleChange,
}) => {
  // Métricas e Alerta do Limite Ideal do Título para Redes Sociais
  const titleCharCount = renderedTitulo.trim().length;
  const titleWordsCount = renderedTitulo.trim()
    ? renderedTitulo.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const IDEAL_TITLE_CHARS = 28; // Limite recomendado para stories (1080x1920) e feed (1:1 / 4:5)
  const MAX_RECOMMENDED_CHARS = 35; // Acima de 35 caracteres, o impacto visual cai e o risco de corte aumenta
  // NOTA: MAX_RECOMMENDED_CHARS == CONTENT_LIMITS.title.maxCharacters (35).
  // Mantido literal aqui para preservar o comportamento; unificar é um cleanup futuro.

  const titleStatus: 'ideal' | 'warning' | 'danger' =
    titleCharCount === 0 || titleCharCount <= IDEAL_TITLE_CHARS
      ? 'ideal'
      : titleCharCount <= MAX_RECOMMENDED_CHARS
      ? 'warning'
      : 'danger';

  return (
    <details className="group p-3 bg-white rounded-lg border border-gray-200 shadow-2xs space-y-3 transition-all" open>
      <summary className="flex items-center justify-between cursor-pointer list-none">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#ffab00]" />
            Título de Impacto & Destaque
          </span>
          <span className="text-[10px] text-gray-400 font-mono">
            Stories & Feed
          </span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-3 space-y-3">

      <div>
        {/* Cabeçalho do campo com Contador e Tag de Limite Ideal */}
        <div className="flex items-center justify-between mb-1 gap-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <span>Título Principal:</span>
            {titleWordsCount > 0 && (
              <span
                className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-md ${
                  titleWordsCount <= 4
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-amber-100 text-amber-900 border border-amber-200'
                }`}
              >
                {titleWordsCount} {titleWordsCount === 1 ? 'palavra' : 'palavras'}
                {titleWordsCount > 4 && ' (máx. 4)'}
              </span>
            )}
          </label>

          {/* Indicador Visual de Contagem de Caracteres e Status de Impacto */}
          <div className="flex items-center gap-1 shrink-0">
            {titleStatus === 'ideal' && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 stroke-[2.5]" />
                <span>{titleCharCount}/{IDEAL_TITLE_CHARS} • Limite Ideal</span>
              </span>
            )}
            {titleStatus === 'warning' && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                <AlertTriangle className="w-2.5 h-2.5 text-amber-600 stroke-[2.5]" />
                <span>{titleCharCount}/{IDEAL_TITLE_CHARS} • Limite Recomendado</span>
              </span>
            )}
            {titleStatus === 'danger' && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs animate-pulse">
                <AlertCircle className="w-2.5 h-2.5 text-rose-600 stroke-[2.5]" />
                <span>{titleCharCount}/{IDEAL_TITLE_CHARS} • Acima do Ideal</span>
              </span>
            )}
          </div>
        </div>

        {/* Input do Título com Borda Dinâmica baseada no Status */}
        <div className="relative">
          <input
            type="text"
            value={renderedTitulo}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Ex: FORRAGEIRA DE ALTA POTÊNCIA"
            className={`w-full text-xs p-2 rounded-lg bg-white uppercase font-black transition-all shadow-2xs ${
              titleStatus === 'ideal'
                ? 'border border-gray-300 text-gray-800 focus:outline-none focus:border-[#004d40] focus:ring-2 focus:ring-[#004d40]/20'
                : titleStatus === 'warning'
                ? 'border border-amber-400 text-gray-900 bg-amber-50/15 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                : 'border border-rose-400 text-gray-900 bg-rose-50/20 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
            }`}
          />
        </div>

        {/* Barra Visual de Progresso de Impacto para Redes Sociais */}
        <div className="mt-1.5 space-y-1">
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden relative border border-gray-200/60">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                titleStatus === 'ideal'
                  ? 'bg-emerald-500'
                  : titleStatus === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, (titleCharCount / IDEAL_TITLE_CHARS) * 100)}%` }}
            />
          </div>

          {/* Mensagem e Alerta de Impacto Recomendado para Redes Sociais */}
          <div className="flex items-center justify-between text-[9px] pt-0.5">
            {titleStatus === 'ideal' && (
              <p className="text-emerald-700 font-medium flex items-center gap-1 leading-tight">
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                <span><strong>Impacto excelente:</strong> leitura instantânea em Stories (1080x1920) e Feed.</span>
              </p>
            )}
            {titleStatus === 'warning' && (
              <p className="text-amber-800 font-medium flex items-center gap-1 leading-tight">
                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                <span><strong>Atenção:</strong> próximo do limite ({IDEAL_TITLE_CHARS} chars). Título pode quebrar em 2 linhas.</span>
              </p>
            )}
            {titleStatus === 'danger' && (
              <div className="w-full flex items-center justify-between gap-1 flex-wrap">
                <p className="text-rose-700 font-medium flex items-center gap-1 leading-tight">
                  <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                  <span><strong>Alerta para redes:</strong> excedeu o limite ideal ({titleCharCount - IDEAL_TITLE_CHARS} chars a mais). Pode poluir a arte.</span>
                </p>
                <div className="flex items-center gap-1 ml-auto">
                  {previousTitle && (
                    <button
                      type="button"
                      onClick={() => {
                        onTitleChange(previousTitle);
                        onPreviousTitleChange(null);
                      }}
                      className="text-[9px] font-bold text-gray-600 hover:text-gray-900 underline shrink-0 cursor-pointer"
                    >
                      Desfazer redução
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const words = renderedTitulo.trim().split(/\s+/);
                      let newTitle = '';
                      for (const w of words) {
                        if ((newTitle + (newTitle ? ' ' : '') + w).length <= IDEAL_TITLE_CHARS) {
                          newTitle += (newTitle ? ' ' : '') + w;
                        } else {
                          break;
                        }
                      }
                      onPreviousTitleChange(renderedTitulo);
                      const finalReduced = newTitle || renderedTitulo.slice(0, IDEAL_TITLE_CHARS).trim();
                      onTitleChange(finalReduced);

                      // Se a palavra-ouro não estiver mais no título reduzido, reseta para não quebrar a marcação (Correção 11)
                      const reducedWords = finalReduced.toUpperCase().split(/\s+/).map((w) => w.replace(/[.,!?:;]/g, ''));
                      if (renderedPalavraOuro && !reducedWords.includes(renderedPalavraOuro.toUpperCase())) {
                        onGoldenWordChange('');
                      }
                    }}
                    className="text-[9px] font-bold text-rose-700 hover:text-rose-900 underline shrink-0 cursor-pointer"
                  >
                    Reduzir para o limite
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Palavra Destaque em Ouro */}
      <div className="pt-2 border-t border-gray-100">
        <label className="block text-[10px] font-semibold text-gray-600 mb-1.5">
          Palavra Destaque ({appMode === 'PET' ? 'Laranja Pet' : 'Ouro Agro'}):
        </label>
        <div className="flex flex-wrap gap-1.5">
          {renderedTitulo ? (
            renderedTitulo.split(/\s+/).filter(Boolean).map((word, index) => {
              const cleanWord = word.replace(/[.,!?:;]/g, '');
              const isSelected = renderedPalavraOuro?.toUpperCase() === cleanWord.toUpperCase() || renderedPalavraOuro?.toUpperCase() === word.toUpperCase();
              return (
                <button
                  key={`${word}-${index}`}
                  type="button"
                  onClick={() => onGoldenWordChange(isSelected ? '' : cleanWord)}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                    isSelected
                      ? appMode === 'PET'
                        ? 'bg-[#E96C2C] text-white border border-[#E96C2C]'
                        : 'bg-[#ffab00] text-gray-900 border border-[#ffab00]'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {cleanWord}
                </button>
              );
            })
          ) : (
            <p className="text-[10px] text-gray-400 italic">Digite um título para selecionar o destaque.</p>
          )}
        </div>
        <p className="text-[9px] text-gray-400 mt-1">
          Selecione uma palavra do título para receber a cor de destaque da marca.
        </p>
      </div>
    </div>
    </details>
  );
};
