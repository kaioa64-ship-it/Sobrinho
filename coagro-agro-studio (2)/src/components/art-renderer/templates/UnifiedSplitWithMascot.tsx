import React from 'react';
import { LogoVariant } from '../../../assets/coagroLogos';
import { CommunicationMode } from '../../../lib/communicationMode';
import { ProductOrientation } from '../../../lib/alphaBounds';
import { renderTitleWithHighlight } from '../../../lib/renderHelper';
import { ArtHeader } from '../ArtHeader';
import { BenefitsList } from '../BenefitsList';
import { PriceCard } from '../PriceCard';
import { ArtCta } from '../ArtCta';
import { RenderizacaoVisual } from '../../../types/agro';
import { SemanticProductImage } from '../SemanticProductImage';

export interface UnifiedSplitWithMascotProps {
  scope: 'AGRO' | 'PET';
  title: string;
  highlight: string;
  subtitle?: string;
  processedProduct: string;
  isStory: boolean; // Locked to true
  logoVariant?: LogoVariant;
  mode: CommunicationMode;
  hasPrice: boolean;
  currentPrice: string;
  oldPrice?: string;
  condition?: string;
  benefits: string[];
  cta: string;
  renderizacao?: RenderizacaoVisual;
}

/**
 * UnifiedSplitWithMascot - O Modelo Split (Lateral) Unificado
 * Blindado 100% para Story 9:16 (conforme restrição)
 * Adapta tipografia, cores e mascotes com base no `scope`.
 * Produto fica à esquerda, blocos de texto/preço à direita.
 */
export const UnifiedSplitWithMascot: React.FC<UnifiedSplitWithMascotProps> = ({
  scope,
  title,
  highlight,
  subtitle,
  processedProduct,
  isStory,
  logoVariant,
  mode,
  hasPrice,
  currentPrice,
  oldPrice,
  condition,
  benefits = [],
  cta,
  renderizacao,
}) => {
  const isPet = scope === 'PET';

  const titleColor = isPet ? 'text-[#4897D0]' : 'text-white';
  const highlightColor = isPet ? 'text-[#E96C2C]' : 'text-[#ffab00]';
  const subtitleColor = isPet ? 'text-gray-700' : 'text-[#E5E7EB]';
  const titleFont = isPet ? 'font-exo2 font-black tracking-tight' : 'font-exo2 font-black uppercase tracking-tight';

  const displayBenefits = benefits && benefits.length > 0 ? benefits.slice(0, 3) : [];

  // Lógica de Mascotes (Variação para o modelo Split: Ricardo para Agro, Charles para Pet)
  const mascotSrc = isPet 
    ? '/mascotes/charles/CHARLES P1.png'
    : '/mascotes/ricardo.png';

  return (
    <div className={`relative z-10 w-full h-full flex flex-col justify-between items-center px-4 ${isStory ? 'py-8' : 'py-3'} select-none font-['Inter']`}>
      
      {/* Mascote Posicionado de Forma Absoluta */}
      {mascotSrc && (
        <img 
          src={mascotSrc} 
          alt="Mascote" 
          className={`absolute z-25 object-contain drop-shadow-2xl ${isPet ? 'w-[120px] -bottom-2 -left-4' : 'w-[140px] -bottom-2 -left-4'}`}
        />
      )}
      
      {/* 1. Header (Topo - 15%) */}
      <header className="w-full flex flex-col items-center shrink-0 z-20">
        <ArtHeader logoVariant={logoVariant || (isPet ? 'h-azul' : 'h-branca')} isStory={isStory} align="center" />
      </header>

      {/* 2. Centro Split (Produto Esquerda / Infos Direita - 65%) */}
      <div className="flex-1 min-h-0 w-full relative flex flex-row items-center justify-between my-2 gap-4">
        
        {/* Lado Esquerdo: Produto */}
        <div className="w-[55%] h-full flex flex-col items-center justify-end pb-8 relative z-40">
          {processedProduct && (
            <SemanticProductImage src={processedProduct} renderizacao={renderizacao} />
          )}
        </div>

        {/* Lado Direito: Título, Subtítulo e Preço */}
        <div className="w-[55%] h-full flex flex-col justify-center items-start z-30 pt-2 pb-16 -ml-[10%] pr-4">
          {title && (
            <h1 className={`leading-[1.05] drop-shadow-md text-left text-[24px] sm:text-[28px] line-clamp-4 ${titleFont} ${titleColor}`}>
              {renderTitleWithHighlight(title, highlight, highlightColor)}
            </h1>
          )}

          {subtitle && (
            <p className={`mt-2 font-bold text-left leading-snug drop-shadow-sm text-[13px] sm:text-[15px] uppercase line-clamp-3 ${subtitleColor}`}>
              {subtitle}
            </p>
          )}

          {displayBenefits.length > 0 && (
            <div className="mt-4 w-full">
              <BenefitsList benefits={displayBenefits} variant={isPet ? 'badges-horizontal' : 'default'} textColor="text-white" />
            </div>
          )}

          {hasPrice && currentPrice && (
            <div className="mt-4 w-full drop-shadow-xl scale-95 sm:scale-110 origin-left">
               <PriceCard
                mode={mode}
                oldPrice={oldPrice}
                currentPrice={currentPrice}
                condition={condition}
                variant={isPet ? 'pet' : 'default'}
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. Rodapé (CTA - 15%) */}
      <footer className="w-full shrink-0 flex flex-col items-center z-20">
        {cta && (
          <div className="w-[90%]">
             <ArtCta ctaText={cta} variant={isPet ? 'pet' : 'default'} fullWidth />
          </div>
        )}
      </footer>

    </div>
  );
};
