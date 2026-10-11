import React from 'react';
import { LogoVerticalMonoPreta } from '../../../assets/coagroLogos';

export interface PromoMonoA4Props {
  title: string;
  oldPrice?: string;
  currentPrice: string;
  codigo?: string;
  headerText?: string;
  discountBadge?: string;
}

/**
 * Layout PromoMonoA4 - Template Monocromático (Preto e Branco)
 * Tipografia oficial Exo 2 Black, encorpada, com a Logo Coagro Vertical no rodapé.
 */
export const PromoMonoA4: React.FC<PromoMonoA4Props> = ({
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

  // 1. ZONA DO CABEÇALHO (Exo 2 Black)
  let headerFontSize = '12.5cqw';
  if (headerText.length > 14) {
    headerFontSize = '9cqw';
  } else if (headerText.length >= 10) {
    headerFontSize = '10.5cqw';
  }

  // 2. ZONA DO TÍTULO: Fonte Exo 2 Black encorpada e aumentada
  let titleFontSize = '8.5cqw';
  if (title.length > 65) {
    titleFontSize = '4.6cqw';
  } else if (title.length > 40) {
    titleFontSize = '5.6cqw';
  } else if (title.length > 20) {
    titleFontSize = '6.8cqw';
  }

  // 3. ZONA DO PREÇO: Exo 2 Black
  let mainFontSize = '33cqw';
  let subFontSize = '12.5cqw';
  const dePorFontSize = '5.2cqw';

  if (mainPrice.length >= 6) {
    mainFontSize = '23cqw';
    subFontSize = '9cqw';
  } else if (mainPrice.length === 5) {
    mainFontSize = '26cqw';
    subFontSize = '10cqw';
  } else if (mainPrice.length === 4) {
    mainFontSize = '29cqw';
    subFontSize = '11cqw';
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center select-none font-['Inter'] bg-white text-black border-[0.8cqw] border-black box-border overflow-hidden">
      
      {/* ZONA 1: CABEÇALHO FIXO NO TOPO (23cqw) */}
      <div 
        className="w-full h-[23cqw] bg-black text-white flex flex-col items-center justify-center pt-[1.5cqw] pb-[4cqw] relative z-10 shrink-0"
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
        
        {/* ZONA 2: ÁREA DO TÍTULO (Exo 2 Black mais gordinha e marcante) */}
        <div className="w-full h-[36cqw] flex items-center justify-center shrink-0">
          <h2 
            className="font-exo2 font-black uppercase tracking-tight text-black max-w-[98%] leading-[1.12] line-clamp-4 text-center" 
            style={{ fontSize: titleFontSize }}
          >
            {title}
          </h2>
        </div>
        
        {/* ZONA 3: ÁREA DO PREÇO */}
        <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0">
          {discountBadge && (
            <div 
              className="inline-flex items-center px-[3cqw] py-[0.7cqw] bg-black text-white font-exo2 font-black rounded-full uppercase tracking-wider mb-[1.2cqw] shrink-0"
              style={{ fontSize: '4.2cqw' }}
            >
              <span>{discountBadge}</span>
            </div>
          )}

          {oldPrice && (
            <div className="flex items-center gap-[1.2cqw] font-exo2 font-bold uppercase relative text-gray-600 shrink-0 mb-[0.1cqw]" style={{ fontSize: dePorFontSize }}>
              <span>DE</span>
              <span className="relative inline-block font-black">
                {oldPrice}
                {/* Linha de corte diagonal Preta grossa */}
                <span className="absolute w-[120%] h-[0.7cqw] bg-black -rotate-[10deg] top-1/2 left-[-10%] z-10 transform -translate-y-1/2"></span>
              </span>
            </div>
          )}

          <div className="font-exo2 font-black uppercase tracking-wider text-black shrink-0" style={{ fontSize: dePorFontSize }}>
            POR
          </div>

          {/* Preço de Destaque GIGANTESCO */}
          <div className="flex items-baseline justify-center font-exo2 font-black leading-none text-black shrink-0 tracking-tighter mt-[0.2cqw]" style={{ fontSize: mainFontSize }}>
            <span className="font-extrabold mr-[0.8cqw] tracking-tighter" style={{ fontSize: subFontSize }}>R$</span>
            <span>{mainPrice}</span>
            <span className="font-extrabold tracking-tighter" style={{ fontSize: subFontSize }}>{cents}</span>
          </div>
        </div>
      </div>

      {/* ZONA 4: RODAPÉ COM LOGO COAGRO VERTICAL (CASINHA EM CIMA) */}
      <div className="w-full h-[14cqw] flex items-center justify-between border-t-[0.6cqw] border-black px-[5cqw] shrink-0 bg-white z-10">
        <div className="flex flex-col text-left">
          <p className="font-exo2 font-black uppercase tracking-wider text-black" style={{ fontSize: '3.6cqw' }}>
            APROVEITE! ÚLTIMAS UNIDADES!
          </p>
          {codigo && (
            <div className="mt-[0.2cqw] font-mono font-bold text-black" style={{ fontSize: '2.5cqw' }}>
              CÓD: {codigo}
            </div>
          )}
        </div>
        <div className="h-[10.5cqw] flex items-center shrink-0">
          <LogoVerticalMonoPreta className="h-full w-auto" />
        </div>
      </div>
    </div>
  );
};
