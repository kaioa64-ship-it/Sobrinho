import React from 'react';
import { CoagroLogo, CoagroPetLogo, LogoVariant } from '../../../assets/coagroLogos';
import { CommunicationMode } from '../../../lib/communicationMode';
import { SemanticProductImage } from '../SemanticProductImage';
import { renderTitleWithHighlight } from '../../../lib/renderHelper';
import { Check, MessageCircle, Zap } from 'lucide-react';

export interface WhatsappStatusVerticalProps {
  codigo?: string;
  scope: 'AGRO' | 'PET';
  title: string;
  highlight?: string;
  subtitle?: string;
  processedProduct: string;
  logoVariant?: LogoVariant;
  mode?: CommunicationMode;
  hasPrice?: boolean;
  currentPrice?: string;
  oldPrice?: string;
  condition?: string;
  benefits?: string[];
  cta?: string;
  isLight?: boolean;
}

/**
 * WhatsappStatusVertical - Template Oficial de Story / Status (9:16)
 * Focado em Alta Conversão via WhatsApp e Helena CRM.
 * 
 * Estrutura:
 *  1. Topo: Logo oficial Coagro/Pet + Selo "OFERTA NO WHATSAPP"
 *  2. Centro: Imagem com recorte e sombra de ancoragem + Título de impacto
 *  3. Bloco Comercial: Preço DE/POR em tipografia Exo 2 monumental
 *  4. Rodapé de Ação: Card de atendimento Helena CRM com botão verde WhatsApp
 */
export const WhatsappStatusVertical: React.FC<WhatsappStatusVerticalProps> = ({
  codigo,
  scope,
  title,
  highlight = '',
  subtitle,
  processedProduct,
  logoVariant,
  hasPrice = true,
  currentPrice = '',
  oldPrice,
  condition,
  benefits = [],
  cta = 'PEÇA NO WHATSAPP',
}) => {
  const isPet = scope === 'PET';

  // Paleta oficial estrita (Sem mistura de marcas)
  const bgGradient = isPet
    ? 'linear-gradient(180deg, #004b87 0%, #003662 50%, #002340 100%)'
    : 'linear-gradient(180deg, #004d40 0%, #00382e 50%, #00241d 100%)';

  const accentColor = '#ffab00'; // Dourado Coagro oficial
  const petSupportColor = '#4897D0'; // Azul apoio Pet

  // Preço quebrado em reais e centavos para tipografia editorial
  const priceParts = currentPrice.replace('R$', '').trim().split(',');
  const mainPrice = priceParts[0] || '0';
  const cents = priceParts[1] ? `,${priceParts[1]}` : ',00';

  return (
    <div
      className="relative w-full h-full flex flex-col justify-between overflow-hidden select-none font-['Inter'] text-white p-[5cqw]"
      style={{ background: bgGradient }}
    >
      {/* Elementos visuais de fundo sutis (círculos de luz) */}
      <div
        className="absolute -top-[10cqw] -right-[10cqw] w-[50cqw] h-[50cqw] rounded-full pointer-events-none opacity-20 blur-2xl"
        style={{ backgroundColor: isPet ? petSupportColor : '#006b59' }}
      />
      <div
        className="absolute top-[40%] -left-[15cqw] w-[60cqw] h-[60cqw] rounded-full pointer-events-none opacity-15 blur-3xl"
        style={{ backgroundColor: accentColor }}
      />

      {/* --- ZONA 1: CABEÇALHO & IDENTIDADE --- */}
      <header className="relative z-10 flex items-center justify-between w-full pt-[1cqw]">
        <div className="w-[32cqw] max-w-[140px] flex items-center">
          {isPet ? (
            <CoagroPetLogo className="w-full h-auto drop-shadow-md" />
          ) : (
            <CoagroLogo variant={logoVariant || 'h-mono-branca'} className="w-full h-auto drop-shadow-md" />
          )}
        </div>

        {/* Badge superior de canal direto */}
        <div className="flex items-center gap-[1.2cqw] bg-black/30 backdrop-blur-md border border-white/15 px-[3cqw] py-[1cqw] rounded-full shadow-sm">
          <Zap className="w-[3.5cqw] h-[3.5cqw] text-[#ffab00]" />
          <span className="font-exo2 font-extrabold uppercase text-[2.8cqw] tracking-wider text-white">
            STATUS EXCLUSIVO
          </span>
        </div>
      </header>

      {/* --- ZONA 2: PRODUTO & DESTAQUE VISUAL (CENTRO) --- */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center my-[2cqw] min-h-0">
        {/* Foto do Produto com Ancoragem Central */}
        <div className="relative w-full flex-1 max-h-[46cqh] flex items-center justify-center">
          {processedProduct ? (
            <div className="relative w-full h-full flex items-center justify-center drop-shadow-[0_20px_35px_rgba(0,0,0,0.55)]">
              <SemanticProductImage
                src={processedProduct}
                codigo={codigo}
              />
            </div>
          ) : (
            <div className="w-[45cqw] h-[45cqw] rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center text-white/50 text-[3.5cqw]">
              Insira a foto do produto
            </div>
          )}

          {/* Badge flutuante de SKU/Código */}
          {codigo && (
            <div className="absolute top-[2cqw] right-[3cqw] bg-black/60 backdrop-blur-md px-[2.8cqw] py-[0.8cqw] rounded-lg border border-white/20 text-[2.6cqw] font-mono text-white/90">
              CÓD: {codigo}
            </div>
          )}
        </div>

        {/* Título de Impacto & Subtítulo */}
        <div className="w-full text-center mt-[1cqw] px-[2cqw] shrink-0">
          <h1 className="font-exo2 font-black uppercase text-[6.2cqw] leading-[1.08] tracking-tight drop-shadow-md line-clamp-2">
            {renderTitleWithHighlight(title || 'Oferta Especial Coagro', highlight, accentColor)}
          </h1>

          {subtitle && (
            <p className="font-medium text-[3.2cqw] text-white/85 mt-[1cqw] line-clamp-1">
              {subtitle}
            </p>
          )}

          {/* Lista de Diferenciais Técnicos (Até 2 pílulas compactas) */}
          {benefits.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-[1.5cqw] mt-[1.8cqw]">
              {benefits.slice(0, 2).map((b, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-[1cqw] bg-white/15 backdrop-blur-sm px-[2.5cqw] py-[0.6cqw] rounded-full border border-white/20 text-[2.6cqw] font-semibold text-white/95"
                >
                  <Check className="w-[3cqw] h-[3cqw] text-[#ffab00]" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* --- ZONA 3: BLOCO COMERCIAL & PREÇO --- */}
      {hasPrice && currentPrice && (
        <section className="relative z-10 w-full flex flex-col items-center justify-center bg-black/35 backdrop-blur-md rounded-2xl border border-white/15 py-[2.2cqw] px-[4cqw] my-[1.5cqw] shrink-0">
          {oldPrice && (
            <div className="flex items-center gap-[1.5cqw] text-[3.2cqw] text-white/70 font-semibold uppercase">
              <span>DE:</span>
              <span className="line-through decoration-[#ffab00] decoration-2">
                R$ {oldPrice.replace('R$', '').trim()}
              </span>
            </div>
          )}

          <div className="flex items-baseline justify-center font-exo2 font-black leading-none text-[#ffab00] tracking-tight mt-[0.5cqw]">
            <span className="text-[5.5cqw] mr-[1cqw] font-extrabold text-white">POR</span>
            <span className="text-[5.2cqw] mr-[0.5cqw] font-extrabold text-[#ffab00]">R$</span>
            <span className="text-[14cqw] text-[#ffab00] drop-shadow-sm">{mainPrice}</span>
            <span className="text-[6.5cqw] font-extrabold text-[#ffab00]">{cents}</span>
          </div>

          {condition && (
            <p className="text-[2.8cqw] font-bold text-white/90 uppercase tracking-wide mt-[0.8cqw]">
              {condition}
            </p>
          )}
        </section>
      )}

      {/* --- ZONA 4: RODAPÉ DE AÇÃO WHATSAPP (HELENA CRM) --- */}
      <footer className="relative z-10 w-full shrink-0">
        <div className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-[#003820] rounded-2xl p-[3cqw] flex items-center justify-between shadow-[0_10px_25px_rgba(37,211,102,0.35)] border border-white/30 transition-all">
          <div className="flex items-center gap-[2.8cqw]">
            <div className="w-[10cqw] h-[10cqw] rounded-full bg-white flex items-center justify-center text-[#25D366] shadow-sm shrink-0">
              <MessageCircle className="w-[6cqw] h-[6cqw] fill-[#25D366] text-[#25D366]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-exo2 font-black uppercase text-[3.8cqw] leading-tight text-[#003319] tracking-tight">
                {cta || 'PEÇA PELO WHATSAPP'}
              </span>
              <span className="text-[2.6cqw] font-bold text-[#004d26]/80 leading-tight">
                Atendimento Imediato com Consultor
              </span>
            </div>
          </div>

          <div className="bg-[#004d26] text-white px-[3cqw] py-[1.2cqw] rounded-xl font-exo2 font-black text-[2.8cqw] uppercase tracking-wider shadow-inner shrink-0">
            ENVIAR
          </div>
        </div>
      </footer>
    </div>
  );
};
