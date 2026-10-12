import React from 'react';
import { CoagroPetLogo } from '../../../assets/coagroLogos';

export interface PromoPetOrangeA4Props {
  title: string;
  oldPrice?: string;
  currentPrice: string;
  codigo?: string;
  headerText?: string;
  discountBadge?: string;
}

/**
 * Layout PromoPetOrangeA4 - Template de Promoção Laranja Oficial Coagro Pet
 * Paleta oficial Pet: Fundo Laranja (#E96C2C), Cabeçalho Azul (#001C71), Logo Coagro Pet.
 */
export const PromoPetOrangeA4: React.FC<PromoPetOrangeA4Props> = ({
  title,
  oldPrice,
  currentPrice,
  codigo,
  headerText = 'OFERTA',
  discountBadge,
}) => {
  const priceParts = currentPrice.replace('R$', '').trim().split(',');
  const mainPrice = priceParts[0] || '0';
  const cents = priceParts[1] ? `,${priceParts[1]}` : ',00';

  // 1. ZONA DO CABEÇALHO
  let headerFontSize = '12cqw';
  if (headerText.length > 14) {
    headerFontSize = '8.5cqw';
  } else if (headerText.length >= 10) {
    headerFontSize = '10cqw';
  }

  // 2. ZONA DO TÍTULO
  let titleFontSize = '7.8cqw';
  if (title.length > 65) {
    titleFontSize = '4.4cqw';
  } else if (title.length > 40) {
    titleFontSize = '5.2cqw';
  } else if (title.length > 20) {
    titleFontSize = '6.4cqw';
  }

  // 3. ZONA DO PREÇO
  let mainFontSize = '32cqw';
  let subFontSize = '12cqw';
  const dePorFontSize = '5.0cqw';

  if (mainPrice.length >= 6) {
    mainFontSize = '22cqw';
    subFontSize = '8.5cqw';
  } else if (mainPrice.length === 5) {
    mainFontSize = '25cqw';
    subFontSize = '9.5cqw';
  } else if (mainPrice.length === 4) {
    mainFontSize = '28cqw';
    subFontSize = '10.5cqw';
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center select-none font-['Inter'] bg-[#E96C2C] text-white border-[0.7cqw] border-[#c8561d] box-border overflow-hidden">
      
      {/* ZONA 1: CABEÇALHO FIXO NO TOPO */}
      <div
        className="w-full h-[23cqw] bg-[#001C71] text-white flex flex-col items-center justify-center pt-[1.5cqw] pb-[4cqw] relative z-10 shrink-0"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)',
        }}
      >
        <h1 className="font-exo2 font-black uppercase leading-none text-center whitespace-nowrap" style={{ fontSize: headerFontSize, letterSpacing: '-0.02em' }}>
          {headerText}
        </h1>
      </div>

      {/* MIOLO ÚTIL: PREENCHIMENTO COMPACTO E HARMONIOSO */}
      <div className="flex flex-col items-center justify-between w-full flex-1 min-h-0 px-[4.5cqw] py-[0.8cqw] text-center overflow-hidden">
        
        {/* ZONA 2: ÁREA DO TÍTULO */}
        <div className="w-full h-[36cqw] flex items-center justify-center shrink-0">
          <h2
            className="font-exo2 font-black uppercase tracking-tight text-white max-w-[98%] leading-[1.14] line-clamp-4 text-center"
            style={{ fontSize: titleFontSize }}
          >
            {title}
          </h2>
        </div>

        {/* ZONA 3: ÁREA DO PREÇO */}
        <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0">
          {discountBadge && (
            <div 
              className="inline-flex items-center px-[3cqw] py-[0.7cqw] bg-[#ffab00] text-[#001C71] font-exo2 font-black rounded-full uppercase tracking-wider mb-[1.2cqw] shrink-0 shadow-sm"
              style={{ fontSize: '4.2cqw' }}
            >
              <span>{discountBadge}</span>
            </div>
          )}

          {oldPrice && (
            <div className="flex items-center gap-[1.2cqw] font-exo2 font-bold uppercase relative text-orange-100 shrink-0 mb-[0.1cqw]" style={{ fontSize: dePorFontSize }}>
              <span>DE</span>
              <span className="relative inline-block font-black">
                {oldPrice}
                {/* Linha de corte diagonal amarela grossa */}
                <span className="absolute w-[120%] h-[0.7cqw] bg-[#ffab00] -rotate-[10deg] top-1/2 left-[-10%] z-10 transform -translate-y-1/2 shadow-sm"></span>
              </span>
            </div>
          )}

          <div className="flex items-baseline justify-center tracking-tighter leading-none shrink-0" style={{ transform: 'scaleY(1.05)' }}>
            <span className="font-exo2 font-black text-[#ffab00] mr-[1cqw]" style={{ fontSize: subFontSize }}>
              R$
            </span>
            <span className="font-exo2 font-black text-white" style={{ fontSize: mainFontSize }}>
              {mainPrice}
            </span>
            <span className="font-exo2 font-black text-white ml-[0.5cqw]" style={{ fontSize: subFontSize }}>
              {cents}
            </span>
          </div>
        </div>

        {/* ZONA 4: RODAPÉ CORPORATIVO COAGRO PET */}
        <div className="w-full h-[15cqw] flex items-center justify-between border-t border-white/20 pt-[0.8cqw] pb-[0.5cqw] px-[1cqw] shrink-0">
          <div className="text-left flex flex-col justify-center">
            <span className="font-exo2 font-black uppercase text-white tracking-wide leading-tight" style={{ fontSize: '3.2cqw' }}>
              Aproveite!
            </span>
            <div className="flex items-center gap-[1cqw] text-orange-100 font-bold uppercase" style={{ fontSize: '2.8cqw' }}>
              <span>Últimas unidades!</span>
              {codigo && (
                <>
                  <span>•</span>
                  <span className="font-mono">CÓD: {codigo}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end">
            <CoagroPetLogo className="h-[9cqw] w-auto bg-white/95 rounded-lg px-2 py-0.5 shadow-xs" />
          </div>
        </div>

      </div>
    </div>
  );
};
