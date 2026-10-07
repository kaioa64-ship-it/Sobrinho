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
import { getDynamicTitleSize } from '../../../lib/typography';

export interface UnifiedSplitProps {
  codigo?: string;
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
  textBackground?: boolean;
  isLight?: boolean;
}

/**
 * UnifiedSplit - O Modelo Split (Lateral) Unificado
 * Blindado 100% para Story 9:16 (conforme restrição)
 * Adapta tipografia, cores e mascotes com base no `scope`.
 * Produto fica à esquerda, blocos de texto/preço à direita.
 */
export const UnifiedSplit: React.FC<UnifiedSplitProps> = ({
  codigo,
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
  textBackground = false,
  isLight = false,
}) => {
  const isPet = scope === 'PET';

  const titleColor = isLight ? 'text-[#004d40]' : isPet ? 'text-[#4897D0]' : 'text-white';
  const highlightColor = isPet ? 'text-[#E96C2C]' : 'text-[#ffab00]';
  const subtitleColor = isLight ? 'text-gray-700' : isPet ? 'text-gray-700' : 'text-[#E5E7EB]';
  const titleFont = isPet ? 'font-exo2 font-black tracking-tight' : 'font-exo2 font-black uppercase tracking-tight';

  const displayBenefits = benefits && benefits.length > 0 ? benefits.slice(0, 3) : [];

  return (
    <div className={`relative z-10 w-full h-full flex flex-col justify-between items-center px-4 ${isStory ? 'py-8' : 'py-3'} select-none font-['Inter']`}>
      

      {/* 1. Header (Topo - 15%) */}
      <header className="w-full flex flex-col items-center shrink-0 z-20">
        <ArtHeader logoVariant={logoVariant || (isPet ? 'h-azul' : 'h-branca')} isStory={isStory} align="center" />
      </header>

      {/* 1.5. Títulos Centralizados */}
      <div className="w-full flex flex-col items-center text-center mt-3 z-30 shrink-0 px-2">
        {title && (
          <h1 className={`leading-tight line-clamp-2 drop-shadow-md ${getDynamicTitleSize(title)} ${titleFont} ${titleColor}`}>
            {renderTitleWithHighlight(title, highlight, highlightColor)}
          </h1>
        )}
        {subtitle && (
          <p className={`mt-1 font-bold leading-snug drop-shadow-sm text-[15px] sm:text-[17px] uppercase ${subtitleColor}`}>
            {subtitle}
          </p>
        )}
      </div>

      {/* 2. Centro Split (Produto Esquerda / Infos Direita) */}
      <div className="flex-1 min-h-0 w-full relative flex flex-row items-center justify-between my-2 gap-4">
        
        {/* Lado Esquerdo: Produto */}
        <div className="w-[50%] h-full flex flex-col items-center justify-end pb-8 relative z-40">
          {processedProduct && (
            <SemanticProductImage src={processedProduct} renderizacao={renderizacao} codigo={codigo} />
          )}
        </div>

        {/* Lado Direito: Diferenciais e Preço */}
        <div className={`w-[50%] h-full flex flex-col justify-center items-start z-30 pt-4 pr-4 ${textBackground ? 'bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/40' : ''}`}>
          
          {displayBenefits.length > 0 && (
            <div className="w-full">
              <BenefitsList benefits={displayBenefits} variant={isPet ? 'badges-horizontal' : 'default'} textColor="text-gray-800" />
            </div>
          )}

          {hasPrice && currentPrice && (
            <div className="mt-4 w-full drop-shadow-xl scale-110 origin-left">
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
