import React from 'react';
import {
  X,
  BookOpen,
  AlertOctagon,
  CheckCircle2,
  ShieldCheck,
  Palette,
  Type,
  FileCheck,
} from 'lucide-react';
import {
  LogoHorizontalAzul,
  LogoHorizontalBranca,
  LogoHorizontalMonoBranca,
  LogoVerticalAzul,
  LogoVerticalBranca,
  LogoVerticalMonoBranca,
} from '../assets/coagroLogos';

interface BrandGuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandGuideDrawer: React.FC<BrandGuideDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs font-['Inter']">
      <div className="bg-white max-w-xl w-full h-full shadow-2xl flex flex-col overflow-hidden border-l border-gray-200">
        {/* Header */}
        <div className="bg-[#004d40] text-white p-5 border-b-4 border-[#ffab00] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#ffab00] text-[#1F2937]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-exo2 font-bold text-base">Manual de Marca Coagro [AGRO]</h3>
              <p className="text-xs text-emerald-100/80">Diretrizes oficiais e padrões visuais</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-xs text-gray-700 leading-relaxed">
          {/* Regra de Ouro */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-red-700 font-bold font-exo2 text-sm">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>REGRA DE OURO: AS DUAS MARCAS COAGRO</span>
            </div>
            <p className="text-gray-700 text-xs">
              O Grupo Coagro possui duas marcas distintas que <strong>NUNCA</strong> devem ser misturadas:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="bg-white p-2 rounded-lg border border-red-200">
                <span className="font-bold text-[#004d40]">Coagro [AGRO]:</span>
                <p className="text-gray-600 mt-1">Produtores rurais, pecuaristas, revendas.</p>
                <p className="text-emerald-800 font-bold mt-1">Verde (#004d40) • Ouro (#ffab00) • Azul (#001C71)</p>
              </div>
              <div className="bg-white p-2 rounded-lg border border-red-200 opacity-60">
                <span className="font-bold text-[#4897D0]">Coagro [PET]:</span>
                <p className="text-gray-600 mt-1">Tutores de cães e gatos. NUNCA usar no Agro!</p>
                <p className="text-blue-700 font-bold mt-1">Azul Pet (#4897D0) • Laranja (#E96C2C)</p>
              </div>
            </div>
          </div>

          {/* Cores Oficiais Agro */}
          <div>
            <h4 className="font-exo2 font-bold text-sm text-gray-900 mb-2 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-[#004d40]" /> Paleta Agro Oficial
            </h4>
            <div className="grid grid-cols-2 gap-2 text-white">
              <div className="bg-[#004d40] p-3 rounded-xl shadow-xs">
                <div className="font-exo2 font-bold text-xs">Verde Institucional</div>
                <div className="text-[10px] font-mono text-emerald-200 mt-0.5">#004d40 (Dominante)</div>
                <div className="text-[9px] text-white/70 mt-1">RGB: 0, 77, 64</div>
              </div>
              <div className="bg-[#ffab00] text-[#1F2937] p-3 rounded-xl shadow-xs">
                <div className="font-exo2 font-black text-xs">Ouro / Acento Agro</div>
                <div className="text-[10px] font-mono font-bold mt-0.5">#ffab00 (CTAs e Selos)</div>
                <div className="text-[9px] text-gray-800/80 mt-1">RGB: 255, 171, 0</div>
              </div>
              <div className="bg-[#001C71] p-3 rounded-xl shadow-xs">
                <div className="font-exo2 font-bold text-xs">Azul Coagro</div>
                <div className="text-[10px] font-mono text-blue-200 mt-0.5">#001C71 (Redes Sociais)</div>
                <div className="text-[9px] text-white/70 mt-1">RGB: 0, 28, 113</div>
              </div>
              <div className="bg-[#00796b] p-3 rounded-xl shadow-xs">
                <div className="font-exo2 font-bold text-xs">Verde Hover / Secundário</div>
                <div className="text-[10px] font-mono text-emerald-100 mt-0.5">#00796b</div>
                <div className="text-[9px] text-white/70 mt-1">RGB: 0, 121, 107</div>
              </div>
            </div>
          </div>

          {/* Tipografia */}
          <div>
            <h4 className="font-exo2 font-bold text-sm text-gray-900 mb-2 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-[#004d40]" /> Tipografia Oficial
            </h4>
            <div className="border border-gray-200 rounded-xl p-3 space-y-2 bg-gray-50">
              <div>
                <span className="font-exo2 font-black text-sm text-[#001C71]">
                  Exo 2 (Google Fonts)
                </span>
                <p className="text-[11px] text-gray-600">
                  Pesos 700 (Bold) e 800 (ExtraBold). Utilizada em Títulos de Impacto e Destaques.
                </p>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <span className="font-semibold text-sm text-gray-800 font-['Inter']">
                  Inter (Google Fonts)
                </span>
                <p className="text-[11px] text-gray-600">
                  Pesos 400 (Regular), 500 (Medium) e 600 (SemiBold). Utilizada em bullets técnicos, subtítulos e rodapés.
                </p>
              </div>
            </div>
          </div>

          {/* Variações SVG Oficiais */}
          <div>
            <h4 className="font-exo2 font-bold text-sm text-gray-900 mb-2 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-[#004d40]" /> Repertório de Logos Vetoriais (6 Variações)
            </h4>
            <div className="space-y-2">
              <div className="p-3 bg-gray-100 rounded-xl flex items-center justify-between border">
                <div>
                  <span className="font-bold text-gray-800">Var 1: Horizontal Azul</span>
                  <p className="text-[10px] text-gray-500">Fundos claros e brancos</p>
                </div>
                <div className="w-28">
                  <LogoHorizontalAzul />
                </div>
              </div>

              <div className="p-3 bg-[#004d40] text-white rounded-xl flex items-center justify-between border">
                <div>
                  <span className="font-bold">Var 2: Horizontal Branca</span>
                  <p className="text-[10px] text-emerald-200">Fundos escuros (#004d40 / #001C71)</p>
                </div>
                <div className="w-28">
                  <LogoHorizontalBranca />
                </div>
              </div>

              <div className="p-3 bg-gray-900 text-white rounded-xl flex items-center justify-between border">
                <div>
                  <span className="font-bold">Var 3: Monocromática Branca</span>
                  <p className="text-[10px] text-gray-400">Fotos do campo e fundos complexos</p>
                </div>
                <div className="w-28">
                  <LogoHorizontalMonoBranca />
                </div>
              </div>
            </div>
          </div>

          {/* Informações Oficiais de Rodapé */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-1">
            <span className="font-bold text-[#004d40] font-exo2 text-xs">
              Dados Oficiais Institucionais:
            </span>
            <ul className="list-disc list-inside text-[11px] text-gray-700 space-y-0.5">
              <li>WhatsApp e Telefone: <strong>(82) 3021-8200</strong></li>
              <li>Site Oficial: <strong>grupocoagro.com.br</strong></li>
              <li>Atuação Regional: <strong>Lojas em Alagoas e Sergipe</strong></li>
              <li>Ano de Fundação: <strong>1983 (Mais de 40 anos de liderança)</strong></li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#004d40] text-white rounded-xl text-xs font-bold font-exo2 tracking-wide uppercase hover:bg-[#00796b] transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
