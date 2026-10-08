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

export interface UnifiedCentralProps {
  codigo?: string;
  scope: 'AGRO' | 'PET';
  title: string;
  highlight: string;
  subtitle?: string;
  processedProduct: string;
  isStory: boolean; // Currently locked to true by constraints
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
 * UnifiedCentral - O Modelo Central Unificado
 * Blindado 100% para Story 9:16 (conforme restrição)
 * Adapta tipografia, cores e mascotes com base no `scope`.
 */
export const UnifiedCentral: React.FC<UnifiedCentralProps> = ({
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

  // Cores dinâmicas com suporte a fundo claro/invertido
  const titleColor = isLight ? 'text-[#004d40]' : isPet ? 'text-[#4897D0]' : 'text-white';
  const highlightColor = isPet ? 'text-[#E96C2C]' : 'text-[#ffab00]';
  const subtitleColor = isLight ? 'text-gray-700' : isPet ? 'text-gray-200' : 'text-[#E5E7EB]';
  
  // Fonte: Agro usa Exo 2 Black, Pet usa Exo 2 Black / Arredondada
  const titleFont = isPet ? 'font-exo2 font-black tracking-tight' : 'font-exo2 font-black uppercase tracking-tight';
  
  const displayBenefits = benefits && benefits.length > 0 ? benefits.slice(0, 3) : [];

  return (
    <div className={`relative z-10 w-full h-full flex flex-col justify-between items-center px-5 ${isStory ? 'py-8' : 'py-3'} select-none font-['Inter']`}>
      

      {/* 1. Header (Topo - 20%) */}
      <header className="w-full flex flex-col items-center shrink-0 z-20">
        <ArtHeader logoVariant={logoVariant || (isPet ? 'h-azul' : 'h-branca')} isStory={isStory} align="center" />

        {title && (
          <h1 className={`mt-3 text-center ${getDynamicTitleSize(title)} leading-tight line-clamp-2 drop-shadow-md max-w-[95%] ${titleFont} ${titleColor}`}>
            {renderTitleWithHighlight(title, highlight, highlightColor)}
          </h1>
        )}

        {subtitle && (
          <p className={`mt-2 font-bold text-center leading-snug drop-shadow-sm max-w-[90%] text-[17px] uppercase ${subtitleColor}`}>
            {subtitle}
          </p>
        )}
      </header>

      {/* 2. Centro (Produto e Preço - 60%) */}
      <div className="flex-1 min-h-0 w-full relative flex flex-col items-center justify-center my-2">
        {processedProduct && (
          <div className="w-[95%] h-full flex flex-col items-center justify-center relative">
            <SemanticProductImage src={processedProduct} renderizacao={renderizacao} codigo={codigo} />
          </div>
        )}
        
        {/* Modulo de Preço Flutuante - Posicionado na parte inferior direita da zona do produto */}
        {hasPrice && currentPrice && (
          <div className="absolute -bottom-2 -right-2 z-30 scale-110 origin-bottom-right drop-shadow-xl">
             <PriceCard
              mode={mode}
              oldPrice={oldPrice}
              currentPrice={currentPrice}
              condition={condition}
              variant={isPet ? 'pet' : 'primary'}
            />
          </div>
        )}
      </div>

      {/* 3. Rodapé (Benefícios, CTA e Mascote - 20%) */}
      <footer className="w-full shrink-0 flex flex-col items-center z-20 gap-3">
        {displayBenefits.length > 0 && (
          <div className={`w-[95%] z-20 ${textBackground ? 'bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/40' : ''}`}>
            <BenefitsList benefits={displayBenefits} variant={isPet ? 'badges-horizontal' : 'list-vertical'} textColor="text-gray-800" />
          </div>
        )}
        
        {cta && (
          <div className="w-[85%] mt-1">
             <ArtCta ctaText={cta} variant={isPet ? 'pet' : 'primary'} fullWidth />
          </div>
        )}
      </footer>

    </div>
  );
};
