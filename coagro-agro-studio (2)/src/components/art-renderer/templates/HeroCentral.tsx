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

export interface HeroCentralTemplateProps {
  title: string;
  highlight: string;
  titleColor?: string;
  subtitle?: string;
  subtitleColor?: string;
  processedProduct: string;
  isStory: boolean;
  logoVariant?: LogoVariant;
  mode: CommunicationMode;
  hasPrice: boolean;
  currentPrice: string;
  oldPrice?: string;
  condition?: string;
  benefits: string[];
  cta: string;
  orientation?: ProductOrientation;
  isWide?: boolean;
  isSmall?: boolean;
  imageBoxFormat?: 'rectangular' | 'square';
  renderizacao?: RenderizacaoVisual;
}

/**
 * Layout HeroCentral - Estrutura de Bounding Box Dedicada e Fluxo Flexbox Vertical
 *
 * Princípios de Design & Temas:
 * 1. Fundo transparente: herda integralmente o tema e o background layer do canvas (campo, verde, azul, clean-branco).
 * 2. Localização dos itens inquebrável (flexbox vertical):
 *    - Topo: Header (Logo Coagro + Título de Impacto + Subtítulo do Produto)
 *    - Centro: Bounding Box exclusivo para o produto com ancoragem object-bottom (Retangular 900x630 ou Quadrado 630x630)
 *    - Módulo de Preço: flutuando sobre o canto inferior da imagem (position absolute fora do fluxo DOM)
 *    - Inferior: 3 diferenciais técnicos (BenefitsList adaptativo)
 *    - Rodapé: Botão CTA (ArtCta)
 * 3. Cores dinâmicas: respeitam titleColor e subtitleColor do tema ativo.
 */
export const HeroCentral: React.FC<HeroCentralTemplateProps> = ({
  title,
  highlight,
  titleColor = 'text-white',
  subtitle,
  subtitleColor = 'text-[#E5E7EB]',
  processedProduct,
  isStory,
  logoVariant = 'h-branca',
  mode,
  hasPrice,
  currentPrice,
  oldPrice,
  condition,
  benefits = [],
  cta,
  orientation,
  isSmall,
  imageBoxFormat,
  renderizacao,
}) => {
  // Dimensões dinâmicas suportadas para a Zona de Segurança da Imagem (Bounding Box)
  // Retangular (proporção 900x630 = ~1.428) OU Quadrado (proporção 630x630 = 1:1)

  // Normalização dos 3 diferenciais técnicos
  const displayBenefits = benefits && benefits.length > 0 ? benefits.slice(0, 3) : [];

  return (
    <div className="relative z-10 w-full h-full flex flex-col justify-between items-center px-4 py-4 sm:px-6 sm:py-5 select-none font-['Inter']">
      {/* 1. Bloco Superior (Header & Títulos) */}
      {/* Ocupa apenas o topo e empurra a imagem para baixo sem sobreposição */}
      <header className="w-full flex flex-col items-center shrink-0">
        <ArtHeader logoVariant={logoVariant} isStory={isStory} align="center" />

        {title ? (
          <h1
            className={`font-exo2 font-black uppercase text-center mt-2 leading-[1.08] tracking-tight drop-shadow-md max-w-[94%] ${titleColor} ${
              isStory ? 'text-[28px] sm:text-[32px]' : 'text-[20px] sm:text-[22px]'
            }`}
          >
            {renderTitleWithHighlight(title, highlight, 'text-[#ffab00]')}
          </h1>
        ) : null}

        {subtitle ? (
          <p
            className={`mt-1.5 font-bold tracking-wide uppercase text-center leading-snug drop-shadow-sm max-w-[94%] ${subtitleColor} ${
              isStory ? 'text-[15px] sm:text-[17px]' : 'text-[13px] sm:text-[14px]'
            }`}
          >
            {subtitle}
          </p>
        ) : null}
      </header>

      {/* 2. Zona de Segurança da Imagem (O Bounding Box) */}
      {/* Dimensões adaptativas: Quadrado (630x630), Vertical (Tall) ou Retangular (Wide) */}
      {/* relative para ancoragem segura do cartão de preço flutuante */}
      <div
        className={`relative flex items-center justify-center mx-auto my-auto shrink-0 ${
          imageBoxFormat === 'square' || (!imageBoxFormat && (orientation === 'compact' || orientation === 'small' || isSmall))
            ? isStory
              ? 'w-[75%] aspect-square max-h-[40%]'
              : 'w-[68%] aspect-square max-h-[44%]'
            : orientation === 'vertical'
            ? isStory
              ? 'w-[75%] aspect-[3/4] max-h-[48%]'
              : 'w-[55%] aspect-[3/4] max-h-[46%]'
            : isStory // default to horizontal / wide
            ? 'w-[94%] aspect-[900/630] max-h-[40%]'
            : 'w-[90%] aspect-[900/630] max-h-[46%]'
        }`}
      >
        {/* Container interno de contenção estrita da imagem (nunca vaza do contêiner) */}
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          {processedProduct ? (
            <SemanticProductImage src={processedProduct} renderizacao={renderizacao} />
          ) : null}
        </div>

        {/* 3. Módulo de Preço (Sobreposição Segura) */}
        {/* Flutua exclusivamente sobre o canto inferior da imagem, FORA do fluxo normal do DOM */}
        {/* Renderizado nos modos Promoção e Preço Único; oculto no modo Informativo */}
        {hasPrice && currentPrice && (
          <div className="absolute bottom-1 -right-2 sm:bottom-2 sm:-right-2 z-50 pointer-events-none select-none">
            <PriceCard
              mode={mode}
              oldPrice={oldPrice}
              currentPrice={currentPrice}
              condition={condition}
            />
          </div>
        )}
      </div>

      {/* 4. Bloco Inferior (Diferenciais Técnicos / Bullets) */}
      <section className="w-full max-w-[94%] shrink-0 my-1.5 sm:my-2">
        <BenefitsList
          benefits={displayBenefits}
          variant="badges-horizontal"
          textColor={titleColor}
        />
      </section>

      {/* 5. Rodapé (Call to Action) */}
      <footer className="w-full max-w-[94%] shrink-0 mt-auto pt-1 pb-1 flex justify-center">
        <ArtCta ctaText={cta} fullWidth />
      </footer>
    </div>
  );
};
