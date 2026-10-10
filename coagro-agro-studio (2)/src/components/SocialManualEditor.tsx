import React, { useRef, useState } from 'react';
import { Upload, X, Type, Tag, Palette, Wand2, Plus, Trash2, List, LayoutTemplate, Store, Sparkles, MessageCircle, Loader2 } from 'lucide-react';
import { TemplateLayout, CanvasFormat } from '../types/agro';
import { removeWhiteBackground, processProductImage } from '../lib/imageTransparency';
import { sanitizeErpTitle } from '../lib/erpSanitizer';

export interface SocialManualData {
  codigo?: string;
  titulo: string;
  subtitulo: string;
  valorDe: string;
  valorPor: string;
  diferenciais: string[];
  backgroundImageUrl?: string;
  backgroundColorHex?: string;
  badge?: string;
  theme?: string;
  textBackground?: boolean;
  cta?: string;
  preserveProductBackground?: boolean;
}

interface SocialManualEditorProps {
  appMode: 'AGRO' | 'PET';
  onAppModeChange: (mode: 'AGRO' | 'PET') => void;
  templateLayout: TemplateLayout;
  onTemplateChange: (template: TemplateLayout) => void;
  format: CanvasFormat;
  onFormatChange: (fmt: CanvasFormat) => void;
  data: SocialManualData;
  onChange: (data: SocialManualData) => void;
  productImage: string;
  onSetProductImage: (url: string) => void;
}

export const SocialManualEditor: React.FC<SocialManualEditorProps> = ({
  appMode,
  onAppModeChange,
  templateLayout,
  onTemplateChange,
  format,
  onFormatChange,
  data,
  onChange,
  productImage,
  onSetProductImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [cutoutImage, setCutoutImage] = useState<string | null>(null);
  const [showAllCtas, setShowAllCtas] = useState(false);

  const handleProductUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;

        const img = new Image();
        img.onload = async () => {
          const ratio = img.naturalWidth / img.naturalHeight;
          if (ratio < 0.6 || ratio > 1.8) {
            const proceed = window.confirm("A imagem selecionada possui um formato muito esticado ou vertical. O encaixe pode não ficar ideal. Deseja continuar?");
            if (!proceed) {
              if (fileInputRef.current) fileInputRef.current.value = '';
              return;
            }
          }

          setOriginalImage(base64);
          setIsProcessingBg(true);
          try {
            const quickCutout = await removeWhiteBackground(base64);
            setCutoutImage(quickCutout);
            onSetProductImage(quickCutout);
            onChange({ ...data, preserveProductBackground: false });

            if (data.codigo) {
              import('../lib/productStorage').then(({ saveProductToStorage }) => {
                saveProductToStorage({
                  codigo: data.codigo!,
                  nome: data.titulo || 'Produto',
                  imagemRecortada: quickCutout,
                  imagemOriginal: base64,
                  valorDe: data.valorDe,
                  valorPor: data.valorPor,
                  diferenciais: data.diferenciais,
                  templateLayout,
                  updatedAt: Date.now()
                }).catch(console.warn);
              });
            }
          } catch (err) {
            setCutoutImage(null);
            onSetProductImage(base64);
            onChange({ ...data, preserveProductBackground: true });
          } finally {
            setIsProcessingBg(false);
          }
        };
        img.src = base64;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRefineCutout = async () => {
    const src = originalImage || productImage;
    if (!src) return;

    // Se a imagem já for um packshot vetorial SVG, não precisa de WASM neural
    if (src.startsWith('data:image/svg+xml')) {
      setCutoutImage(src);
      onSetProductImage(src);
      onChange({ ...data, preserveProductBackground: false });
      return;
    }

    setIsProcessingBg(true);
    try {
      // Timeout defensivo de 10 segundos para não congelar computadores de loja
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Tempo limite excedido no recorte neural local.')), 10000)
      );

      const result = await Promise.race([
        processProductImage(src, 'standard'),
        timeoutPromise,
      ]);

      setCutoutImage(result.finalUrl);
      onSetProductImage(result.finalUrl);
      onChange({ ...data, preserveProductBackground: false });

      if (data.codigo) {
        import('../lib/productStorage').then(({ saveProductToStorage }) => {
          saveProductToStorage({
            codigo: data.codigo!,
            nome: data.titulo || 'Produto',
            imagemRecortada: result.finalUrl,
            imagemOriginal: src,
            valorDe: data.valorDe,
            valorPor: data.valorPor,
            diferenciais: data.diferenciais,
            templateLayout,
            updatedAt: Date.now()
          }).catch(console.warn);
        });
      }
    } catch (e) {
      console.warn('Recorte neural WASM lento ou indisponível, aplicando Chroma-Key instantâneo:', e);
      // Fallback gracioso instantâneo via Canvas puro (20ms)
      try {
        const fallback = await removeWhiteBackground(src);
        setCutoutImage(fallback);
        onSetProductImage(fallback);
        onChange({ ...data, preserveProductBackground: false });
      } catch (err) {
        console.warn('Erro no fallback:', err);
      }
    } finally {
      setIsProcessingBg(false);
    }
  };

  const handleToggleBackground = (preserveBg: boolean) => {
    onChange({ ...data, preserveProductBackground: preserveBg });
    if (preserveBg) {
      if (originalImage) onSetProductImage(originalImage);
    } else {
      if (cutoutImage) {
        onSetProductImage(cutoutImage);
      } else if (originalImage) {
        handleRefineCutout();
      }
    }
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({ ...data, backgroundImageUrl: event.target?.result as string, theme: 'custom' });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCodigoChange = async (codigoDigitado: string) => {
    onChange({ ...data, codigo: codigoDigitado });
    
    if (!codigoDigitado || codigoDigitado.trim().length === 0) return;

    try {
      const { findProductBySku } = await import('../lib/productStorage');
      const product = await findProductBySku(codigoDigitado);
      if (product) {
        // Se o produto tiver categoria cadastrada (ex: Pet vs Agro), alinha a marca automaticamente
        if (product.categoria && product.categoria !== appMode) {
          onAppModeChange(product.categoria);
        }

        onChange({
          ...data,
          codigo: codigoDigitado,
          titulo: product.nome,
          subtitulo: product.subtitulo || data.subtitulo,
          valorDe: product.valorDe || data.valorDe,
          valorPor: product.valorPor || data.valorPor,
          diferenciais: product.diferenciais && product.diferenciais.length > 0 ? product.diferenciais : data.diferenciais
        });
        if (product.imagemRecortada) {
          setCutoutImage(product.imagemRecortada);
          onSetProductImage(product.imagemRecortada);
        } else if (product.imagemUrl) {
          onSetProductImage(product.imagemUrl);
        }
        if (product.templateLayout) {
          onTemplateChange(product.templateLayout);
        }
      }
    } catch (err) {
      console.warn('Erro ao consultar cache de produtos por SKU:', err);
    }
  };

  const isPet = appMode === 'PET';
  const primaryColor = isPet ? '#4897D0' : '#004d40';
  const primaryColorLight = isPet ? 'rgba(72,151,208,0.1)' : 'rgba(0,77,64,0.1)';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center`} style={{ backgroundColor: primaryColorLight, color: primaryColor }}>
            <Type className="w-4 h-4" />
          </div>
          <h3 className="font-exo2 font-bold text-gray-800 text-lg">Criação Manual de Arte</h3>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Upload de Imagem do Produto */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
            Foto do Produto
          </label>
          {productImage ? (
            <div className="relative rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <div 
                  className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-white"
                  style={{
                    backgroundImage: !data.preserveProductBackground ? `linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)` : undefined,
                    backgroundSize: '12px 12px',
                    backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
                  }}
                >
                  <img src={productImage} alt="Produto" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-1 flex flex-col items-start gap-1">
                  <span className="text-sm font-bold text-gray-800">Foto Carregada</span>
                  <button
                    onClick={handleRefineCutout}
                    disabled={isProcessingBg}
                    className="text-xs font-bold bg-white border border-gray-200 px-2.5 py-1 rounded-md text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {isProcessingBg ? (
                      <Loader2 className="w-3 h-3 animate-spin text-[#004d40]" />
                    ) : (
                      <Wand2 className="w-3 h-3 text-[#004d40]" />
                    )}
                    {isProcessingBg ? 'Refinando (WASM)...' : 'Refinar Recorte com IA'}
                  </button>
                </div>
                <button
                  onClick={() => {
                    onSetProductImage('');
                    setOriginalImage(null);
                    setCutoutImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition"
                  title="Remover imagem"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-md transition-colors">
                  <input
                    type="checkbox"
                    checked={data.preserveProductBackground || false}
                    onChange={(e) => handleToggleBackground(e.target.checked)}
                    className="w-4 h-4 text-[#004d40] border-gray-300 rounded focus:ring-[#004d40]"
                  />
                  <span className="text-[13px] font-medium text-gray-700">
                    Manter o fundo original da imagem
                  </span>
                </label>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition"
            >
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">{isProcessingBg ? 'Processando...' : 'Clique para enviar a foto'}</span>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProductUpload} />
            </div>
          )}
        </div>

        {/* Código do Produto e Título */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Cód. Produto
            </label>
            <input
              type="text"
              value={data.codigo || ''}
              onChange={(e) => handleCodigoChange(e.target.value)}
              placeholder="Ex: 12345"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:border-[#004d40] transition-all font-mono text-gray-800"
            />
          </div>
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                Título da Arte
              </label>
              {data.titulo && (
                <button
                  type="button"
                  onClick={() => onChange({ ...data, titulo: sanitizeErpTitle(data.titulo) })}
                  className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded transition flex items-center gap-1"
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
              placeholder="Ex: Ração Golden Special 15kg"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:border-[#004d40] transition-all font-medium text-gray-800"
            />
          </div>
        </div>

        {/* Subtítulo / Descrição Curta */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
            Subtítulo / Descrição Curta
          </label>
          <input
            type="text"
            value={data.subtitulo}
            onChange={(e) => onChange({ ...data, subtitulo: e.target.value })}
            placeholder="Ex: Oferta válida até durarem os estoques"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:border-[#004d40] transition-all font-medium text-gray-800"
          />
        </div>

        {/* Diferenciais */}
        {templateLayout !== 'promo-simples' && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
              <List className="w-3.5 h-3.5" /> Diferenciais (Opcional)
            </label>
            {data.diferenciais.length < 3 && (
              <button 
                onClick={() => onChange({ ...data, diferenciais: [...data.diferenciais, ''] })}
                className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex items-center gap-1 font-bold hover:bg-gray-200"
              >
                <Plus className="w-3 h-3" /> ADICIONAR
              </button>
            )}
          </div>
          <div className="space-y-2">
            {data.diferenciais.map((diff, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={diff}
                  onChange={(e) => {
                    const newDiffs = [...data.diferenciais];
                    newDiffs[idx] = e.target.value;
                    onChange({ ...data, diferenciais: newDiffs });
                  }}
                  placeholder={`Diferencial ${idx + 1}`}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:border-[#004d40] transition-all text-gray-800"
                />
                <button
                  onClick={() => {
                    const newDiffs = [...data.diferenciais];
                    newDiffs.splice(idx, 1);
                    onChange({ ...data, diferenciais: newDiffs });
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Chamada para Ação (CTA) */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" /> Chamada para Ação (CTA)
          </label>
          <input
            type="text"
            value={data.cta || ''}
            onChange={(e) => onChange({ ...data, cta: e.target.value })}
            placeholder="Ex: Garanta já o seu!"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 transition-all font-medium text-gray-800"
          />
          {/* Pílulas de CTA Rápidas compactas (2 visíveis por padrão + Ver mais sugestões) */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {(isPet ? [
              'GARANTA JÁ O SEU!',
              'PEÇA NO WHATSAPP',
              'O MELHOR PRO SEU PET',
              'COMPRE NA LOJA OU NO ZAP',
              'CONSULTE DISPONIBILIDADE'
            ] : [
              'GARANTA JÁ O SEU!',
              'PEÇA NO WHATSAPP',
              'FALE COM NOSSO CONSULTOR',
              'OFERTA POR TEMPO LIMITADO',
              'CONSULTE DISPONIBILIDADE'
            ]).slice(0, showAllCtas ? undefined : 2).map((sugestao) => (
              <button
                key={sugestao}
                type="button"
                onClick={() => onChange({ ...data, cta: sugestao })}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100 hover:text-gray-900 active:scale-95 cursor-pointer"
              >
                {sugestao}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowAllCtas(!showAllCtas)}
              className="text-[11px] font-bold text-[#004d40] hover:underline px-2 py-0.5 rounded transition cursor-pointer"
            >
              {showAllCtas ? 'Ver menos' : '+ Ver mais sugestões'}
            </button>
          </div>
        </div>

        {/* Preço (Escondido se for Informativo) */}
        {!templateLayout.includes('informative') && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5 text-gray-500">
                <Tag className="w-3.5 h-3.5" /> De (R$)
              </label>
              <input
                type="text"
                value={data.valorDe}
                onChange={(e) => onChange({ ...data, valorDe: e.target.value })}
                placeholder="Ex: 159,90"
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
                placeholder="Ex: 129,90"
                className="w-full px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-[#d67022]/20 focus:border-[#d67022] transition-all font-bold text-[#d67022] text-lg"
              />
            </div>
          </div>
        )}

        {/* Design e Layout (Sanfona recolhida por padrão) */}
        <details className="group border border-gray-200 bg-gray-50 rounded-xl overflow-hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-bold text-gray-800 focus:outline-none">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-gray-500" />
              Opções de Design e Layout
            </div>
            <span className="transition group-open:rotate-180">
              <svg fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
            </span>
          </summary>
          <div className="p-4 bg-white border-t border-gray-200 space-y-6">
            
            {/* Seleção do Template */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Layout da Arte
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { id: 'whatsapp-status', label: 'Status Zap', icon: MessageCircle },
                  { id: 'unified-central', label: 'Central', icon: Store },
                  { id: 'unified-split', label: 'Split (Lado)', icon: LayoutTemplate },
                  { id: 'promo-simples', label: 'Promo Simples', icon: Tag },
                  { id: 'informative-central', label: 'Info Central', icon: List },
                  { id: 'informative-split', label: 'Info Split', icon: LayoutTemplate },
                ].map(tpl => (
                  <button
                    key={tpl.id}
                    onClick={(e) => { e.preventDefault(); onTemplateChange(tpl.id as TemplateLayout); }}
                    className={`py-3 px-1 text-xs font-bold rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                      templateLayout === tpl.id 
                        ? 'text-white shadow-md' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                    style={templateLayout === tpl.id ? { backgroundColor: isPet ? '#004b87' : '#004d40', borderColor: isPet ? '#004b87' : '#004d40' } : undefined}
                  >
                    <tpl.icon className="w-5 h-5" />
                    <span className="text-[10px] sm:text-xs text-center">{tpl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cores e Selo da Campanha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              {/* Cor do Template (Geral) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Cor do Template
                </label>
                <select
                  value={data.theme || (appMode === 'PET' ? 'clean-branco' : 'campo-agro')}
                  onChange={(e) => onChange({ ...data, theme: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:border-[#004d40] transition-all"
                >
                  {appMode === 'PET' ? (
                    <>
                      <option value="azul-coagro">Azul Pet (Institucional)</option>
                      <option value="clean-branco">Branco / Clean (Invertido)</option>
                    </>
                  ) : (
                    <>
                      <option value="campo-agro">Verde Coagro (Institucional)</option>
                      <option value="azul-coagro">Azul Coagro (Publicitário)</option>
                      <option value="clean-branco">Branco / Clean (Invertido)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Cor de Fundo (Apenas para Promo Simples) */}
              {templateLayout === 'promo-simples' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Fundo Promo Simples
                  </label>
                  <select
                    value={data.backgroundColorHex || 'branco'}
                    onChange={(e) => onChange({ ...data, backgroundColorHex: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:border-[#004d40] transition-all"
                  >
                    <option value="branco">Branco (Padrão)</option>
                    {appMode !== 'PET' && <option value="verde">Verde Institucional</option>}
                    <option value="azul">{appMode === 'PET' ? 'Azul Pet' : 'Azul Publicitário'}</option>
                    <option value="laranja">Laranja (Alerta)</option>
                  </select>
                </div>
              )}

              {/* Selo Promocional (Badge) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Selo da Campanha
                </label>
                <select
                  value={data.badge || 'Sem Selo'}
                  onChange={(e) => onChange({ ...data, badge: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:ring-2 focus:border-[#004d40] transition-all"
                >
                  <option value="Sem Selo">Sem Selo</option>
                  <option value="OFERTA">Oferta</option>
                  <option value="LANÇAMENTO">Lançamento</option>
                  <option value="SABADÃO">Sabadão</option>
                  <option value="FECHA MÊS">Fecha Mês</option>
                </select>
              </div>
            </div>
          </div>
        </details>

      </div>
    </div>
  );
};

