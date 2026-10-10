import React from 'react';
import { LogoVerticalBranca } from '../../../assets/coagroLogos';

export interface PromoAgroA4Props {
  title: string;
  oldPrice?: string;
  currentPrice: string;
  codigo?: string;
  headerText?: string;
}

/**
 * Layout PromoAgroA4 - Template de Promoção sem Imagem (Identidade Verde/Ouro)
 * Tipografia oficial Exo 2 Black, encorpada, com a Logo Coagro Vertical no rodapé.
 */
export const PromoAgroA4: React.FC<PromoAgroA4Props> = ({
  title,
  oldPrice,
  currentPrice,
  codigo,
  headerText = 'OFERTA',
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
    <div className="relative w-full h-full flex flex-col items-center select-none font-['Inter'] bg-[#004d40] text-white border-[0.8cqw] border-[#00382e] box-border overflow-hidden">
      
      {/* ZONA 1: CABEÇALHO FIXO NO TOPO (23cqw) */}
      <div 
        className="w-full h-[23cqw] bg-[#ffab00] text-[#004d40] flex flex-col items-center justify-center pt-[1.5cqw] pb-[4cqw] relative z-10 shrink-0"
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
            className="font-exo2 font-black uppercase tracking-tight text-white max-w-[98%] leading-[1.12] line-clamp-4 text-center" 
            style={{ fontSize: titleFontSize }}
          >
            {title}
          </h2>
        </div>
        
        {/* ZONA 3: ÁREA DO PREÇO */}
        <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0">
          {oldPrice && (
            <div className="flex items-center gap-[1.2cqw] font-exo2 font-bold uppercase relative text-emerald-100 shrink-0 mb-[0.1cqw]" style={{ fontSize: dePorFontSize }}>
              <span>DE</span>
              <span className="relative inline-block font-black">
                {oldPrice}
                {/* Linha de corte diagonal Ouro grossa */}
                <span className="absolute w-[120%] h-[0.7cqw] bg-[#ffab00] -rotate-[10deg] top-1/2 left-[-10%] z-10 transform -translate-y-1/2 shadow-sm"></span>
              </span>
            </div>
          )}

          <div className="font-exo2 font-black uppercase tracking-wider text-[#ffab00] shrink-0" style={{ fontSize: dePorFontSize }}>
            POR
          </div>

          {/* Preço de Destaque GIGANTESCO */}
          <div className="flex items-baseline justify-center font-exo2 font-black leading-none text-white shrink-0 tracking-tighter mt-[0.2cqw]" style={{ fontSize: mainFontSize }}>
            <span className="font-extrabold mr-[0.8cqw] tracking-tighter" style={{ fontSize: subFontSize }}>R$</span>
            <span>{mainPrice}</span>
            <span className="font-extrabold tracking-tighter" style={{ fontSize: subFontSize }}>{cents}</span>
          </div>
        </div>
      </div>

      {/* ZONA 4: RODAPÉ COM LOGO COAGRO VERTICAL (CASINHA EM CIMA) */}
      <div className="w-full h-[14cqw] flex items-center justify-between border-t-[0.6cqw] border-[#ffab00]/40 px-[5cqw] shrink-0 bg-[#004d40] z-10">
        <div className="flex flex-col text-left">
          <p className="font-exo2 font-black uppercase tracking-wider text-white" style={{ fontSize: '3.6cqw' }}>
            APROVEITE! ÚLTIMAS UNIDADES!
          </p>
          {codigo && (
            <div className="mt-[0.2cqw] font-mono font-bold opacity-90 text-emerald-200" style={{ fontSize: '2.5cqw' }}>
              CÓD: {codigo}
            </div>
          )}
        </div>
        <div className="h-[10.5cqw] flex items-center shrink-0">
          <LogoVerticalBranca className="h-full w-auto" />
        </div>
      </div>
    </div>
  );
};
