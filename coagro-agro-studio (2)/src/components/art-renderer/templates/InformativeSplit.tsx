import React from 'react';
import { LogoVariant } from '../../../assets/coagroLogos';
import { renderTitleWithHighlight } from '../../../lib/renderHelper';
import { ArtHeader } from '../ArtHeader';
import { BenefitsList } from '../BenefitsList';
import { ArtCta } from '../ArtCta';
import { RenderizacaoVisual } from '../../../types/agro';
import { SemanticProductImage } from '../SemanticProductImage';
import { getDynamicTitleSize } from '../../../lib/typography';

export interface InformativeSplitProps {
  scope: 'AGRO' | 'PET';
  title: string;
  highlight: string;
  subtitle?: string;
  processedProduct: string;
  isStory: boolean;
  logoVariant?: LogoVariant;
  benefits: string[];
  cta: string;
  renderizacao?: RenderizacaoVisual;
  textBackground?: boolean;
  codigo?: string;
  isLight?: boolean;
}

/**
 * InformativeSplit - Modelo Institucional/Informativo Lateral
 * Textos na direita, produto na esquerda.
 */
export const InformativeSplit: React.FC<InformativeSplitProps> = ({
  scope,
  title,
  highlight,
  subtitle,
  processedProduct,
  isStory,
  logoVariant,
  benefits = [],
  cta,
  renderizacao,
  textBackground = true,
  codigo,
  isLight = false,
}) => {
  const isPet = scope === 'PET';

  const titleColor = isLight ? 'text-[#004d40]' : isPet ? 'text-[#4897D0]' : 'text-white';
  const highlightColor = isPet ? 'text-[#E96C2C]' : 'text-[#ffab00]';
  const subtitleColor = isLight ? 'text-gray-700' : isPet ? 'text-gray-100' : 'text-[#E5E7EB]';
  const titleFont = isPet ? 'font-exo2 font-black tracking-tight' : 'font-exo2 font-black uppercase tracking-tight';
  const displayBenefits = benefits && benefits.length > 0 ? benefits.slice(0, 3) : [];

  return (
    <div className={`relative z-10 w-full h-full flex flex-col justify-between items-center px-4 ${isStory ? 'py-8' : 'py-3'} select-none font-['Inter']`}>
      
      {/* 1. Header (Topo) */}
      <header className="w-full flex flex-col items-center shrink-0 z-20">
        <ArtHeader logoVariant={logoVariant || (isPet ? 'h-azul' : 'h-branca')} isStory={isStory} align="center" scope={scope} />
      </header>

      {/* 1.5. Títulos Centralizados */}
      <div className="w-full flex flex-col items-center text-center mt-3 z-30 shrink-0 px-2">
        {title && (
          <h1 className={`leading-tight line-clamp-2 drop-shadow-md ${getDynamicTitleSize(title)} ${titleFont} ${titleColor}`}>
            {renderTitleWithHighlight(title, highlight, highlightColor)}
          </h1>
        )}
        {subtitle && (
          <p className={`mt-1 font-medium leading-snug drop-shadow-sm text-[14px] sm:text-[16px] ${subtitleColor}`}>
            {subtitle}
          </p>
        )}
      </div>

      {/* 2. Centro Split (Produto Esquerda / Textos Direita) */}
      <div className="flex-1 min-h-0 w-full relative flex flex-row items-center justify-between my-2 gap-4">
        
        {/* Lado Esquerdo: Produto Centralizado Harmoniosamente */}
        <div className="w-[50%] h-full flex flex-col items-center justify-center relative z-40">
          {processedProduct && (
            <SemanticProductImage src={processedProduct} renderizacao={renderizacao} codigo={codigo} />
          )}
        </div>

        {/* Lado Direito: Textos */}
        <div className={`w-[50%] h-full flex flex-col justify-center items-start z-30 pt-2 pr-2`}>
          {displayBenefits.length > 0 && (
            <div className="w-full">
              <BenefitsList benefits={displayBenefits} variant={isPet ? 'badges-horizontal' : 'list-vertical'} textColor="text-white" />
            </div>
          )}
        </div>
      </div>

      {/* 3. Rodapé (CTA) */}
      <footer className="w-full shrink-0 flex flex-col items-center z-20">
        {cta && (
          <div className="w-[90%]">
             <ArtCta ctaText={cta} variant={isPet ? 'pet' : 'primary'} fullWidth />
          </div>
        )}
      </footer>

    </div>
  );
};
