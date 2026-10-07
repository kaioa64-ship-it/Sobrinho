import React from 'react';
import { CommunicationMode } from '../../../lib/communicationMode';
import { CoagroPetLogo } from '../../../assets/coagroLogos';
import { renderTitleWithHighlight } from '../../../lib/renderHelper';
import { PriceCard } from '../PriceCard';
import { ArtCta } from '../ArtCta';
import { RenderizacaoVisual } from '../../../types/agro';
import { SemanticProductImage } from '../SemanticProductImage';
import { BenefitsList } from '../BenefitsList';

export interface PetCentralTemplateProps {
  title: string;
  subtitle?: string;
  processedProduct: string;
  isStory: boolean;
  mode: CommunicationMode;
  hasPrice: boolean;
  currentPrice: string;
  oldPrice?: string;
  condition?: string;
  benefits: string[];
  highlight?: string;
  renderizacao?: RenderizacaoVisual;
}

export const PetCentral: React.FC<PetCentralTemplateProps> = ({
  title,
  subtitle,
  processedProduct,
  isStory,
  mode,
  hasPrice,
  currentPrice,
  oldPrice,
  condition,
  benefits,
  highlight,
  renderizacao,
}) => {

  return (
    <div className="relative z-10 w-full h-full flex flex-col items-center bg-white font-['Inter'] select-none">
      
      {/* 1. Header (Logo + Oferta) */}
      <header className="w-full flex flex-col items-center pt-6 pb-2 shrink-0">
        <CoagroPetLogo style={{ width: '100px', height: 'auto', marginBottom: '8px' }} />
        
        <p className="mt-2 text-[#C4571F] font-bold tracking-[0.35em] uppercase text-[10px]">
          O F E R T A &nbsp; P E T
        </p>
        
        {title && (
          <h1 className="mt-1 font-exo2 font-black text-[#4897D0] text-center leading-[1.05] tracking-tight max-w-[95%] text-3xl sm:text-4xl uppercase drop-shadow-md">
            {renderTitleWithHighlight(title, highlight, 'text-[#E96C2C]')}
          </h1>
        )}
        
        {subtitle && (
          <h2 className="mt-3 font-bold text-gray-800 text-center max-w-[90%] text-lg leading-snug">
            {subtitle}
          </h2>
        )}
        
        {benefits && benefits.length > 0 && (
          <div className="mt-3 w-full max-w-[95%]">
            <BenefitsList
              benefits={benefits}
              variant="badges-horizontal"
              textColor="text-gray-700"
            />
          </div>
        )}
      </header>

      {/* 2. Centro: Imagem do Produto */}
      <div className="flex-1 w-full min-h-0 relative flex flex-col justify-center items-center px-6 mt-2 mb-2 overflow-visible">
        {processedProduct && (
          <div className="w-[85%] h-full flex flex-col items-center justify-center">
             <SemanticProductImage src={processedProduct} renderizacao={renderizacao} />
          </div>
        )}
      </div>

      {/* 3. Bloco Inferior Azul (Preço e CTA) */}
      <div className="w-full bg-[#4897D0] text-white flex flex-col items-center justify-center shrink-0 rounded-t-3xl pt-5 pb-6 px-4" style={{ minHeight: hasPrice ? (isStory ? '22%' : '25%') : '12%' }}>
        {hasPrice && currentPrice ? (
          <div className="flex flex-col items-center w-full relative h-full justify-between gap-3">
            <PriceCard
              mode={mode}
              oldPrice={oldPrice}
              currentPrice={currentPrice}
              condition={condition}
              variant="pet"
            />
            
            <div className="flex flex-col items-center mt-auto w-full max-w-[85%]">
              <ArtCta ctaText="Visite a Coagro Pet" variant="pet" fullWidth />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full gap-2">
            <h3 className="font-exo2 text-white font-bold text-xl uppercase tracking-wide">Tudo para o seu Pet</h3>
            <ArtCta ctaText="Visite a Coagro Pet" variant="pet" />
          </div>
        )}
      </div>

    </div>
  );
};
