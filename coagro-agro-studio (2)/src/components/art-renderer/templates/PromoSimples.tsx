import React from 'react';
import { LogoVariant } from '../../../assets/coagroLogos';
import { renderTitleWithHighlight } from '../../../lib/renderHelper';
import { CommunicationMode } from '../../../lib/communicationMode';
import { ArtHeader } from '../ArtHeader';
import { SemanticProductImage } from '../SemanticProductImage';
import { getDynamicTitleSize } from '../../../lib/typography';
import { RenderizacaoVisual } from '../../../types/agro';

export interface PromoSimplesProps {
  scope: 'AGRO' | 'PET';
  title: string;
  highlight: string;
  subtitle?: string;
  processedProduct: string;
  isStory: boolean;
  logoVariant?: LogoVariant;
  mode: CommunicationMode;
  hasPrice: boolean;
  currentPrice: string;
  oldPrice?: string;
  condition?: string;
  renderizacao?: RenderizacaoVisual;
  codigo?: string;
  backgroundColorHex?: string;
  isLight?: boolean;
}

/**
 * PromoSimples - Modelo Promocional Simples (Foco em Varejo Rápido)
 * Fundo branco, sem firulas. Produto no topo, Título/Preço/Logo embaixo.
 * Imagens sem recorte de fundo ficam ótimas aqui devido ao fundo branco.
 */
export const PromoSimples: React.FC<PromoSimplesProps> = ({
  scope,
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
  renderizacao,
  logoVariant,
  codigo,
  backgroundColorHex,
  isLight,
}) => {
  const isPet = scope === 'PET';

  // Fallback map for selected colors
  const bgMap: Record<string, string> = {
    'branco': 'bg-white',
    'verde': 'bg-[#004d40]',
    'azul': 'bg-[#001C71]',
    'laranja': 'bg-[#E96C2C]'
  };

  const bgClass = backgroundColorHex && bgMap[backgroundColorHex] ? bgMap[backgroundColorHex] : 'bg-transparent';
  const isDark = backgroundColorHex && ['verde', 'azul', 'laranja'].includes(backgroundColorHex) ? true : !isLight;

  const titleColor = isDark ? 'text-white' : 'text-gray-900';
  const highlightColor = isDark ? 'text-white' : (isPet ? 'text-[#E96C2C]' : 'text-[#004d40]');
  const subtitleColor = isDark ? 'text-white/80' : 'text-gray-500';
  const titleFont = 'font-exo2 font-black uppercase tracking-tight';
  
  // Preço quebrado em reais e centavos para tipografia editorial monumental
  const priceParts = currentPrice.replace('R$', '').trim().split(',');
  const mainPrice = priceParts[0] || '0';
  const cents = priceParts[1] ? `,${priceParts[1]}` : ',00';

  // Variante da logo para contraste no ArtHeader
  const finalLogoVariant: LogoVariant = isDark ? 'h-branca' : 'h-azul';

  return (
    <div className={`absolute inset-0 z-10 w-full h-full flex flex-col justify-between items-center px-4 ${isStory ? 'py-10' : 'py-6'} select-none font-['Inter'] ${bgClass}`}>
      
      {/* Header (Topo) */}
      <header className="w-full flex flex-col items-center shrink-0 z-20 mb-2">
        <ArtHeader logoVariant={finalLogoVariant} isStory={isStory} align="center" scope={scope} />
      </header>

      {/* Imagem do Produto (Ocupa a parte central) */}
      <div className="flex-1 w-full relative flex flex-col items-center justify-center min-h-0">
        {processedProduct && (
          <div className="w-[90%] h-full flex flex-col items-center justify-center relative">
            <img 
              src={processedProduct} 
              alt="Produto" 
              className={`max-w-full max-h-full object-contain drop-shadow-sm rounded-2xl ${isDark ? '' : 'mix-blend-multiply'}`} 
            />
            {codigo && (
              <span className={`absolute bottom-[-15px] text-[9px] font-mono font-bold z-20 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                Cód: {codigo}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bloco Inferior: Título, Subtítulo e Preço Monumental */}
      <div className="w-full flex flex-col items-center justify-end shrink-0 z-20 mt-4 gap-2.5">
        
        {/* Título e Subtítulo */}
        <div className="w-full flex flex-col items-center text-center">
          {title && (
            <h1 className={`${getDynamicTitleSize(title)} leading-tight line-clamp-2 ${titleFont} ${titleColor}`}>
              {renderTitleWithHighlight(title, highlight, highlightColor)}
            </h1>
          )}
          {subtitle && (
            <p className={`mt-1 font-bold leading-snug text-[15px] sm:text-[17px] uppercase ${subtitleColor}`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Preço Monumental (Estilo Oficial WhatsApp Status adaptado para Varejo Rápido) */}
        {hasPrice && currentPrice && (
          <section className={`w-full max-w-[340px] flex flex-col items-center justify-center py-2 px-4 rounded-2xl border transition-all ${
            isDark 
              ? 'bg-black/35 backdrop-blur-md border-white/15' 
              : 'bg-amber-50/70 border-amber-200/80 shadow-xs'
          }`}>
            {oldPrice && (
              <div className={`flex items-center gap-1.5 text-xs font-semibold uppercase ${
                isDark ? 'text-white/70' : 'text-gray-500'
              }`}>
                <span>DE:</span>
                <span className="line-through decoration-[#ffab00] decoration-2">
                  R$ {oldPrice.replace('R$', '').trim()}
                </span>
              </div>
            )}

            <div className="flex items-baseline justify-center font-exo2 font-black leading-none tracking-tight my-0.5">
              <span className={`text-base mr-1.5 font-extrabold ${
                isDark ? 'text-white' : 'text-gray-700'
              }`}>
                POR
              </span>
              <span className={`text-base mr-0.5 font-extrabold ${
                isDark 
                  ? 'text-[#ffab00]' 
                  : (isPet ? 'text-[#004b87]' : 'text-[#004d40]')
              }`}>
                R$
              </span>
              <span className={`text-4xl sm:text-5xl drop-shadow-xs ${
                isDark 
                  ? 'text-[#ffab00]' 
                  : (isPet ? 'text-[#004b87]' : 'text-[#004d40]')
              }`}>
                {mainPrice}
              </span>
              <span className={`text-xl sm:text-2xl font-extrabold ${
                isDark 
                  ? 'text-[#ffab00]' 
                  : (isPet ? 'text-[#004b87]' : 'text-[#004d40]')
              }`}>
                {cents}
              </span>
            </div>

            {condition && (
              <p className={`text-[11px] font-bold uppercase tracking-wide ${
                isDark ? 'text-white/90' : 'text-gray-700'
              }`}>
                {condition}
              </p>
            )}
          </section>
        )}

      </div>
    </div>
  );
};
