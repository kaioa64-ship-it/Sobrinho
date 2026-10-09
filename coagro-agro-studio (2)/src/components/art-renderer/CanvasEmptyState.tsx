import React from 'react';
import { LogoVariant } from '../../assets/coagroLogos';
import { ArtHeader } from './ArtHeader';
import { Sparkles, Upload, FileText, CheckCircle2 } from 'lucide-react';

interface CanvasEmptyStateProps {
  logoVariant: LogoVariant;
  isStory: boolean;
  scope?: 'AGRO' | 'PET';
  isLight?: boolean;
}

export const CanvasEmptyState: React.FC<CanvasEmptyStateProps> = ({
  logoVariant,
  isStory,
  scope,
  isLight = false,
}) => {
  const isPet = scope === 'PET';
  const headingClass = isLight ? 'text-gray-900' : 'text-white';
  const subClass = isLight ? 'text-gray-600' : (isPet ? 'text-blue-100/90' : 'text-emerald-100/90');
  const badgeClass = isLight ? 'bg-gray-100 border-gray-300 shadow-sm text-[#ffab00]' : 'bg-white/10 backdrop-blur-md border-white/25 text-[#ffab00] shadow-lg';
  const boxClass = isLight ? 'bg-white/80 border-gray-200 text-gray-800 shadow-sm' : 'bg-black/35 backdrop-blur-md border-white/15 text-white/95 shadow-xl';
  const itemTextClass = isLight ? 'text-gray-700' : 'text-white/95';

  return (
    <div className="relative z-10 h-full w-full flex flex-col justify-between p-6 select-none">
      {/* Top: Coagro Brand Header */}
      <ArtHeader logoVariant={logoVariant} isStory={isStory} align="center" scope={scope} />

      {/* Middle: Clean, Premium Waiting Card */}
      <div className="my-auto flex flex-col items-center justify-center text-center px-2">
        {/* Glowing badge */}
        <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-4 ${badgeClass}`}>
          <Sparkles className="w-8 h-8 fill-current animate-pulse" />
        </div>

        <h3 className={`font-exo2 font-black uppercase text-xl sm:text-2xl tracking-wide drop-shadow-xs ${headingClass}`}>
          Aguardando Produto ou Dados
        </h3>
        <p className={`text-xs sm:text-sm font-medium max-w-[90%] mt-1.5 leading-relaxed ${subClass}`}>
          Nenhum produto ou valor pré-carregado. Insira a foto e/ou a descrição no painel ao lado para a IA gerar a arte oficial completa.
        </p>

        {/* Feature Highlights Grid */}
        <div className={`mt-5 w-full max-w-[94%] rounded-2xl p-4 border text-left space-y-2.5 ${boxClass}`}>
          <div className="text-[10px] uppercase font-bold text-[#ffab00] tracking-wider font-exo2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ffab00] animate-ping" />
            <span>O que a IA criará automaticamente:</span>
          </div>

          <div className={`grid grid-cols-1 gap-2 text-[11px] ${itemTextClass}`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#ffab00] shrink-0" />
              <span>Identificação do produto com recorte transparente</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#ffab00] shrink-0" />
              <span>Título de impacto em caixa alta com destaque ouro</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#ffab00] shrink-0" />
              <span>Subtítulo técnico e 3 diferenciações no campo</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#ffab00] shrink-0" />
              <span>Preço De/Por ou modo Informativo contextualizado</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#ffab00] shrink-0" />
              <span>Fundo fotográfico e legenda oficial para Instagram</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Subtle Guidance Bar */}
      <div className="w-full flex items-center justify-center">
        <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-[11px] text-white/90 font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Envie uma foto ou digite a descrição ao lado</span>
        </div>
      </div>
    </div>
  );
};
