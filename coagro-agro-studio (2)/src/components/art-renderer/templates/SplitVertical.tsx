import React from 'react';
import { LogoVariant } from '../../../assets/coagroLogos';
import { CommunicationMode } from '../../../lib/communicationMode';
import { renderTitleWithHighlight } from '../../../lib/renderHelper';
import { PriceCard } from '../PriceCard';
import { ArtHeader } from '../ArtHeader';
import { BenefitsList } from '../BenefitsList';
import { ArtCta } from '../ArtCta';
import { RenderizacaoVisual } from '../../../types/agro';
import { SemanticProductImage } from '../SemanticProductImage';

interface SplitVerticalTemplateProps {
  codigo?: string;
  scope?: 'AGRO' | 'PET';
  title: string;
  highlight: string;
  highlightColor: string;
  titleColor: string;
  subtitle?: string;
  subtitleColor: string;
  processedProduct: string;
  isStory: boolean;
  logoVariant: LogoVariant;
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

export const SplitVertical: React.FC<SplitVerticalTemplateProps> = ({
  codigo,
  scope,
  title,
  highlight,
  highlightColor,
  titleColor,
  subtitle,
  subtitleColor,
  processedProduct,
  isStory,
  logoVariant,
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
  // Ajuste de imagem para evitar que corte nas laterais do Story (reduzido de 140% para 125%)
  const productWidth = isStory ? '125%' : (isWide ? '100%' : '135%');
  const productMarginLeft = isStory ? '-5%' : '-12%';

  return (
    <div className="relative z-10 w-full h-full flex flex-col justify-between items-center select-none font-['Inter']">
      
      {/* 1. Topo: Logo Coagro e Títulos (se Story) */}
      <div className={`w-full shrink-0 flex flex-col ${isStory ? 'pt-10 px-6 gap-4' : 'pt-6 px-6'}`}>
        <div className={isStory ? 'flex justify-center' : ''}>
          <ArtHeader logoVariant={logoVariant} isStory={isStory} align={isStory ? 'center' : 'left'} scope={scope} />
        </div>
        
        {/* No formato Story, Título e Subtítulo ficam centralizados logo abaixo da logo */}
        {isStory && title ? (
          <div className="relative z-30 flex flex-col items-center text-center mt-2 px-2">
            <h2 className={`font-exo2 font-black uppercase leading-[1.05] tracking-tight drop-shadow-md text-[28px] sm:text-[32px] max-w-[95%]`}>
              {renderTitleWithHighlight(title, highlight, titleColor)}
            </h2>
            {subtitle && (
              <p className={`mt-2 font-bold tracking-wide uppercase leading-snug drop-shadow-sm ${subtitleColor} text-[15px] sm:text-[17px] max-w-[95%]`}>
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
              <h2 className={`font-exo2 font-black uppercase leading-[1.05] tracking-tight drop-shadow-md text-[20px] sm:text-[22px]`}>
                {renderTitleWithHighlight(title, highlight, highlightColor)}
              </h2>
              {subtitle && (
                <p className={`mt-1.5 font-bold tracking-wide uppercase leading-snug drop-shadow-sm ${subtitleColor} text-[13px] sm:text-[14px]`}>
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
              textColor={titleColor} 
              className={isStory ? 'text-[15px]' : ''}
            />
          </div>

          {/* Módulo de Preço */}
          {hasPrice && currentPrice && (
            <div className="relative z-30 flex mt-2">
              <PriceCard
                mode={mode}
                oldPrice={oldPrice}
                currentPrice={currentPrice}
                condition={condition}
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. Rodapé: Botão CTA */}
      <div className={`w-full shrink-0 flex justify-center ${isStory ? 'pb-12 px-10' : 'pb-6 px-6'}`}>
        <ArtCta ctaText={cta} fullWidth={!isStory} variant={isStory ? 'white' : 'primary'} />
      </div>
    </div>
  );
};
