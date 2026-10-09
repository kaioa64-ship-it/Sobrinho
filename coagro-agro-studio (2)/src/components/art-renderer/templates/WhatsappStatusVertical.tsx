import React from 'react';
import { CoagroLogo, CoagroPetLogo, LogoVariant } from '../../../assets/coagroLogos';
import { CommunicationMode } from '../../../lib/communicationMode';
import { SemanticProductImage } from '../SemanticProductImage';
import { renderTitleWithHighlight } from '../../../lib/renderHelper';
import { Check } from 'lucide-react';

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
  theme?: string;
  badge?: string;
}

/**
 * Ícone Oficial Vetorial do WhatsApp (Balão de diálogo canônico com telefone)
 */
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.04-1.07l-.29-.17-3.12.82.83-3.04-.19-.3a8.214 8.214 0 01-1.25-4.47c0-4.54 3.7-8.23 8.24-8.23h.04zm-3.52 4.2c-.19 0-.41.07-.63.31-.22.25-.85.83-.85 2.02 0 1.19.87 2.34.99 2.5.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.47-.28-.25-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.54.12-.16.25-.63.79-.77.95-.14.16-.28.18-.53.06-.25-.12-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.38.11-.5.11-.11.25-.28.37-.43.12-.14.16-.24.25-.4.08-.16.04-.3-.02-.43-.06-.12-.54-1.3-.74-1.79-.2-.47-.4-.41-.54-.42h-.47z" />
  </svg>
);

/**
 * WhatsappStatusVertical - Template Oficial de Story / Status (9:16)
 * Focado em Alta Conversão via WhatsApp e Helena CRM.
 * 
 * Estrutura:
 *  1. Topo: Logo oficial Coagro/Pet (+ Selo opcional quando configurado)
 *  2. Centro: Imagem com recorte e ancoragem + Título de impacto em Exo 2
 *  3. Bloco Comercial: Preço DE/POR monumental com centavos elevados
 *  4. Rodapé de Ação: Botão WhatsApp com ícone oficial e atendimento direto
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
  isLight = false,
  theme,
  badge,
}) => {
  const isPet = scope === 'PET';
  const effectiveLight = isLight || theme === 'clean-branco';

  // Paleta oficial dinâmica com suporte a degradê Agro, Verde-Azul e Pet
  let bgGradient: string;
  if (effectiveLight) {
    bgGradient = 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)';
  } else if (isPet) {
    bgGradient = 'linear-gradient(180deg, #004b87 0%, #003662 50%, #002340 100%)';
  } else if (theme === 'azul-coagro') {
    // Degradê oficial elegante de Verde para Azul escuro conforme sugestão do Kaio
    bgGradient = 'linear-gradient(180deg, #004d40 0%, #003b5c 50%, #001C71 100%)';
  } else {
    // Padrão Verde Agro profundo
    bgGradient = 'linear-gradient(180deg, #004d40 0%, #00382e 50%, #00241d 100%)';
  }

  const accentColor = effectiveLight ? (isPet ? '#004b87' : '#004d40') : '#ffab00';
  const petSupportColor = '#4897D0';

  // Preço quebrado em reais e centavos para tipografia editorial monumental
  const priceParts = currentPrice.replace('R$', '').trim().split(',');
  const mainPrice = priceParts[0] || '0';
  const cents = priceParts[1] ? `,${priceParts[1]}` : ',00';

  const hasBadge = Boolean(badge && badge !== 'Sem Selo' && badge.trim() !== '');

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between overflow-hidden select-none font-['Inter'] p-[5cqw] ${
        effectiveLight ? 'text-gray-900' : 'text-white'
      }`}
      style={{ background: bgGradient }}
    >
      {/* Elementos visuais de fundo sutis (círculos de luz) */}
      {!effectiveLight && (
        <>
          <div
            className="absolute -top-[10cqw] -right-[10cqw] w-[50cqw] h-[50cqw] rounded-full pointer-events-none opacity-20 blur-2xl"
            style={{ backgroundColor: isPet ? petSupportColor : '#006b59' }}
          />
          <div
            className="absolute top-[40%] -left-[15cqw] w-[60cqw] h-[60cqw] rounded-full pointer-events-none opacity-15 blur-3xl"
            style={{ backgroundColor: '#ffab00' }}
          />
        </>
      )}

      {/* --- ZONA 1: CABEÇALHO & IDENTIDADE --- */}
      <header className={`relative z-10 flex items-center w-full pt-[1cqw] ${
        hasBadge ? 'justify-between' : 'justify-center'
      }`}>
        <div className={`flex items-center ${
          hasBadge ? 'w-[32cqw] max-w-[140px]' : 'w-[38cqw] max-w-[170px] justify-center'
        }`}>
          {isPet ? (
            <CoagroPetLogo className="w-full h-auto drop-shadow-md" />
          ) : (
            <CoagroLogo
              variant={effectiveLight ? 'h-azul' : logoVariant || 'h-mono-branca'}
              className="w-full h-auto drop-shadow-md"
            />
          )}
        </div>

        {/* Badge superior de canal direto (renderizado apenas quando há selo ativo) */}
        {hasBadge && (
          <div className={`flex items-center gap-[1.2cqw] backdrop-blur-md px-[3.5cqw] py-[1cqw] rounded-full shadow-sm ${
            effectiveLight 
              ? 'bg-amber-100/90 border border-amber-300 text-amber-900' 
              : 'bg-black/35 border border-white/20 text-[#ffab00]'
          }`}>
            <span className="font-exo2 font-black uppercase text-[2.8cqw] tracking-wider">
              {badge}
            </span>
          </div>
        )}
      </header>

      {/* --- ZONA 2: PRODUTO & DESTAQUE VISUAL (CENTRO) --- */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center my-[2cqw] min-h-0">
        {/* Foto do Produto com Ancoragem Central */}
        <div className="relative w-full flex-1 max-h-[46cqh] flex items-center justify-center">
          {processedProduct ? (
            <div className={`relative w-full h-full flex items-center justify-center ${
              effectiveLight ? 'drop-shadow-[0_15px_25px_rgba(0,0,0,0.18)]' : 'drop-shadow-[0_20px_35px_rgba(0,0,0,0.55)]'
            }`}>
              <SemanticProductImage
                src={processedProduct}
                codigo={codigo}
              />
            </div>
          ) : (
            <div className={`w-[45cqw] h-[45cqw] rounded-3xl border flex items-center justify-center text-[3.5cqw] ${
              effectiveLight ? 'bg-gray-100 border-gray-300 text-gray-500' : 'bg-white/10 border-white/20 text-white/50'
            }`}>
              Insira a foto do produto
            </div>
          )}

          {/* Badge flutuante de SKU/Código */}
          {codigo && (
            <div className={`absolute top-[2cqw] right-[3cqw] backdrop-blur-md px-[2.8cqw] py-[0.8cqw] rounded-lg border text-[2.6cqw] font-mono font-bold ${
              effectiveLight 
                ? 'bg-white/80 border-gray-300 text-gray-700' 
                : 'bg-black/60 border-white/20 text-white/90'
            }`}>
              CÓD: {codigo}
            </div>
          )}
        </div>

        {/* Título de Impacto & Subtítulo */}
        <div className="w-full text-center mt-[1cqw] px-[2cqw] shrink-0">
          <h1 className={`font-exo2 font-black uppercase text-[6.2cqw] leading-[1.08] tracking-tight line-clamp-2 ${
            effectiveLight ? 'text-gray-950' : 'text-white drop-shadow-md'
          }`}>
            {renderTitleWithHighlight(title || 'Oferta Especial Coagro', highlight, accentColor)}
          </h1>

          {subtitle && (
            <p className={`font-medium text-[3.2cqw] mt-[1cqw] line-clamp-1 ${
              effectiveLight ? 'text-gray-600' : 'text-white/85'
            }`}>
              {subtitle}
            </p>
          )}

          {/* Lista de Diferenciais Técnicos (Até 2 pílulas compactas) */}
          {benefits.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-[1.5cqw] mt-[1.8cqw]">
              {benefits.slice(0, 2).map((b, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-[1cqw] backdrop-blur-sm px-[2.5cqw] py-[0.6cqw] rounded-full border text-[2.6cqw] font-semibold ${
                    effectiveLight 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                      : 'bg-white/15 border-white/20 text-white/95'
                  }`}
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
        <section className={`relative z-10 w-full flex flex-col items-center justify-center backdrop-blur-md rounded-2xl border py-[2.2cqw] px-[4cqw] my-[1.5cqw] shrink-0 ${
          effectiveLight 
            ? 'bg-white/80 border-gray-200 shadow-md' 
            : 'bg-black/35 border-white/15'
        }`}>
          {oldPrice && (
            <div className={`flex items-center gap-[1.5cqw] text-[3.2cqw] font-semibold uppercase ${
              effectiveLight ? 'text-gray-500' : 'text-white/70'
            }`}>
              <span>DE:</span>
              <span className="line-through decoration-[#ffab00] decoration-2">
                R$ {oldPrice.replace('R$', '').trim()}
              </span>
            </div>
          )}

          <div className="flex items-baseline justify-center font-exo2 font-black leading-none tracking-tight mt-[0.5cqw]">
            <span className={`text-[5.5cqw] mr-[1cqw] font-extrabold ${
              effectiveLight ? 'text-gray-700' : 'text-white'
            }`}>
              POR
            </span>
            <span className={`text-[5.2cqw] mr-[0.5cqw] font-extrabold ${
              effectiveLight ? (isPet ? 'text-[#004b87]' : 'text-[#004d40]') : 'text-[#ffab00]'
            }`}>
              R$
            </span>
            <span className={`text-[14cqw] drop-shadow-sm ${
              effectiveLight ? (isPet ? 'text-[#004b87]' : 'text-[#004d40]') : 'text-[#ffab00]'
            }`}>
              {mainPrice}
            </span>
            <span className={`text-[6.5cqw] font-extrabold ${
              effectiveLight ? (isPet ? 'text-[#004b87]' : 'text-[#004d40]') : 'text-[#ffab00]'
            }`}>
              {cents}
            </span>
          </div>

          {condition && (
            <p className={`text-[2.8cqw] font-bold uppercase tracking-wide mt-[0.8cqw] ${
              effectiveLight ? 'text-gray-700' : 'text-white/90'
            }`}>
              {condition}
            </p>
          )}
        </section>
      )}

      {/* --- ZONA 4: RODAPÉ DE AÇÃO WHATSAPP (HELENA CRM) --- */}
      <footer className="relative z-10 w-full shrink-0">
        <div className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-[#003820] rounded-2xl p-[3cqw] flex items-center gap-[3.5cqw] shadow-[0_10px_25px_rgba(37,211,102,0.35)] border border-white/30 transition-all">
          <div className="w-[11cqw] h-[11cqw] rounded-full bg-white flex items-center justify-center text-[#25D366] shadow-sm shrink-0">
            <WhatsAppIcon className="w-[6.5cqw] h-[6.5cqw] fill-[#25D366]" />
          </div>
          <div className="flex flex-col text-left flex-1 min-w-0">
            <span className="font-exo2 font-black uppercase text-[4cqw] leading-tight text-[#003319] tracking-tight truncate">
              {cta || 'PEÇA NO WHATSAPP'}
            </span>
            <span className="text-[2.6cqw] font-bold text-[#004d26]/85 leading-tight truncate">
              Atendimento Imediato com Consultor
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
