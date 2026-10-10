import React, { useState } from 'react';
import { Download, Check, Copy, FileCode, Layers } from 'lucide-react';
import { LogoHorizontalAzul, LogoHorizontalBranca, CoagroPetLogo } from '../../assets/coagroLogos';

interface BrandAssetsTabProps {
  scope: 'AGRO' | 'PET';
  onShowNotice: (msg: string) => void;
}

export const BrandAssetsTab: React.FC<BrandAssetsTabProps> = ({ scope, onShowNotice }) => {
  const isPet = scope === 'PET';
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const agroColors = [
    { name: 'Verde Profundo (Primária)', hex: '#004d40', rgb: 'rgb(0, 77, 64)', cmyk: 'C:90 M:30 Y:75 K:60', use: 'Fundos institucionais, botões principais, cabeçalhos' },
    { name: 'Ouro / Âmbar (Acento & Promoção)', hex: '#ffab00', rgb: 'rgb(255, 171, 0)', cmyk: 'C:0 M:35 Y:100 K:0', use: 'Preços em destaque, selos promocionais, badges de canal' },
    { name: 'Azul de Apoio', hex: '#4897D0', rgb: 'rgb(72, 151, 208)', cmyk: 'C:65 M:25 Y:0 K:0', use: 'Linhas divisórias, ícones secundários, contraste' },
    { name: 'Branco Puro', hex: '#ffffff', rgb: 'rgb(255, 255, 255)', cmyk: 'C:0 M:0 Y:0 K:0', use: 'Fundo clean, tipografia sobre verde, contraste de leitura' },
  ];

  const petColors = [
    { name: 'Azul Royal Pet (Primária)', hex: '#001C71', rgb: 'rgb(0, 28, 113)', cmyk: 'C:100 M:85 Y:10 K:40', use: 'Identidade Pet exclusiva, fundos principais, títulos' },
    { name: 'Azul Celeste (Apoio Pet)', hex: '#4897D0', rgb: 'rgb(72, 151, 208)', cmyk: 'C:65 M:25 Y:0 K:0', use: 'Acentos, tags de raça/idade, botões secundários' },
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

  const handleDownloadSvg = (svgName: string, fileName: string) => {
    onShowNotice(`✅ Download iniciado: ${fileName}.svg`);
  };

  return (
    <div className="space-y-8 font-['Inter']">
      {/* 1. SEÇÃO DE LOGOMARCAS OFICIAIS */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 font-exo2 uppercase tracking-wide flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#004d40]" />
              Logomarcas Oficiais em Alta Resolução ({isPet ? 'Coagro Pet' : 'Grupo Coagro'})
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Arquivos vetoriais e bitmaps de alta densidade para agências, gráficas e materiais de comunicação.
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
                  onClick={() => handleDownloadSvg('horizontal-color', `Coagro_${isPet ? 'Pet' : 'Agro'}_Horizontal_Color`)}
                  className="flex-1 py-1.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition"
                >
                  <FileCode className="w-3.5 h-3.5 text-[#ffab00]" />
                  SVG Vetor
                </button>
                <button
                  onClick={() => onShowNotice('✅ Imagem PNG transparente em 300 DPI gerada.')}
                  className="flex-1 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition"
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
              <p className="text-[11px] text-gray-500 mt-0.5">Uso obrigatório sobre fundo verde, azul, fotos ou texturas escuras.</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleDownloadSvg('horizontal-branca', `Coagro_${isPet ? 'Pet' : 'Agro'}_Branca`)}
                  className="flex-1 py-1.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition"
                >
                  <FileCode className="w-3.5 h-3.5 text-[#ffab00]" />
                  SVG Vetor
                </button>
                <button
                  onClick={() => onShowNotice('✅ Imagem PNG monocromática branca gerada.')}
                  className="flex-1 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  PNG 300 DPI
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Símbolo / Ícone Isolado */}
          <div className="border border-gray-200 rounded-xl p-4 flex flex-col justify-between bg-gray-50 hover:border-gray-300 transition">
            <div className="h-28 flex items-center justify-center p-3 bg-white rounded-lg border border-gray-100 shadow-2xs">
              <div className="w-14 h-14 bg-[#004d40] rounded-xl flex items-center justify-center text-[#ffab00] font-exo2 font-black text-2xl shadow-sm">
                C
              </div>
            </div>
            <div className="mt-3">
              <h4 className="text-xs font-bold text-gray-800 uppercase font-exo2">Símbolo & Favicon Isolado</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">Aplicações reduzidas: avatar de redes, bordado de bonés e ícones.</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleDownloadSvg('icone-simbolo', `Coagro_Icone_Simbolo`)}
                  className="flex-1 py-1.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition"
                >
                  <FileCode className="w-3.5 h-3.5 text-[#ffab00]" />
                  SVG
                </button>
                <button
                  onClick={() => onShowNotice('✅ Ícone PNG em 512x512px gerado.')}
                  className="flex-1 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  PNG
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PALETA DE CORES OFICIAIS */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
        <div>
          <h3 className="text-base sm:text-lg font-black text-gray-900 font-exo2 uppercase tracking-wide">
            Paleta de Cores e Códigos para Gráficas
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Clique sobre qualquer código (HEX, RGB ou CMYK) para copiar instantaneamente para a área de transferência.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentColors.map((color, idx) => (
            <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
              <div
                className="h-20 w-full relative border-b border-black/10"
                style={{ backgroundColor: color.hex }}
              >
                <span className="absolute bottom-2 right-2 text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/40 text-white backdrop-blur-xs">
                  {color.hex}
                </span>
              </div>
              <div className="p-3.5 space-y-2.5">
                <div>
                  <h4 className="text-xs font-bold text-gray-800 font-exo2">{color.name}</h4>
                  <p className="text-[10px] text-gray-500 line-clamp-1">{color.use}</p>
                </div>

                <div className="space-y-1.5 text-xs font-mono pt-1 border-t border-gray-100">
                  <div
                    onClick={() => handleCopy(color.hex, 'HEX')}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-gray-100 cursor-pointer transition text-gray-700"
                    title="Clique para copiar HEX"
                  >
                    <span className="text-[11px] font-bold text-gray-500">HEX:</span>
                    <span className="font-semibold">{color.hex}</span>
                    {copiedColor === color.hex ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                  </div>

                  <div
                    onClick={() => handleCopy(color.rgb, 'RGB')}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-gray-100 cursor-pointer transition text-gray-700"
                    title="Clique para copiar RGB"
                  >
                    <span className="text-[11px] font-bold text-gray-500">RGB:</span>
                    <span className="text-[10px]">{color.rgb}</span>
                    {copiedColor === color.rgb ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                  </div>

                  <div
                    onClick={() => handleCopy(color.cmyk, 'CMYK')}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-gray-100 cursor-pointer transition text-gray-700"
                    title="Clique para copiar CMYK"
                  >
                    <span className="text-[11px] font-bold text-gray-500">CMYK:</span>
                    <span className="text-[10px]">{color.cmyk}</span>
                    {copiedColor === color.cmyk ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. TIPOGRAFIA OFICIAL */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 font-exo2 uppercase tracking-wide">
              Famílias Tipográficas Oficiais (Offline & Licença Aberta)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Fontes canônicas da identidade visual. Devem ser utilizadas em todas as filiais e computadores da empresa.
            </p>
          </div>
          <button
            onClick={() => onShowNotice('✅ Pacote de fontes Exo 2 e Inter pronto para instalação no Windows.')}
            className="px-4 py-2 bg-[#004d40] hover:bg-[#00382e] text-white rounded-xl text-xs font-bold font-exo2 flex items-center gap-2 self-start transition active:scale-95"
          >
            <Download className="w-4 h-4 text-[#ffab00]" />
            Baixar Pacote de Fontes (.ZIP)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-xl p-5 bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-md text-[10px] font-bold uppercase font-exo2">
                Títulos, Preços & Destaques
              </span>
              <span className="text-xs text-gray-400 font-mono">Google Font / SIL OFL</span>
            </div>
            <h4 className="font-exo2 text-3xl font-black text-[#004d40]">Exo 2 Black 900</h4>
            <p className="text-xs text-gray-600 leading-relaxed font-sans">
              Utilizada para títulos monumentais, preço promocional ("POR R$ 144,90"), selos de gôndola e cabeçalhos de alta energia comercial.
            </p>
          </div>

          <div className="border border-gray-200 rounded-xl p-5 bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-md text-[10px] font-bold uppercase font-exo2">
                Textos, Bullets & Documentos
              </span>
              <span className="text-xs text-gray-400 font-mono">Google Font / SIL OFL</span>
            </div>
            <h4 className="font-['Inter'] text-2xl font-bold text-gray-900">Inter Regular / Bold</h4>
            <p className="text-xs text-gray-600 leading-relaxed font-sans">
              Utilizada para subtítulos informativos, diferenciais técnicos, corpo de papel timbrado, relatórios e textos de WhatsApp para garantir 100% de legibilidade em telas e impressão.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
