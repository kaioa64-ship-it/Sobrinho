import React from 'react';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import { CONTENT_LIMITS } from '../../lib/layoutRules';

/**
 * PARTE 2 · itens 3, 4 e 5: SUBTÍTULO, DIFERENCIAIS E CTA.
 *
 * Extraído de `InputPanel.tsx` na decomposição do painel (passo 5 do plano).
 * O JSX foi movido **verbatim** — classes, textos, placeholders e os alertas de
 * limite de caracteres idênticos.
 *
 * Os três campos foram agrupados porque compartilham a mesma natureza
 * (campos de texto simples com alerta de limite) e o mesmo contrato enxuto,
 * evitando três componentes quase idênticos. O **Título** ficou de fora de
 * propósito: ele tem contador, barra de progresso e borda dinâmica — regra de
 * UI bem mais densa — e será extraído separadamente.
 *
 * Os limites vêm de `CONTENT_LIMITS` (`src/lib/layoutRules.ts`), a mesma fonte
 * usada pelo renderizador, para que o aviso da UI e o corte do layout nunca
 * divirjam.
 */
export interface LiveTextFieldsSectionProps {
  renderedSubtitulo: string;
  onSubtitleChange: (value: string) => void;
  renderedBullets: string[];
  onBulletChange: (index: number, value: string) => void;
  renderedCta: string;
  onCtaChange: (value: string) => void;
}

export const LiveTextFieldsSection: React.FC<LiveTextFieldsSectionProps> = ({
  renderedSubtitulo,
  onSubtitleChange,
  renderedBullets,
  onBulletChange,
  renderedCta,
  onCtaChange,
}) => {
  return (
    <>
      {/* 3. Subtítulo Técnico com Alerta de Limite */}
      <details className="group p-3 bg-white rounded-lg border border-gray-200 shadow-2xs space-y-1 transition-all">
        <summary className="flex items-center justify-between cursor-pointer list-none">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-800">
              Subtítulo / Descrição de Função
            </span>
          </div>
          <div className="flex items-center gap-2">
            {renderedSubtitulo.length > CONTENT_LIMITS.subtitle.maxCharacters && (
              <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 font-bold flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                {renderedSubtitulo.length}/{CONTENT_LIMITS.subtitle.maxCharacters} chars
              </span>
            )}
            <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" />
          </div>
        </summary>
        <div className="mt-3 space-y-1">
          <input
            type="text"
            value={renderedSubtitulo}
            onChange={(e) => onSubtitleChange(e.target.value)}
            placeholder="Ex: Rotor balanceado para silagem uniforme e corte de alta precisão."
            className="w-full text-xs p-1.5 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#004d40]"
          />
        </div>
      </details>

      {/* 4. Diferenciais Técnicos (3 Bullets) com Alerta de Limite */}
      <details className="group p-3 bg-white rounded-lg border border-gray-200 shadow-2xs space-y-2 transition-all">
        <summary className="flex items-center justify-between cursor-pointer list-none">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-800 block">
              3 Diferenciais Técnicos
            </span>
          </div>
          <div className="flex items-center gap-2">
            {renderedBullets.some((b) => (b || '').length > CONTENT_LIMITS.benefit.maxCharacters) && (
              <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 font-bold flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                Item &gt; {CONTENT_LIMITS.benefit.maxCharacters} chars
              </span>
            )}
            <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" />
          </div>
        </summary>
        <div className="mt-3 space-y-2">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-[#004d40] w-4 text-center">
                {idx + 1}.
              </span>
              <input
                type="text"
                value={renderedBullets[idx] || ''}
                onChange={(e) => onBulletChange(idx, e.target.value)}
                placeholder={`Diferencial ${idx + 1}`}
                className="w-full text-xs p-1.5 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#004d40]"
              />
            </div>
          ))}
        </div>
      </details>

      {/* 5. Botão CTA com Alerta de Limite */}
      <details className="group p-3 bg-white rounded-lg border border-gray-200 shadow-2xs space-y-1 transition-all">
        <summary className="flex items-center justify-between cursor-pointer list-none">
          <div className="flex items-center gap-2">
            <label className="block text-[11px] font-bold text-gray-800">
              Texto do Botão CTA
            </label>
          </div>
          <div className="flex items-center gap-2">
            {renderedCta.length > CONTENT_LIMITS.cta.maxCharacters && (
              <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 font-bold flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                {renderedCta.length}/{CONTENT_LIMITS.cta.maxCharacters} chars
              </span>
            )}
            <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" />
          </div>
        </summary>
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {['Chama no WhatsApp', 'Vem conferir na loja', 'Vem para a Coagro', 'Garanta já o seu'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onCtaChange(preset.toUpperCase())}
                className="py-1 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] rounded-full border border-gray-200 transition cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={renderedCta}
            onChange={(e) => onCtaChange(e.target.value.toUpperCase())}
            placeholder="Ex: GARANTA JÁ O SEU"
            className="w-full text-xs p-1.5 rounded-md border border-gray-300 bg-white text-gray-800 uppercase font-black focus:outline-none focus:ring-1 focus:ring-[#ffab00]"
          />
        </div>
      </details>
    </>
  );
};
