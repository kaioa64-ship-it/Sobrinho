import React from 'react';
import { Type, Tag, Sparkles, Flame, Share2, Zap } from 'lucide-react';
import { sanitizeErpTitle } from '../lib/erpSanitizer';
import { calculateDiscount } from '../lib/priceCalculator';

export interface PosterManualData {
  codigo: string;
  titulo: string;
  valorDe: string;
  valorPor: string;
  showDiscountBadge?: boolean;
}

interface PosterManualEditorProps {
  data: PosterManualData;
  onChange: (data: PosterManualData) => void;
  onSendToSocial?: (data: PosterManualData) => void;
  appMode?: 'AGRO' | 'PET';
}

const QUICK_DEMO_PRESETS = [
  { label: '🐕 Tutticanis 10kg', codigo: '12345', titulo: 'RAÇÃO TUTTICANIS SELECT 10.1 KG', valorDe: '58,00', valorPor: '44,00' },
  { label: '🌾 Pulverizador XP16', codigo: '01', titulo: 'PULVERIZADOR COSTAL XP16 JACTO 16L', valorDe: '289,00', valorPor: '229,00' },
  { label: '🌱 Adubo NPK 10-10-10', codigo: '3301', titulo: 'ADUBO FERTILIZANTE NPK 10-10-10 1KG', valorDe: '18,50', valorPor: '13,90' },
  { label: '🐄 Ivomec Gold 500ml', codigo: '8420', titulo: 'ANTIPARASITÁRIO IVOMEC GOLD 500ML', valorDe: '145,00', valorPor: '119,00' },
];

export const PosterManualEditor: React.FC<PosterManualEditorProps> = ({ 
  data, 
  onChange,
  onSendToSocial,
  appMode = 'AGRO'
}) => {
  const discount = calculateDiscount(data.valorDe, data.valorPor);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 space-y-6">
      {/* Cabeçalho do Editor */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#004d40]/10 flex items-center justify-center text-[#004d40]">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-exo2 font-bold text-gray-800 text-lg">Informações do Cartaz</h3>
            <p className="text-[11px] text-gray-500">Preencha os dados do encarte ou clique em um atalho de demonstração.</p>
          </div>
        </div>
      </div>

      {/* Chips de Atalho de Demonstração Rápida */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 font-exo2 flex items-center gap-1">
          <Zap className="w-3 h-3 text-[#ffab00]" />
          Preenchimento Rápido (Demonstração Coagro)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_DEMO_PRESETS.map((preset) => (
            <button
              key={preset.codigo}
              type="button"
              onClick={() => onChange({
                ...data,
                codigo: preset.codigo,
                titulo: preset.titulo,
                valorDe: preset.valorDe,
                valorPor: preset.valorPor,
                showDiscountBadge: true,
              })}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all text-gray-700 bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300 active:scale-95 cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            Código do Produto
          </label>
          <input
            type="text"
            value={data.codigo}
            onChange={(e) => {
              const novoCodigo = e.target.value;
              onChange({ ...data, codigo: novoCodigo });
              if (!novoCodigo || novoCodigo.trim().length === 0) return;

              import('../lib/productStorage').then(({ findProductBySku }) => {
                findProductBySku(novoCodigo).then(product => {
                  if (product) {
                    onChange({
                      ...data,
                      codigo: novoCodigo,
                      titulo: product.nome,
                      valorDe: product.valorDe || data.valorDe,
                      valorPor: product.valorPor || data.valorPor,
                    });
                  }
                });
              });
            }}
            placeholder="Ex: 12345 (ou digite 00/01 para demo)"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] transition-all font-mono text-gray-800 text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
              Nome do Produto
            </label>
            {data.titulo && (
              <button
                type="button"
                onClick={() => onChange({ ...data, titulo: sanitizeErpTitle(data.titulo) })}
                className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded transition flex items-center gap-1 cursor-pointer"
                title="Expande abreviações e limpa siglas (ex: RAC -> Ração, 20L)"
              >
                <Sparkles className="w-3 h-3" /> Limpar Siglas
              </button>
            )}
          </div>
          <input
            type="text"
            value={data.titulo}
            onChange={(e) => onChange({ ...data, titulo: e.target.value })}
            placeholder="Ex: RAÇÃO TUTTICANIS SELECT 10.1 KG"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004d40]/20 focus:border-[#004d40] transition-all font-medium text-gray-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5 text-gray-500">
              <Tag className="w-3.5 h-3.5" /> De (R$)
            </label>
            <input
              type="text"
              value={data.valorDe}
              onChange={(e) => onChange({ ...data, valorDe: e.target.value })}
              placeholder="Ex: 58,00"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-300 transition-all font-bold text-gray-600 line-through"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#d67022] uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Por (R$)
            </label>
            <input
              type="text"
              value={data.valorPor}
              onChange={(e) => onChange({ ...data, valorPor: e.target.value })}
              placeholder="Ex: 44,00"
              className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-[#d67022]/20 focus:border-[#d67022] transition-all font-bold text-[#d67022] text-lg"
            />
          </div>
        </div>

        {/* Card Dinâmico de Desconto Calculado & Economia */}
        {discount && (
          <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-[#ffab00] text-[#004d40]">
                <Flame className="w-3.5 h-3.5" />
              </span>
              <div>
                <div className="text-xs font-black text-gray-900 font-exo2 flex items-center gap-1.5">
                  <span className="text-[#004d40] bg-[#ffab00] px-1.5 py-0.2 rounded font-black text-[11px]">
                    {discount.badgeText}
                  </span>
                  <span>Economia de R$ {discount.savingsBrl}</span>
                </div>
                <span className="text-[10px] text-gray-500">Cálculo dinâmico baseado nos preços informados</span>
              </div>
            </div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.showDiscountBadge ?? true}
                onChange={(e) => onChange({ ...data, showDiscountBadge: e.target.checked })}
                className="w-4 h-4 rounded text-[#004d40] focus:ring-[#004d40] cursor-pointer"
              />
              <span className="hidden sm:inline">Exibir selo</span>
            </label>
          </div>
        )}

        {/* Integração Cruzada: Enviar Dados para Redes Sociais */}
        {onSendToSocial && (
          <button
            type="button"
            onClick={() => onSendToSocial(data)}
            className="w-full py-2.5 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl text-xs font-bold font-exo2 uppercase tracking-wide flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#004d40]" />
            <span>Criar Arte para Redes Sociais com Este Produto</span>
          </button>
        )}
      </div>
    </div>
  );
};
