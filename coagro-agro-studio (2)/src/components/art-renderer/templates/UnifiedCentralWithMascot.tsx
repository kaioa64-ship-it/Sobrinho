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

export interface UnifiedCentralWithMascotProps {
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
}

/**
 * UnifiedCentralWithMascot - O Modelo Central Unificado
 * Blindado 100% para Story 9:16 (conforme restrição)
 * Adapta tipografia, cores e mascotes com base no `scope`.
 */
export const UnifiedCentralWithMascot: React.FC<UnifiedCentralWithMascotProps> = ({
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

  // Cores dinâmicas
  const titleColor = isPet ? 'text-[#4897D0]' : 'text-white';
  const highlightColor = isPet ? 'text-[#E96C2C]' : 'text-[#ffab00]';
  const subtitleColor = isPet ? 'text-gray-700' : 'text-[#E5E7EB]';
  
  // Fonte: Agro usa Exo 2 Black, Pet usa Exo 2 Black / Arredondada
  const titleFont = isPet ? 'font-exo2 font-black tracking-tight' : 'font-exo2 font-black uppercase tracking-tight';
  
  const displayBenefits = benefits && benefits.length > 0 ? benefits.slice(0, 3) : [];

  // Lógica de Mascotes
  const mascotSrc = isPet 
    ? '/mascotes/GATA/GATA LARANJA.webp' // ou CHARLES P1.webp
    : '/mascotes/ricardo.webp';

  return (
    <div className={`relative z-10 w-full h-full flex flex-col justify-between items-center px-5 ${isStory ? 'py-8' : 'py-3'} select-none font-['Inter']`}>
      
      {/* Mascote Posicionado de Forma Absoluta */}
      {mascotSrc && (
        <img 
          src={mascotSrc} 
          alt="Mascote" 
          className={`absolute z-25 object-contain drop-shadow-2xl ${isPet ? 'w-[140px] -bottom-2 -left-6' : 'w-[180px] -bottom-4 -left-8'}`}
        />
      )}
      
      {/* 1. Header (Topo - 20%) */}
      <header className="w-full flex flex-col items-center shrink-0 z-20">
        <ArtHeader logoVariant={logoVariant || (isPet ? 'h-azul' : 'h-branca')} isStory={isStory} align="center" scope={scope} />

        {title && (
          <h1 className={`mt-3 text-center leading-[1.05] drop-shadow-md max-w-[95%] text-[28px] sm:text-[32px] line-clamp-3 ${titleFont} ${titleColor}`}>
            {renderTitleWithHighlight(title, highlight, highlightColor)}
          </h1>
        )}

        {subtitle && (
          <p className={`mt-2 font-bold text-center leading-snug drop-shadow-sm max-w-[90%] text-[15px] sm:text-[17px] uppercase line-clamp-2 ${subtitleColor}`}>
            {subtitle}
          </p>
        )}
      </header>

      {/* 2. Centro (Produto e Preço - 60%) */}
      <div className="flex-1 min-h-0 w-full relative flex flex-col items-center justify-center my-2">
        {processedProduct && (
          <div className="w-[95%] h-full flex flex-col items-center justify-center relative">
            <SemanticProductImage src={processedProduct} renderizacao={renderizacao} />
          </div>
        )}
        
        {/* Modulo de Preço Flutuante - Posicionado na parte inferior direita da zona do produto */}
        {hasPrice && currentPrice && (
          <div className="absolute -bottom-2 right-2 z-30 scale-100 sm:scale-110 origin-bottom-right drop-shadow-xl max-w-[65%]">
             <PriceCard
              mode={mode}
              oldPrice={oldPrice}
              currentPrice={currentPrice}
              condition={condition}
              variant={isPet ? 'pet' : 'agro'}
            />
          </div>
        )}
      </div>

      {/* 3. Rodapé (Benefícios, CTA e Mascote - 20%) */}
      <footer className="w-full shrink-0 flex flex-col items-center z-20 gap-3">
        {displayBenefits.length > 0 && (
          <div className="w-[95%] z-20">
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
