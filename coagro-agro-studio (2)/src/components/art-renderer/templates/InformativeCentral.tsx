import React from 'react';
import { LogoVariant } from '../../../assets/coagroLogos';
import { renderTitleWithHighlight } from '../../../lib/renderHelper';
import { ArtHeader } from '../ArtHeader';
import { BenefitsList } from '../BenefitsList';
import { ArtCta } from '../ArtCta';
import { RenderizacaoVisual } from '../../../types/agro';
import { SemanticProductImage } from '../SemanticProductImage';
import { getDynamicTitleSize } from '../../../lib/typography';

export interface InformativeCentralProps {
  scope: 'AGRO' | 'PET';
  title: string;
  highlight: string;
  subtitle?: string;
  processedProduct: string;
  isStory: boolean; // Locked to true
  logoVariant?: LogoVariant;
  benefits: string[];
  cta: string;
  renderizacao?: RenderizacaoVisual;
  textBackground?: boolean;
  codigo?: string;
  isLight?: boolean;
}

/**
 * InformativeCentral - Modelo Institucional/Informativo Central
 * Blindado 100% para Story 9:16. Foco no Título, Subtítulo (Parágrafo) e Imagem de apoio.
 * Sem módulo de preço.
 */
export const InformativeCentral: React.FC<InformativeCentralProps> = ({
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
  const subtitleColor = isLight ? 'text-gray-700' : isPet ? 'text-gray-100' : 'text-[#E5E7EB]'; // Mais legível para parágrafos longos
  
  const titleFont = isPet ? 'font-exo2 font-black tracking-tight' : 'font-exo2 font-black uppercase tracking-tight';
  
  const displayBenefits = benefits && benefits.length > 0 ? benefits.slice(0, 3) : [];

  return (
    <div className={`relative z-10 w-full h-full flex flex-col justify-between items-center px-6 ${isStory ? 'py-10' : 'py-4'} select-none font-['Inter']`}>
      
      {/* 1. Header (Topo - 10%) */}
      <header className="w-full flex flex-col items-center shrink-0 z-20">
        <ArtHeader logoVariant={logoVariant || (isPet ? 'h-azul' : 'h-branca')} isStory={isStory} align="center" scope={scope} />
      </header>

      {/* 2. Centro (Textos Principais - 40%) */}
      <div className={`flex flex-col items-center justify-center w-[95%] mt-4 mb-2 z-30`}>
        {title && (
          <h1 className={`text-center ${getDynamicTitleSize(title)} leading-tight line-clamp-2 drop-shadow-lg w-full ${titleFont} ${titleColor}`}>
            {renderTitleWithHighlight(title, highlight, highlightColor)}
          </h1>
        )}

        {subtitle && (
          <p className={`mt-1.5 font-medium text-center leading-relaxed drop-shadow-md w-full text-[16px] sm:text-[18px] ${subtitleColor}`}>
            {subtitle}
          </p>
        )}
      </div>

      {/* 3. Imagem de Apoio (Flex Auto-adaptável com Delimitadores) */}
      <div className="flex-1 min-h-0 w-full relative flex flex-col items-center justify-center z-10 pt-2 pb-4">
        {processedProduct && (
          <div className="w-full h-full flex flex-col items-center justify-center relative drop-shadow-2xl scale-110 origin-bottom">
            <SemanticProductImage src={processedProduct} renderizacao={renderizacao} codigo={codigo} />
          </div>
        )}
      </div>

      {/* 4. Rodapé (Benefícios e CTA - Max Height) */}
      <footer className="w-full shrink-0 flex flex-col items-center z-20 gap-3 mt-1">
        {displayBenefits.length > 0 && (
          <div className={`w-[100%] max-h-[140px] overflow-hidden z-20`}>
            <BenefitsList benefits={displayBenefits} variant={isPet ? 'badges-horizontal' : 'list-vertical'} textColor="text-white" />
          </div>
        )}
        
        {cta && (
          <div className="w-[90%]">
             <ArtCta ctaText={cta} variant={isPet ? 'pet' : 'primary'} fullWidth />
          </div>
        )}
      </footer>

    </div>
  );
};
