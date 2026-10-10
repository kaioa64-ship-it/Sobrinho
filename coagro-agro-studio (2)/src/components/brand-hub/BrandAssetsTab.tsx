import React, { useState } from 'react';
import { Download, Check, Copy, FileCode, Layers, Home } from 'lucide-react';
import { 
  LogoHorizontalAzul, 
  LogoHorizontalBranca, 
  CoagroPetLogo,
  CoagroSimboloCasinha,
  CoagroSimboloCasinhaBranca
} from '../../assets/coagroLogos';

interface BrandAssetsTabProps {
  scope: 'AGRO' | 'PET';
  onShowNotice: (msg: string) => void;
}

// Strings SVG oficiais prontas para download vetorial puro
const SVG_CASINHA_COAGRO = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="525 0 235 210" width="1000" height="893">
  <defs>
    <linearGradient id="g0" gradientUnits="userSpaceOnUse" x1="10956.5" y1="15329.98" x2="10322.42" y2="13873.29">
      <stop offset="0" stop-color="#F2B038"/><stop offset="0.34" stop-color="#F0A01B"/><stop offset="1" stop-color="#EA8407"/>
    </linearGradient>
    <linearGradient id="g1" gradientUnits="userSpaceOnUse" x1="10027.58" y1="16075.93" x2="12626.18" y2="16075.93">
      <stop offset="0" stop-color="#386A27"/><stop offset="0.3" stop-color="#60A02E"/><stop offset="0.71" stop-color="#386A27"/><stop offset="1" stop-color="#386A27"/>
    </linearGradient>
    <linearGradient id="g2" gradientUnits="userSpaceOnUse" xlink:href="#g1" x1="8713.48" y1="15288.85" x2="10018.79" y2="14576.43"/>
  </defs>
  <path fill="url(#g2)" d="M661.66 81.01c-45.81,13.1 -59.02,56.87 -59.34,85.88 28.19,7.76 61.47,5.98 82.06,-5.22 46.07,-25.06 33.65,-70.29 33.65,-70.29 0,0 -14.18,-13.08 -37.65,-13.08 -5.71,0 -11.98,0.77 -18.72,2.7l0 0z"/>
  <path fill="url(#g0)" d="M644.15 3.65l-108.78 69.55c-6.34,4.25 -3.52,14.05 4.04,14.05l25 0c4.31,0 8.53,-1.19 12.2,-3.44l71.66 -43.85c4.49,-2.91 10.21,-2.91 14.59,-0.01l69.35 43.12c-52.53,7.92 -107.56,41.6 -125.83,78.32 33.4,-30.47 81.65,-61.01 151.48,-65.42 5.08,-0.32 10.45,0.07 15.23,-1.31 9.14,-2.64 11.21,-14.73 3.47,-20.03l-108.69 -70.99c-3.53,-2.42 -7.64,-3.63 -11.77,-3.63 -4.14,0 -8.31,1.22 -11.94,3.65l0 0z"/>
  <path fill="url(#g1)" d="M743.55 189.58l0 -76.98c0,-2.62 -2.11,-4.74 -4.72,-4.74 -2.28,0 -4.24,1.63 -4.64,3.88 -3.4,18.95 -14.21,42.16 -43.98,58.78 -26.43,14.76 -69.03,17.27 -105.07,7.3l0 0c0.37,-24.42 7.63,-56.88 28.46,-81.52 0.85,-1 0.14,-2.53 -1.17,-2.53l-0 0 -29.77 0c-7.2,0 -13.04,5.84 -13.04,13.05l0 82.75c0,7.21 5.84,13.05 13.04,13.05l147.87 0c7.21,0 13.04,-5.85 13.04,-13.05z"/>
</svg>`;

const SVG_LOGO_HORIZONTAL = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 781.31 247.56" width="1200" height="380">
  <defs>
    <linearGradient id="h-g0" gradientUnits="userSpaceOnUse" x1="10956.5" y1="15329.98" x2="10322.42" y2="13873.29">
      <stop offset="0" stop-color="#F2B038"/><stop offset="0.34" stop-color="#F0A01B"/><stop offset="1" stop-color="#EA8407"/>
    </linearGradient>
    <linearGradient id="h-g1" gradientUnits="userSpaceOnUse" x1="10027.58" y1="16075.93" x2="12626.18" y2="16075.93">
      <stop offset="0" stop-color="#386A27"/><stop offset="0.3" stop-color="#60A02E"/><stop offset="0.71" stop-color="#386A27"/><stop offset="1" stop-color="#386A27"/>
    </linearGradient>
    <linearGradient id="h-g2" gradientUnits="userSpaceOnUse" xlink:href="#h-g1" x1="8713.48" y1="15288.85" x2="10018.79" y2="14576.43"/>
  </defs>
  <g id="simbolo-folha">
    <path fill="url(#h-g2)" d="M661.66 81.01c-45.81,13.1 -59.02,56.87 -59.34,85.88 28.19,7.76 61.47,5.98 82.06,-5.22 46.07,-25.06 33.65,-70.29 33.65,-70.29 0,0 -14.18,-13.08 -37.65,-13.08 -5.71,0 -11.98,0.77 -18.72,2.7l0 0z"/>
    <path fill="url(#h-g0)" d="M644.15 3.65l-108.78 69.55c-6.34,4.25 -3.52,14.05 4.04,14.05l25 0c4.31,0 8.53,-1.19 12.2,-3.44l71.66 -43.85c4.49,-2.91 10.21,-2.91 14.59,-0.01l69.35 43.12c-52.53,7.92 -107.56,41.6 -125.83,78.32 33.4,-30.47 81.65,-61.01 151.48,-65.42 5.08,-0.32 10.45,0.07 15.23,-1.31 9.14,-2.64 11.21,-14.73 3.47,-20.03l-108.69 -70.99c-3.53,-2.42 -7.64,-3.63 -11.77,-3.63 -4.14,0 -8.31,1.22 -11.94,3.65l0 0z"/>
    <path fill="url(#h-g1)" d="M743.55 189.58l0 -76.98c0,-2.62 -2.11,-4.74 -4.72,-4.74 -2.28,0 -4.24,1.63 -4.64,3.88 -3.4,18.95 -14.21,42.16 -43.98,58.78 -26.43,14.76 -69.03,17.27 -105.07,7.3l0 0c0.37,-24.42 7.63,-56.88 28.46,-81.52 0.85,-1 0.14,-2.53 -1.17,-2.53l-0 0 -29.77 0c-7.2,0 -13.04,5.84 -13.04,13.05l0 82.75c0,7.21 5.84,13.05 13.04,13.05l147.87 0c7.21,0 13.04,-5.85 13.04,-13.05z"/>
  </g>
  <g id="texto-letras-azul" fill="#001C71">
    <path fill="#001C71" d="M52.57 200.33c-39.3,0 -53.07,-15.82 -52.55,-67.49 0.26,-25.41 3.67,-38.93 11.13,-49.43 8.05,-11.34 21.64,-16.62 42.76,-16.62 12.1,0 25.46,0.28 39.14,1.26 1.67,0.12 2.98,1.43 3.07,3.06 0.18,3.16 0.31,7.07 0.27,11.39 -0.04,3.86 -0.2,7.39 -0.39,10.38 -0.12,1.85 -1.78,3.26 -3.67,3.11 -15.22,-1.22 -29.86,-1.24 -30.14,-1.24 -26.44,0 -28.62,14.45 -28.86,38.37 -0.24,24.43 1.65,39.23 28.08,39.23 0.29,0 15.03,-0.02 30.35,-1.25 1.78,-0.14 3.32,1.17 3.4,2.91 0.15,3.08 0.26,6.64 0.22,10.31 -0.04,4.4 -0.26,8.41 -0.5,11.65 -0.12,1.56 -1.41,2.8 -3.01,2.89 -12.9,0.73 -27.9,1.46 -39.28,1.46l0 0 0 0z"/>
    <path fill="#001C71" d="M146.15 174.19c10.89,0 14.41,-9.4 14.58,-27.59 0.18,-17.98 -3.17,-24.67 -14.06,-24.67 -10.9,0 -14.37,5.86 -14.55,23.83 -0.18,18.6 3.14,28.42 14.03,28.42l0 0 0 0zm0.81 -81.52c37.17,0 47.04,17.14 46.68,52.67 -0.39,39.3 -15.1,57.49 -47.79,57.49 -32.69,0 -47.03,-18.18 -46.64,-57.49 0.35,-35.53 10.57,-52.67 47.74,-52.67z"/>
    <path fill="#001C71" d="M255.24 178.37l0.21 -21.32 -17.31 0c-7.9,0 -9.23,4.6 -9.29,10.87 -0.07,7.11 1.17,10.87 9.29,10.87 6.2,0 10.89,0.21 17.09,-0.42zm-28.44 23.62c-22.86,0 -27.45,-11.08 -27.22,-33.87 0.22,-22.36 5.24,-33.03 29.38,-33.03l26.7 0 0.07 -6.69c0.08,-8.15 -4.61,-9.41 -20.84,-9.41 -9.59,0 -17.39,1.68 -21.67,2.86 -2,0.55 -4.04,-0.65 -4.48,-2.63 -1.34,-6.01 -2.08,-12.1 -1.77,-19.28 0.07,-1.52 1.09,-2.84 2.58,-3.28 4.53,-1.37 15.17,-4 29.87,-4 32.69,0 48,7.11 47.71,35.75l-0.7 70.26c-0.01,1.38 -1.15,2.51 -2.56,2.55 -7.96,0.2 -33.32,0.77 -57.07,0.77l0 0 0 -0z"/>
    <path fill="#001C71" d="M356.09 122.76l-12.82 0c-10.9,0 -15.44,6.06 -15.63,25.09 -0.17,16.72 2.31,25.29 16.84,25.29l11.11 0 0.5 -50.38zm30.62 -28.54c1.67,0.06 2.98,1.4 2.96,3.03l-0.95 95.53c-0.39,39.3 -15.29,54.77 -51.39,54.77 -11.55,0 -23.27,-1.46 -34.46,-5.54 -1.46,-0.53 -2.35,-1.97 -2.18,-3.5 0.83,-7.26 2.68,-14.51 5.24,-21.65 0.62,-1.73 2.57,-2.68 4.34,-2.1 8.46,2.76 17.47,4.57 27.35,4.57 8.54,0 17.34,-3.55 17.47,-16.51l0.03 -3.13 -11.96 0.62c-36.12,1.88 -48.75,-17.35 -48.4,-52.46 0.39,-39.51 13.36,-54.35 45.62,-54.35 22.2,0 39.63,0.5 46.35,0.73l0 0 -0 -0z"/>
    <path fill="#001C71" d="M398.32 98.24c0.02,-2.21 1.8,-4.03 4.06,-4.14 4.75,-0.25 13.36,-0.6 23.76,-0.6 9.77,0 20.01,0.46 24.7,0.69 1.53,0.08 2.75,1.24 2.87,2.73 0.22,2.77 0.52,7.41 0.47,12.04 -0.05,5.11 -0.39,9.33 -0.67,11.9 -0.16,1.55 -1.5,2.73 -3.09,2.73l-19.03 0 -0.74 74.39c-0.02,2.04 -1.65,3.73 -3.72,3.89 -3.23,0.24 -8.11,0.53 -12.77,0.53 -5.02,0 -9.96,-0.29 -13.19,-0.53 -2.08,-0.16 -3.66,-1.85 -3.65,-3.89l1 -99.75 0 0 0 0z"/>
    <path fill="#001C71" d="M504.43 174.19c10.89,0 14.41,-9.4 14.59,-27.59 0.18,-17.98 -3.17,-24.67 -14.06,-24.67 -10.9,0 -14.37,5.86 -14.55,23.83 -0.18,18.6 3.14,28.42 14.03,28.42l0 0zm0.81 -81.52c37.17,0 47.04,17.14 46.69,52.67 -0.39,39.3 -15.1,57.49 -47.79,57.49 -32.69,0 -47.03,-18.18 -46.64,-57.49 0.35,-35.53 10.57,-52.67 47.74,-52.67z"/>
  </g>
</svg>`;

export const BrandAssetsTab: React.FC<BrandAssetsTabProps> = ({ scope, onShowNotice }) => {
  const isPet = scope === 'PET';
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // PALETA OFICIAL: O Azul Coagro (#001C71) tem a primazia da marca
  const agroColors = [
    { name: 'Azul Coagro (Tipografia & Identidade Titular)', hex: '#001C71', rgb: 'rgb(0, 28, 113)', cmyk: 'C:100 M:85 Y:10 K:40', use: 'Texto titular COAGRO na logo, títulos formais, contrastes executivos' },
    { name: 'Verde Profundo Safra (Primária)', hex: '#004d40', rgb: 'rgb(0, 77, 64)', cmyk: 'C:90 M:30 Y:75 K:60', use: 'Fundos institucionais, botões principais, cabeçalhos de filiais' },
    { name: 'Ouro / Âmbar Safra (Acento & Promoção)', hex: '#ffab00', rgb: 'rgb(255, 171, 0)', cmyk: 'C:0 M:35 Y:100 K:0', use: 'Telhado da casinha, preços promocionais, selos de destaque' },
    { name: 'Azul Claro Suporte', hex: '#4897D0', rgb: 'rgb(72, 151, 208)', cmyk: 'C:65 M:25 Y:0 K:0', use: 'Linhas divisórias, tags técnicas, suporte visual secundário' },
    { name: 'Branco Puro', hex: '#ffffff', rgb: 'rgb(255, 255, 255)', cmyk: 'C:0 M:0 Y:0 K:0', use: 'Fundo clean, contraste sobre verde escuro e leitura' },
  ];

  const petColors = [
    { name: 'Azul Royal Pet (Primária)', hex: '#001C71', rgb: 'rgb(0, 28, 113)', cmyk: 'C:100 M:85 Y:10 K:40', use: 'Identidade Pet exclusiva, fundos principais, títulos' },
    { name: 'Azul Celeste Pet (Apoio)', hex: '#4897D0', rgb: 'rgb(72, 151, 208)', cmyk: 'C:65 M:25 Y:0 K:0', use: 'Acentos, tags de raça/idade, botões secundários' },
    { name: 'Ouro Pet (Destaque)', hex: '#ffab00', rgb: 'rgb(255, 171, 0)', cmyk: 'C:0 M:35 Y:100 K:0', use: 'Preços promocionais, selos de desconto, estrelas' },
    { name: 'Branco Puro', hex: '#ffffff', rgb: 'rgb(255, 255, 255)', cmyk: 'C:0 M:0 Y:0 K:0', use: 'Fundo clean pet, embalagens recortadas' },
  ];

  const currentColors = isPet ? petColors : agroColors;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedColor(text);
    onShowNotice(`Copiado: ${label} (${text})`);
    setTimeout(() => setCopiedColor(null), 2500);
  };

  const handleDownloadSvgReal = (svgString: string, fileName: string) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    onShowNotice(`✅ Vetor SVG baixado: ${fileName}.svg`);
  };

  const handleDownloadPngReal = (svgString: string, fileName: string, width = 1200, height = 1200) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `${fileName}.png`;
        a.click();
        onShowNotice(`✅ Imagem PNG 300 DPI baixada: ${fileName}.png`);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="space-y-8 font-['Inter']">
      {/* 1. SEÇÃO DE LOGOMARCAS OFICIAIS & CASINHA COAGRO */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 font-exo2 uppercase tracking-wide flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#004d40]" />
              Ativos Oficiais de Marca & Favicon ({isPet ? 'Coagro Pet' : 'Grupo Coagro'})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Arquivos vetoriais em SVG e bitmaps de alta definição (300 DPI) para gráficas, uniformes, embalagens e comunicação.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Horizontal Colorida */}
          <div className="border border-gray-200 rounded-xl p-4 flex flex-col justify-between bg-gray-50 hover:border-gray-300 transition">
            <div className="h-28 flex items-center justify-center p-3 bg-white rounded-lg border border-gray-100 shadow-2xs">
              {isPet ? <CoagroPetLogo className="max-h-16 w-auto" /> : <LogoHorizontalAzul className="max-h-14 w-auto" />}
            </div>
            <div className="mt-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase font-exo2">Logo Horizontal Oficial (Fundo Claro)</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Aplicação padrão em documentos, cabeçalhos e fundos brancos.</p>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => handleDownloadSvgReal(SVG_LOGO_HORIZONTAL, `Coagro_${isPet ? 'Pet' : 'Agro'}_Horizontal_Color`)}
                  className="flex-1 py-1.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-[#ffab00]" />
                  Baixar SVG
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPngReal(SVG_LOGO_HORIZONTAL, `Coagro_${isPet ? 'Pet' : 'Agro'}_Horizontal_Color`, 1200, 380)}
                  className="flex-1 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  PNG 300 DPI
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Horizontal Branca para Fundo Escuro */}
          <div className="border border-gray-200 rounded-xl p-4 flex flex-col justify-between bg-gray-50 hover:border-gray-300 transition">
            <div className={`h-28 flex items-center justify-center p-3 rounded-lg shadow-2xs ${isPet ? 'bg-[#001C71]' : 'bg-[#004d40]'}`}>
              {isPet ? <CoagroPetLogo className="max-h-16 w-auto brightness-0 invert" /> : <LogoHorizontalBranca className="max-h-14 w-auto" />}
            </div>
            <div className="mt-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase font-exo2">Logo Monocromática Branca (Fundo Escuro)</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Uso obrigatório sobre fundo verde escuro, azul royal ou fotos densas.</p>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => handleDownloadSvgReal(SVG_LOGO_HORIZONTAL, `Coagro_${isPet ? 'Pet' : 'Agro'}_Branca`)}
                  className="flex-1 py-1.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-[#ffab00]" />
                  Baixar SVG
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPngReal(SVG_LOGO_HORIZONTAL, `Coagro_${isPet ? 'Pet' : 'Agro'}_Branca`, 1200, 380)}
                  className="flex-1 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  PNG 300 DPI
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: SÍMBOLO OFICIAL DA CASINHA DA COAGRO (FAVICON / ÍCONE) */}
          <div className="border-2 border-[#ffab00]/50 rounded-xl p-4 flex flex-col justify-between bg-emerald-50/40 hover:border-[#ffab00] transition shadow-xs">
            <div className="h-28 flex items-center justify-center p-3 bg-white rounded-lg border border-gray-100 shadow-2xs">
              <CoagroSimboloCasinha className="w-16 h-16" />
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-[#004d40]" />
                <h4 className="text-xs font-bold text-gray-900 uppercase font-exo2">Símbolo Oficial: A Casinha Coagro</h4>
              </div>
              <p className="text-[11px] text-gray-600 mt-0.5">Favicon, ícone de app, aros de perfil WhatsApp e bordados.</p>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => handleDownloadSvgReal(SVG_CASINHA_COAGRO, 'Coagro_Simbolo_Casinha_Oficial')}
                  className="flex-1 py-1.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5 text-[#ffab00]" />
                  SVG Casinha
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPngReal(SVG_CASINHA_COAGRO, 'Coagro_Simbolo_Casinha_Oficial', 1000, 893)}
                  className="flex-1 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  PNG 1000px
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEÇÃO DE PALETA DE CORES OFICIAIS */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="text-base sm:text-lg font-black text-gray-900 font-exo2 uppercase tracking-wide">
            Paleta de Cores Institucionais
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Clique em qualquer código para copiar instantaneamente para a área de transferência.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {currentColors.map((color) => (
            <div
              key={color.hex}
              className="border border-gray-200 rounded-xl p-3 flex flex-col justify-between space-y-3 bg-gray-50 hover:bg-white hover:shadow-sm transition"
            >
              <div>
                <div
                  className="h-16 rounded-lg w-full border border-black/10 shadow-inner flex items-end justify-end p-1.5"
                  style={{ backgroundColor: color.hex }}
                >
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-white font-bold backdrop-blur-xs">
                    {color.hex}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-gray-900 font-exo2 mt-2 leading-tight">
                  {color.name}
                </h4>
                <p className="text-[10px] text-gray-500 mt-1 leading-snug">{color.use}</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-gray-200/60 font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => handleCopy(color.hex, `${color.name} (HEX)`)}
                  className="w-full flex items-center justify-between px-2 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded transition cursor-pointer"
                >
                  <span className="text-gray-500">HEX:</span>
                  <span className="font-bold text-gray-800">{color.hex}</span>
                  {copiedColor === color.hex ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(color.rgb, `${color.name} (RGB)`)}
                  className="w-full flex items-center justify-between px-2 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded transition cursor-pointer"
                >
                  <span className="text-gray-500">RGB:</span>
                  <span className="font-semibold text-gray-700 text-[9px]">{color.rgb}</span>
                </button>
                <div className="text-[9px] text-gray-400 px-2 py-0.5 text-center">
                  CMYK: {color.cmyk}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. GUIA DE TIPOGRAFIA */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="text-base sm:text-lg font-black text-gray-900 font-exo2 uppercase tracking-wide">
            Diretrizes Tipográficas Oficiais (Exo 2 + Inter)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Hierarquia de fontes aprovada para todas as peças de varejo e comunicação corporativa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Família 1: Exo 2 */}
          <div className="border border-gray-200 rounded-xl p-5 bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#004d40] uppercase font-exo2 tracking-wider">
                Tipografia de Títulos & Ação
              </span>
              <span className="text-[10px] bg-emerald-100 text-[#004d40] px-2 py-0.5 rounded-full font-bold">
                Exo 2
              </span>
            </div>
            <div className="text-3xl font-black font-exo2 text-gray-900 tracking-tight">
              AGROFORÇA 2026
            </div>
            <p className="text-xs text-gray-600 leading-relaxed font-sans">
              Utilizada exclusivamente para títulos, chamadas promocionais, valores de preço, selos e nomes de lojas. Caracteriza robustez e tecnologia no campo.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-[11px] font-exo2 font-bold">Black 900</span>
              <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-[11px] font-exo2 font-bold">Bold 700</span>
              <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-[11px] font-exo2 font-medium">Medium 500</span>
            </div>
          </div>

          {/* Família 2: Inter */}
          <div className="border border-gray-200 rounded-xl p-5 bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#004d40] uppercase font-exo2 tracking-wider">
                Tipografia de Leitura & Documentos
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full font-bold">
                Inter
              </span>
            </div>
            <div className="text-2xl font-semibold text-gray-900 leading-tight">
              Especificações Técnicas e Bullets
            </div>
            <p className="text-xs text-gray-600 leading-relaxed font-sans">
              Utilizada em textos corridos, laudos, comunicados de loja, descrições de dosagem, parágrafos de legendas e dados fiscais. Máxima legibilidade em telas e impressão.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-[11px] font-sans font-bold">SemiBold 600</span>
              <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-[11px] font-sans font-medium">Regular 400</span>
              <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-[11px] font-sans font-light">Light 300</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
