import React from 'react';
import { CoagroPetLogo } from '../../../assets/coagroLogos';

export interface PromoPetA4Props {
  title: string;
  oldPrice?: string;
  currentPrice: string;
  codigo?: string;
  headerText?: string;
}

/**
 * Layout PromoPetA4 - Template de Promoção sem Imagem (Identidade Azul/Dourado Pet)
 * Criado especificamente para rodar em lote a partir de planilhas.
 *
 * Irmão dedicado do `PromoAgroA4`, e não uma variação condicional dele: os
 * layouts A4 são artes fechadas, full-bleed, e injetar `scope` dentro do
 * componente Agro só criaria ramificação em código já calibrado.
 *
 * PALETA OFICIAL COAGRO PET (ver AUDITORIA_INSTRUCOES_IA.md):
 *   - Azul institucional .... #004b87  (fundo / rodapé)
 *   - Azul claro ............ #4897D0  (apoio)
 *   - Amarelo/Dourado ....... #ffab00  (cabeçalho / preço)
 *   - Branco ................ #ffffff
 * É PROIBIDO usar o verde Agro (#004d40 / #006b59) neste template.
 *
 * TIPOGRAFIA (conforme diretriz da Fase 2):
 *   - Exo 2  → chamadas de impacto, título e números de preço
 *   - Inter  → especificações, código e detalhes do rodapé
 */
export const PromoPetA4: React.FC<PromoPetA4Props> = ({
  title,
  oldPrice,
  currentPrice,
  codigo,
  headerText = 'OFERTA',
}) => {
  const priceParts = currentPrice.replace('R$', '').trim().split(',');
  const mainPrice = priceParts[0] || '0';
  const cents = priceParts[1] ? `,${priceParts[1]}` : ',00';

  // 1. ZONA DO CABEÇALHO (Mais encorpado, descendo um pouco mais no cartaz)
  let headerFontSize = '12cqw';
  if (headerText.length > 14) {
    headerFontSize = '8.5cqw';
  } else if (headerText.length >= 10) {
    headerFontSize = '10cqw';
  }

  // 2. ZONA DO TÍTULO: se adapta EXCLUSIVAMENTE ao comprimento do próprio título (100% isolado)
  let titleFontSize = '7.8cqw';
  if (title.length > 65) {
    titleFontSize = '4.4cqw';
  } else if (title.length > 40) {
    titleFontSize = '5.2cqw';
  } else if (title.length > 20) {
    titleFontSize = '6.4cqw';
  }

  // 3. ZONA DO PREÇO: se adapta EXCLUSIVAMENTE aos dígitos do preço (NUNCA afetado pelo título)
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
    <div className="relative w-full h-full flex flex-col items-center select-none font-['Inter'] bg-[#004b87] text-white border-[0.7cqw] border-[#00335e] box-border overflow-hidden">

      {/* ZONA 1: CABEÇALHO FIXO NO TOPO (23cqw - mais presença visual) */}
      <div
        className="w-full h-[23cqw] bg-[#ffab00] text-[#004b87] flex flex-col items-center justify-center pt-[1.5cqw] pb-[4cqw] relative z-10 shrink-0"
        style={{
          clipPath: 'polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%)',
        }}
      >
        <h1 className="font-exo2 font-black uppercase leading-none text-center whitespace-nowrap" style={{ fontSize: headerFontSize, letterSpacing: '-0.02em' }}>
          {headerText}
        </h1>
      </div>

      {/* MIOLO ÚTIL: PREENCHIMENTO COMPACTO E HARMONIOSO (Padding vertical reduzido) */}
      <div className="flex flex-col items-center justify-between w-full flex-1 min-h-0 px-[4.5cqw] py-[0.8cqw] text-center overflow-hidden">

        {/* ZONA 2: ÁREA DO TÍTULO (Adaptação exclusiva ao texto) */}
        <div className="w-full h-[36cqw] flex items-center justify-center shrink-0">
          <h2
            className="font-exo2 font-black uppercase tracking-tight text-white max-w-[98%] leading-[1.14] line-clamp-4 text-center"
            style={{ fontSize: titleFontSize }}
          >
            {title}
          </h2>
        </div>

        {/* ZONA 3: ÁREA DO PREÇO (Adaptação exclusiva ao valor, elementos mais próximos) */}
        <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0">

          {oldPrice && (
            <div className="flex items-center gap-[1.2cqw] font-bold uppercase relative text-blue-100 shrink-0 mb-[0.1cqw]" style={{ fontSize: dePorFontSize }}>
              <span>DE</span>
              <span className="relative inline-block">
                {oldPrice}
                {/* Linha de corte diagonal Ouro grossa */}
                <span className="absolute w-[120%] h-[0.6cqw] bg-[#ffab00] -rotate-[10deg] top-1/2 left-[-10%] z-10 transform -translate-y-1/2 shadow-sm"></span>
              </span>
            </div>
          )}

          <div className="font-exo2 font-black uppercase tracking-wider text-[#ffab00] shrink-0" style={{ fontSize: dePorFontSize }}>
            POR
          </div>

          {/* Preço de Destaque GIGANTESCO OURO */}
          <div className="flex items-baseline justify-center font-exo2 font-black leading-none text-[#ffab00] shrink-0 tracking-tighter mt-[0.2cqw]" style={{ fontSize: mainFontSize }}>
            <span className="font-extrabold mr-[0.8cqw] tracking-tighter" style={{ fontSize: subFontSize }}>R$</span>
            <span>{mainPrice}</span>
            <span className="font-extrabold tracking-tighter" style={{ fontSize: subFontSize }}>{cents}</span>
          </div>
        </div>
      </div>

      {/* ZONA 4: RODAPÉ FIXO NA BASE (logo oficial + chamada + código) */}
      <div className="w-full h-[13cqw] flex items-center justify-center gap-[3cqw] border-t-[0.6cqw] border-[#ffab00]/40 px-[4cqw] shrink-0 bg-[#004b87] z-10">
        {/* Logo oficial Coagro Pet */}
        <CoagroPetLogo className="w-[16cqw] h-auto shrink-0" />
        <div className="flex flex-col items-center min-w-0">
          <p className="font-exo2 font-black uppercase tracking-wider text-center text-white" style={{ fontSize: '3.6cqw' }}>
            APROVEITE! ÚLTIMAS UNIDADES!
          </p>
          {codigo && (
            <div className="mt-[0.3cqw] font-bold opacity-90 text-white" style={{ fontSize: '2.4cqw' }}>
              CÓD: {codigo}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
