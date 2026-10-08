import React from 'react';
import { CommunicationMode } from '../../../lib/communicationMode';
import { renderTitleWithHighlight } from '../../../lib/renderHelper';
import { CoagroPetLogo } from '../../../assets/coagroLogos';
import { PriceCard } from '../PriceCard';
import { BenefitsList } from '../BenefitsList';
import { ArtCta } from '../ArtCta';
import { RenderizacaoVisual } from '../../../types/agro';
import { SemanticProductImage } from '../SemanticProductImage';

interface PetSplitVerticalTemplateProps {
  codigo?: string;
  title: string;
  highlight: string;
  subtitle?: string;
  processedProduct: string;
  isStory: boolean;
  mode: CommunicationMode;
  hasPrice: boolean;
  currentPrice: string;
  oldPrice?: string;
  condition?: string;
  benefits: string[];
  cta: string;
  isWide?: boolean;
  renderizacao?: RenderizacaoVisual;
}

export const PetSplitVertical: React.FC<PetSplitVerticalTemplateProps> = ({
  codigo,
  title,
  highlight,
  subtitle,
  processedProduct,
  isStory,
  mode,
  hasPrice,
  currentPrice,
  oldPrice,
  condition,
  benefits,
  cta,
  isWide,
  renderizacao,
}) => {
  // Ajuste de imagem para evitar que corte nas laterais do Story
  const productWidth = isStory ? '125%' : (isWide ? '100%' : '135%');
  const productMarginLeft = isStory ? '-5%' : '-12%';



  return (
    <div className="relative z-10 w-full h-full flex flex-col justify-between items-center bg-white select-none font-['Inter']">
      
      {/* 1. Topo: Logo Pet e Títulos (se Story) */}
      <div className={`w-full shrink-0 flex flex-col items-center ${isStory ? 'pt-6 px-4 gap-1.5' : 'pt-6 px-6'}`}>
        <div className="flex justify-center w-full">
          <CoagroPetLogo style={{ width: isStory ? '100px' : '90px', height: 'auto' }} />
        </div>
        
        {/* No formato Story, Título e Subtítulo ficam centralizados logo abaixo da logo */}
        {isStory && title ? (
          <div className="relative z-30 flex flex-col items-center text-center mt-2 px-2">
            <h2 className={`font-exo2 font-black uppercase leading-[1.05] tracking-tight drop-shadow-md text-3xl sm:text-4xl max-w-[95%] text-[#4897D0]`}>
              {renderTitleWithHighlight(title, highlight, 'text-[#E96C2C]')}
            </h2>
            {subtitle && (
              <p className={`mt-2 font-bold tracking-wide uppercase leading-snug drop-shadow-sm text-gray-700 text-base sm:text-lg max-w-[95%]`}>
                {subtitle}
              </p>
            )}
          </div>
        ) : null}
      </div>

      {/* 2. Meio: Layout Split (Grid 2 colunas) */}
      <div className={`flex-1 w-full min-h-0 grid ${isStory ? 'grid-cols-[45%_55%] mt-2' : 'grid-cols-[48%_52%]'} px-4 sm:px-6`}>
        
        {/* Lado Esquerdo: Produto */}
        <div className="relative z-10 flex items-center justify-center overflow-visible h-full min-h-0">
          {processedProduct ? (
             <div style={{
                width: productWidth,
                marginLeft: productMarginLeft,
                transform: 'translateY(-3%)'
             }} className="h-full flex items-center justify-center pointer-events-none">
                 <SemanticProductImage src={processedProduct} renderizacao={renderizacao} codigo={codigo} />
             </div>
          ) : null}
        </div>

        {/* Lado Direito: Informações, Benefícios e Preço */}
        <div className={`relative z-20 flex flex-col justify-center ${isStory ? 'pl-4 pr-2 gap-4' : 'pl-2 pr-4 gap-4'} h-full min-h-0 overflow-visible`}>
          
          {/* Título e Subtítulo (No Feed, ficam aqui na direita) */}
          {!isStory && title ? (
            <div className="relative z-30">
              <h2 className={`font-exo2 font-black uppercase leading-[1.05] tracking-tight drop-shadow-md text-xl sm:text-2xl text-[#4897D0]`}>
                {renderTitleWithHighlight(title, highlight, 'text-[#E96C2C]')}
              </h2>
              {subtitle && (
                <p className={`mt-1.5 font-bold tracking-wide uppercase leading-snug drop-shadow-sm text-gray-700 text-sm`}>
                  {subtitle}
                </p>
              )}
            </div>
          ) : null}

          {/* Diferenciais Técnicos */}
          <div className="relative z-30">
            <BenefitsList 
              benefits={benefits} 
              variant="list-vertical" 
              textColor="text-gray-800" 
              className={isStory ? 'text-sm' : ''}
            />
          </div>

        </div>
      </div>

      {/* 3. Bloco Inferior Azul (Preço e CTA) - Baseado no PetCentral */}
      <div className="w-full bg-[#4897D0] text-white flex flex-col items-center justify-center shrink-0 rounded-t-3xl pt-5 pb-6 px-4" style={{ minHeight: hasPrice ? (isStory ? '22%' : '25%') : '12%' }}>
        {hasPrice && currentPrice ? (
          <div className="flex flex-col items-center w-full relative h-full justify-center gap-3">
            <PriceCard
              mode={mode}
              oldPrice={oldPrice}
              currentPrice={currentPrice}
              condition={condition}
              variant="pet"
            />
            
            <div className="flex flex-col items-center mt-auto w-full max-w-[85%]">
              <ArtCta ctaText={cta || 'Visite a Coagro Pet'} variant="pet" fullWidth />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full gap-2">
            <h3 className="font-exo2 text-white font-bold text-xl uppercase tracking-wide">Tudo para o seu Pet</h3>
            <ArtCta ctaText={cta || 'Visite a Coagro Pet'} variant="pet" />
          </div>
        )}
      </div>
    </div>
  );
};
