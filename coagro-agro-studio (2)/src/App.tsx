import React, { useState, useEffect } from 'react';
import { useTenantStore } from './store/tenantStore';
import { AgroPostContent, CanvasFormat, CanvasTheme, PresetProduct, TemplateLayout, PosterTemplateLayout, EMPTY_AGRO_CONTENT, EMPTY_PET_CONTENT } from './types/agro';
import { LogoVariant } from './assets/coagroLogos';
import { AGRO_PRESETS } from './data/agroPresets';
import { Header } from './components/Header';
import { SingleArtRenderer } from './components/SingleArtRenderer';
import { InputPanel } from './components/InputPanel';
import { ExportToolbar } from './components/ExportToolbar';
import { ExcelBatchUploader, BatchItem } from './components/ExcelBatchUploader';
import { BatchReviewGrid } from './components/BatchReviewGrid';
import { BatchRendererModal } from './components/BatchRendererModal';
import { PosterManualEditor } from './components/PosterManualEditor';
import { SocialManualEditor, SocialManualData } from './components/SocialManualEditor';
import { getAccessToken } from './lib/firebase';
import { uploadToGoogleDrive } from './lib/googleDrive';
import { resolveDefaultTemplate } from './lib/layoutRules';
import { CommunicationMode } from './lib/communicationMode';
import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Eye, Sparkles, Copy, Download, Columns2, Maximize2, Box, FileText, Printer, ShieldCheck } from 'lucide-react';
import { BrandHubModule } from './components/brand-hub/BrandHubModule';

export default function App() {
  // Estado inicial 100% zerado - sem nenhum produto ou texto pré-carregado
  const [currentContent, setCurrentContent] = useState<AgroPostContent>(
    EMPTY_AGRO_CONTENT
  );
  const [productImage, setProductImage] = useState<string>('');
  const [backgroundImage, setBackgroundImage] = useState<string | undefined>(undefined);

  // App Module State: STORE_POSTERS por padrão (Preto e Branco A4 pré-selecionado)
  const [currentModule, setCurrentModule] = useState<'SOCIAL_MEDIA' | 'STORE_POSTERS' | 'BRAND_HUB'>('STORE_POSTERS');
  const [posterMode, setPosterMode] = useState<'MANUAL' | 'BATCH' | 'REVIEW'>('MANUAL');
  const [posterTemplate, setPosterTemplate] = useState<PosterTemplateLayout>('promo-mono-a4');
  const [posterHeaderText, setPosterHeaderText] = useState<string>('OFERTA');
  const [manualPosterData, setManualPosterData] = useState({
    codigo: '12345',
    titulo: 'RAÇÃO TUTTICANIS SELECT 10.1 KG',
    valorDe: '58,00',
    valorPor: '44,00'
  });

  // App Mode State: AGRO or PET agora lido do Zustand para manter compatibilidade com o resto do código
  const { activeScopeId, setScope } = useTenantStore();
  const appMode = activeScopeId === 'pet' ? 'PET' : 'AGRO';
  const handleSetAppMode = (mode: 'AGRO' | 'PET') => {
    setScope(mode === 'PET' ? 'pet' : 'agro');
  };
  
  const [socialMode, setSocialMode] = useState<'MANUAL' | 'AI_BETA'>('MANUAL');
  const [socialManualData, setSocialManualData] = useState<SocialManualData>({
    codigo: undefined,
    titulo: 'Ração Golden Special 15kg',
    subtitulo: 'Aproveite a oferta imperdível',
    valorDe: '159,90',
    valorPor: '129,90',
    diferenciais: ['15kg rende mais', 'Sem corantes artificiais'],
    backgroundImageUrl: '',
    backgroundColorHex: '',
    theme: '',
    textBackground: undefined,
    badge: 'Sem Selo',
    cta: 'Garanta já o seu!',
    preserveProductBackground: undefined
  });

  // Canvas styling states
  const [canvasFormat, setCanvasFormat] = useState<CanvasFormat>('story');
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>('campo-agro');
  const [templateLayout, setTemplateLayout] = useState<TemplateLayout>('hero-central');
  const [templateWasManuallySelected, setTemplateWasManuallySelected] = useState(false);
  const [logoVariant, setLogoVariant] = useState<LogoVariant>('h-branca');
  const [imageBoxFormat, setImageBoxFormat] = useState<'rectangular' | 'square'>('rectangular');

  useEffect(() => {
    if (appMode === 'PET') {
      setCanvasTheme('clean-branco');
      setTemplateLayout(resolveDefaultTemplate(canvasFormat, 'PET'));
      setLogoVariant('h-azul');
      // Cartaz físico: no escopo Pet o padrão sugerido é o template A4 dedicado,
      // que usa a paleta e a logo oficiais da Coagro Pet (nunca o verde Agro).
      setPosterTemplate('promo-pet-a4');
      setSocialManualData(prev => ({
        ...prev,
        theme: prev.theme === 'campo-agro' ? 'clean-branco' : prev.theme
      }));
    } else {
      setCanvasTheme('campo-agro');
      setTemplateLayout(resolveDefaultTemplate(canvasFormat, 'AGRO'));
      setLogoVariant('h-branca');
      setPosterTemplate('promo-agro-a4');
    }
  }, [appMode]);

  useEffect(() => {
    // 'branco' não existe no tipo CanvasTheme (legado); mantido apenas por tolerância em runtime.
    const isLightBackground = canvasTheme === 'clean-branco' || (canvasTheme as string) === 'branco' || socialManualData.theme === 'clean-branco';
    if (isLightBackground) {
      setLogoVariant('h-azul');
    } else {
      setLogoVariant('h-branca');
    }
  }, [canvasTheme, socialManualData.theme]);

  // Ponte de Automação Segura para Testes Visuais E2E
  if (typeof window !== 'undefined') {
    (window as any).__studioTestBridge = {
      setProductImage,
      setCurrentContent,
      setTemplateLayout,
      setCanvasFormat,
      setCanvasTheme,
      setAppMode: handleSetAppMode,
      setModule: setCurrentModule,
      setPosterTemplate,
      setManualPosterData,
      setSocialManualData: (patch: Partial<SocialManualData>) => {
        const next = { ...socialManualData, ...patch };
        setSocialManualData(next);
        setCurrentContent({
          ...EMPTY_AGRO_CONTENT,
          linha: appMode,
          textos_hero: {
            titulo: next.titulo,
            subtitulo: next.subtitulo,
            palavra_destaque_ouro: '',
          },
          textos_da_arte: {
            titulo_impacto: next.titulo,
            subtitulo: next.subtitulo,
            palavra_destaque: '',
            bullets_tecnicos: next.diferenciais,
            cta: next.cta || '',
          },
          diferenciais_tecnicos: next.diferenciais,
          modulo_preco: {
            ativo: Boolean(next.valorPor),
            valor_de: next.valorDe,
            valor_por: next.valorPor,
          },
          fundo_imagem_url: next.backgroundImageUrl || '',
          fundo_imagem: next.backgroundImageUrl || '',
          fundo_cor_hex: next.backgroundColorHex || '',
          tipo_postagem: next.valorPor ? 'promocao' : 'informativo',
          fundo_texto: next.textBackground,
        });
        if (next.theme) setCanvasTheme(next.theme as any);
      },
      setFullArtwork: (params: {
        title: string;
        subtitle?: string;
        priceDe?: string;
        pricePor?: string;
        productImg?: string;
        scope?: 'AGRO' | 'PET';
        template?: TemplateLayout;
        format?: CanvasFormat;
        theme?: CanvasTheme;
        badge?: string;
      }) => {
        if (params.scope) handleSetAppMode(params.scope);
        if (params.template) setTemplateLayout(params.template);
        if (params.format) setCanvasFormat(params.format);
        if (params.theme) setCanvasTheme(params.theme);
        if (params.productImg !== undefined) setProductImage(params.productImg);

        const newManual: SocialManualData = {
          titulo: params.title || '',
          subtitulo: params.subtitle || '',
          valorDe: params.priceDe || '',
          valorPor: params.pricePor || '',
          diferenciais: ['Tanque anatômico 16L', 'Bico cônico regulável', 'Válvula de alívio'],
          theme: params.theme || (params.scope === 'PET' ? 'clean-branco' : 'campo-agro'),
          cta: 'PEÇA NO WHATSAPP',
          badge: params.badge || 'Sem Selo',
        };
        setSocialManualData(newManual);

        setCurrentContent({
          ...EMPTY_AGRO_CONTENT,
          linha: params.scope || 'AGRO',
          textos_hero: {
            titulo: params.title || '',
            subtitulo: params.subtitle || '',
            palavra_destaque_ouro: '',
          },
          textos_da_arte: {
            titulo_impacto: params.title || '',
            subtitulo: params.subtitle || '',
            palavra_destaque: '',
            bullets_tecnicos: ['Tanque anatômico 16L', 'Bico cônico regulável', 'Válvula de alívio'],
            cta: 'PEÇA NO WHATSAPP',
          },
          diferenciais_tecnicos: ['Tanque anatômico 16L', 'Bico cônico regulável', 'Válvula de alívio'],
          modulo_preco: {
            ativo: Boolean(params.pricePor),
            valor_de: params.priceDe || '',
            valor_por: params.pricePor || '',
          },
          tipo_postagem: params.pricePor ? 'promocao' : 'informativo',
        });
      }
    };
  }

  const handleSelectTemplate = (template: TemplateLayout) => {
    setTemplateLayout(template);
    setTemplateWasManuallySelected(true);
  };

  const handleSelectFormat = (fmt: CanvasFormat) => {
    setCanvasFormat(fmt);
    if (fmt === 'story' && !templateWasManuallySelected) {
      setTemplateLayout(resolveDefaultTemplate('story'));
    }
  };

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);

  // Modals
  const [batchItemsToRender, setBatchItemsToRender] = useState<BatchItem[] | null>(null);
  const [batchExportFormat, setBatchExportFormat] = useState<'PNG' | 'PDF'>('PNG');
  const [batchTemplateToRender, setBatchTemplateToRender] = useState<PosterTemplateLayout>('promo-mono-a4');
  const [batchHeaderTextToRender, setBatchHeaderTextToRender] = useState<string>('OFERTA');

  const handleStartBatch = (items: BatchItem[], format: 'PNG' | 'PDF') => {
    setBatchExportFormat(format);
    setBatchTemplateToRender(posterTemplate);
    setBatchHeaderTextToRender(posterHeaderText);
    setBatchItemsToRender(items);
  };

  const handleStartBatchFromGrid = (
    items: BatchItem[],
    template: PosterTemplateLayout,
    badgeText: string
  ) => {
    setBatchExportFormat('PDF');
    setBatchTemplateToRender(template);
    setBatchHeaderTextToRender(badgeText);
    setBatchItemsToRender(items);
  };

  // Preset Selection
  const handleSelectPreset = (preset: PresetProduct) => {
    setProductImage(preset.imageUrl);
    setCurrentContent(preset.defaultContent);
    if (preset.defaultContent.template_layout) {
      setTemplateLayout(preset.defaultContent.template_layout);
      setTemplateWasManuallySelected(true);
    }
    if (preset.backgroundSampleUrl || preset.defaultContent.fundo_imagem_url) {
      setBackgroundImage(preset.backgroundSampleUrl || preset.defaultContent.fundo_imagem_url);
    } else if (preset.defaultContent.fundo_imagem && (preset.defaultContent.fundo_imagem.startsWith('http') || preset.defaultContent.fundo_imagem.startsWith('data:'))) {
      setBackgroundImage(preset.defaultContent.fundo_imagem);
    } else {
      setBackgroundImage(undefined);
    }

    if (preset.defaultContent.formato_gerado === 'Story' || preset.defaultContent.formato === 'story') {
      setCanvasFormat('story');
    } else {
      setCanvasFormat('feed-quadrado');
    }
    if (preset.defaultContent.tema) {
      setCanvasTheme(preset.defaultContent.tema);
    } else {
      setCanvasTheme('campo-agro');
    }
  };

  // Auto-save to Google Drive in background for internal comparison
  const triggerDriveAutoSave = async (contentToSave: AgroPostContent) => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      setTimeout(async () => {
        try {
          const el = document.getElementById('agro-single-art-canvas');
          if (!el) return;
          const dataUrl = await toPng(el, { quality: 0.95, pixelRatio: 1.5 });
          const title =
            contentToSave.textos_da_arte?.titulo_impacto ||
            contentToSave.caixa_titulo?.texto ||
            'Campanha_Agro';
          await uploadToGoogleDrive({
            name: `Coagro_Agro_${title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`,
            mimeType: 'image/png',
            data: dataUrl,
            description: `Auto-salvo internamente para fins de comparação.\nLegenda: ${contentToSave.legenda_instagram || contentToSave.legenda_post || ''}`,
          });
          console.log('Design salvo automaticamente no Google Drive.');
        } catch (e) {
          console.warn('Auto-save interno no Drive:', e);
        }
      }, 1000);
    } catch {
      // Silent
    }
  };

  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setDownloadNotice(msg);
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  const handleDownloadCanvas = async (elementId: string, suffix: string) => {
    try {
      const el = document.getElementById(elementId);
      if (!el) {
        showNotice('⚠️ Elemento da arte não encontrado.');
        return;
      }
      showNotice('⏳ Gerando imagem...');
      const dataUrl = await toPng(el, { quality: 0.98, pixelRatio: 1.5 });
      const prefix = appMode === 'PET' ? 'coagro-pet' : 'coagro-agro';
      const filename = `${prefix}-${suffix}-${Date.now()}.png`;
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
      showNotice(`✅ Imagem salva em Downloads (${filename})`);
    } catch (err: any) {
      alert('Erro ao gerar imagem: ' + err.message);
    }
  };

  const handleDownloadPdf = async (elementId: string, suffix: string) => {
    try {
      const el = document.getElementById(elementId);
      if (!el) {
        showNotice('⚠️ Elemento da arte não encontrado.');
        return;
      }
      showNotice('⏳ Preparando arquivo PDF...');
      const dataUrl = await toJpeg(el, { quality: 0.9, pixelRatio: 1.5 });
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      pdf.addImage(dataUrl, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      const prefix = appMode === 'PET' ? 'coagro-pet' : 'coagro-agro';
      const filename = `${prefix}-${suffix}-${Date.now()}.pdf`;
      pdf.save(filename);
      showNotice(`✅ PDF salvo em Downloads (${filename})! Para imprimir direto, use o botão "Imprimir".`);
    } catch (err: any) {
      alert('Erro ao gerar PDF: ' + err.message);
    }
  };

  const handlePrintCanvas = async (elementId: string) => {
    try {
      const el = document.getElementById(elementId);
      if (!el) {
        showNotice('⚠️ Elemento da arte não encontrado para impressão.');
        return;
      }
      showNotice('🖨️ Abrindo diálogo de impressão...');
      const dataUrl = await toPng(el, { quality: 0.98, pixelRatio: 2 });
      
      // Iframe invisível para disparar impressão nativa - 100% imune a bloqueador de pop-ups
      let iframe = document.getElementById('coagro-print-frame') as HTMLIFrameElement | null;
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'coagro-print-frame';
        iframe.style.position = 'fixed';
        iframe.style.top = '-10000px';
        iframe.style.left = '-10000px';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
      }

      const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!frameDoc || !iframe.contentWindow) {
        alert('Não foi possível acessar a janela de impressão nativa.');
        return;
      }

      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Imprimir Cartaz - Grupo Coagro</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 0;
              }
              html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                background: #ffffff;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              img {
                width: 100vw;
                height: 100vh;
                object-fit: contain;
                page-break-after: avoid;
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" />
          </body>
        </html>
      `);
      frameDoc.close();

      const img = frameDoc.querySelector('img');
      const triggerPrint = () => {
        setTimeout(() => {
          iframe?.contentWindow?.focus();
          iframe?.contentWindow?.print();
        }, 150);
      };

      if (img && !img.complete) {
        img.onload = triggerPrint;
      } else {
        triggerPrint();
      }
    } catch (err: any) {
      alert('Erro ao preparar impressão: ' + (err?.message || err));
    }
  };

  // Content Generation API Call - Tratado estritamente como nova instância isolada
  const handleGenerateContent = async (params: {
    imageBase64?: string;
    mimeType?: string;
    prompt?: string;
    format: 'feed' | 'story';
    templateLayout?: TemplateLayout;
    isManualTemplate?: boolean;
    communicationMode?: CommunicationMode;
    communicationSelection?: 'AUTO' | 'PROMOTION' | 'SINGLE_PRICE' | 'INFORMATIVE';
    targetFocus?: string;
    priceInfo?: {
      ativo: boolean;
      valor_de: string;
      valor_por: string;
      condicoes_pagamento?: string;
    };
    isNewImage?: boolean;
  }) => {
    try {
      setIsGenerating(true);

      // Limpeza ativa de contexto anterior para garantir nova instância limpa
      if (params.isNewImage) {
        setBackgroundImage(undefined);
      }

      // Constrói payload limpo sem resquícios de estados ou imagens anteriores
      const payload = {
        imageBase64: params.imageBase64,
        mimeType: params.mimeType || 'image/jpeg',
        prompt: params.prompt?.trim() || undefined,
        format: params.format,
        templateLayout: params.templateLayout,
        isManualTemplate: Boolean(params.isManualTemplate ?? templateWasManuallySelected),
        communicationMode: params.communicationMode,
        communicationSelection: params.communicationSelection,
        targetFocus: params.targetFocus,
        appMode: appMode,
        priceInfo: params.priceInfo?.ativo
          ? {
              ativo: true,
              valor_de: params.priceInfo.valor_de || '',
              valor_por: params.priceInfo.valor_por || '',
              condicoes_pagamento: params.priceInfo.condicoes_pagamento || '',
            }
          : undefined,
        isNewImage: Boolean(params.isNewImage),
      };

      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Erro ao processar dados.');
      }

      const generatedData: AgroPostContent = json.data;
      setCurrentContent(generatedData);

      const generatedIsStory =
        generatedData.formato_gerado?.toLowerCase() === 'story' ||
        generatedData.formato?.toLowerCase() === 'story';

      // A recomendação inteligente da IA define o melhor layout para o item (ex: split para máquinas)
      let resolvedLayout = generatedData.template_layout;
      if (!resolvedLayout && !templateWasManuallySelected) {
        resolvedLayout = generatedIsStory ? resolveDefaultTemplate('story') : resolveDefaultTemplate('feed-quadrado');
      }

      // Se o App estiver em modo PET, mapear para templates PET (PetCentral ou PetSplitVertical)
      if (appMode === 'PET' && resolvedLayout) {
        if (resolvedLayout.includes('split')) {
          resolvedLayout = 'pet-split-vertical';
        } else {
          resolvedLayout = 'pet-central';
        }
      }

      if (resolvedLayout) {
        setTemplateLayout(resolvedLayout);
        setTemplateWasManuallySelected(false);
      }

      // Adjust format automatically
      if (
        generatedData.formato_gerado?.toLowerCase() === 'story' ||
        generatedData.formato?.toLowerCase() === 'story'
      ) {
        setCanvasFormat('story');
      } else {
        setCanvasFormat('feed-quadrado');
      }

      // Automatically apply inferred theme and photographic background from backend
      if (generatedData.tema) {
        setCanvasTheme(generatedData.tema);
      }

      if (generatedData.fundo_imagem_url) {
        setBackgroundImage(generatedData.fundo_imagem_url);
      } else if (
        generatedData.fundo_imagem &&
        (generatedData.fundo_imagem.startsWith('http') || generatedData.fundo_imagem.startsWith('data:'))
      ) {
        setBackgroundImage(generatedData.fundo_imagem);
      } else {
        setBackgroundImage(undefined);
      }

      // Trigger background auto-save to Google Drive
      triggerDriveAutoSave(generatedData);
    } catch (err: any) {
      console.error('Erro na geração:', err);
      alert('Erro ao gerar conteúdo AGRO: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentTitle =
    currentContent.textos_hero?.titulo ||
    currentContent.textos_da_arte?.titulo_impacto ||
    '';
  const titleCharCount = currentTitle.trim().length;
  const isTitleIdeal = titleCharCount > 0 && titleCharCount <= 28;
  const isTitleWarning = titleCharCount > 28 && titleCharCount <= 35;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] flex flex-col font-['Inter']">
      {/* 1. Header with Global Coagro Logo and Mode Toggle */}
      <Header />

      {/* 2. Module Switcher Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setCurrentModule('SOCIAL_MEDIA')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  currentModule === 'SOCIAL_MEDIA'
                    ? 'border-[#004d40] text-[#004d40]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Redes Sociais (Feed/Story)
              </button>
              <button
                onClick={() => setCurrentModule('STORE_POSTERS')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  currentModule === 'STORE_POSTERS'
                    ? 'border-[#d67022] text-[#d67022]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Box className="w-4 h-4" />
                Cartazes de Loja (A4)
              </button>
              <button
                onClick={() => setCurrentModule('BRAND_HUB')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  currentModule === 'BRAND_HUB'
                    ? 'border-[#004d40] text-[#004d40] font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#ffab00]" />
                Brand Hub & Documentos
              </button>
            </nav>
          </div>
        </div>

      {/* 3. Main Workspace */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {currentModule === 'SOCIAL_MEDIA' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Input and Processing Engine Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* AI Mode Hidden for MVP */}
            {false && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 flex items-center justify-center gap-2">
                <button 
                  onClick={() => {
                    setSocialMode('MANUAL');
                    setTemplateLayout('unified-central');
                  }}
                  className={`flex-1 py-2 text-sm font-bold rounded-xl transition ${socialMode === 'MANUAL' ? (appMode === 'PET' ? 'bg-[#001C71] text-white' : 'bg-[#004d40] text-white') : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Criação Manual
                </button>
                <button 
                  onClick={() => setSocialMode('AI_BETA')}
                  className={`flex-1 py-2 text-sm font-bold rounded-xl transition flex items-center justify-center gap-2 ${socialMode === 'AI_BETA' ? (appMode === 'PET' ? 'bg-[#001C71] text-white' : 'bg-[#004d40] text-white') : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Gerar com IA
                  <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded uppercase">Beta</span>
                </button>
              </div>
            )}

            {socialMode === 'MANUAL' ? (
              <SocialManualEditor
                appMode={appMode}
                onAppModeChange={handleSetAppMode}
                templateLayout={templateLayout}
                onTemplateChange={handleSelectTemplate}
                format={canvasFormat}
                onFormatChange={handleSelectFormat}
                data={socialManualData}
                onChange={(newData) => {
                  setSocialManualData(newData);
                  if (newData.theme) {
                    setCanvasTheme(newData.theme as any);
                  }
                  setCurrentContent({
                    ...EMPTY_AGRO_CONTENT,
                    textos_hero: {
                      titulo: newData.titulo,
                      subtitulo: newData.subtitulo,
                      palavra_destaque_ouro: '',
                    },
                    textos_da_arte: {
                      titulo_impacto: newData.titulo,
                      subtitulo: newData.subtitulo,
                      palavra_destaque: '',
                      bullets_tecnicos: newData.diferenciais,
                      cta: newData.cta || '',
                    },
                    diferenciais_tecnicos: newData.diferenciais,
                    modulo_preco: {
                      ativo: Boolean(newData.valorPor),
                      valor_de: newData.valorDe,
                      valor_por: newData.valorPor,
                    },
                    fundo_imagem_url: newData.backgroundImageUrl || '',
                    fundo_imagem: newData.backgroundImageUrl || '',
                    fundo_cor_hex: newData.backgroundColorHex || '',
                    tipo_postagem: newData.valorPor ? 'promocao' : 'informativo',
                    fundo_texto: newData.textBackground,
                  });
                  if (newData.backgroundImageUrl) {
                    setBackgroundImage(newData.backgroundImageUrl);
                  } else {
                    setBackgroundImage(undefined);
                  }
                }}
                productImage={productImage}
                onSetProductImage={setProductImage}
              />
            ) : (
              <InputPanel
                appMode={appMode}
                onSetAppMode={handleSetAppMode}
                onGenerateContent={handleGenerateContent}
                onSelectPreset={handleSelectPreset}
                isGenerating={isGenerating}
                currentImage={productImage}
                onSetProductImage={(url) => setProductImage(url)}
                currentContent={currentContent}
                onUpdateContent={(updated) => setCurrentContent(updated)}
                selectedFormat={canvasFormat}
                onSelectFormat={handleSelectFormat}
                selectedTemplate={templateLayout}
                onSelectTemplate={handleSelectTemplate}
                imageBoxFormat={imageBoxFormat}
                onSelectImageBoxFormat={setImageBoxFormat}
              />
            )}

            {/* Quick Caption & Legend Preview (Official Instagram text) */}
            {(currentContent.legenda_instagram || currentContent.legenda_post) && (
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 font-exo2">
                    Legenda Oficial Gerada
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">Com hashtags técnicas</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-700 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap font-sans relative group">
                  {currentContent.legenda_instagram || currentContent.legenda_post}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const txt = currentContent.legenda_instagram || currentContent.legenda_post;
                    if (txt) navigator.clipboard.writeText(txt);
                  }}
                  className="w-full mt-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5 text-gray-600" />
                  <span>Copiar Legenda Oficial</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Automated Live HTML/CSS Renderer & Export Toolbar (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Export & Customization Toolbar */}
            <ExportToolbar
              content={currentContent}
              format={canvasFormat}
              onSetFormat={handleSelectFormat}
              theme={canvasTheme}
              onSetTheme={setCanvasTheme}
              templateLayout={templateLayout}
              onSetTemplateLayout={handleSelectTemplate}
              imageBoxFormat={imageBoxFormat}
              onSetImageBoxFormat={setImageBoxFormat}
              logoVariant={logoVariant}
              onSetLogoVariant={setLogoVariant}
              user={null}
              onPromptLogin={() => {}}
              targetElementId="agro-single-art-canvas"
              appMode={appMode}
            />

            {/* Live Canvas Box */}
            <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col items-center justify-center min-h-[520px]">
              <div className="hidden w-full flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#004d40]" />
                  <span className="font-exo2 font-bold text-sm text-gray-800">
                    Arte Final em Camadas (Renderizador Oficial)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {titleCharCount > 0 && (
                    <span
                      title="Limite ideal para redes sociais: até 28 caracteres garantem leitura rápida e impacto máximo em Stories e Feed"
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 transition-all ${
                        isTitleIdeal
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : isTitleWarning
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      <span>Título: {titleCharCount}/28 chars</span>
                      <span className="opacity-60">•</span>
                      <span>{isTitleIdeal ? 'Limite Ideal' : isTitleWarning ? 'Limite Recomendado' : 'Título Longo'}</span>
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-gray-500 hidden sm:inline">
                    Vetor Oficial Coagro • Cores da Marca
                  </span>
                </div>
              </div>

              {/* Automatic Photographic Background Prompt Notification Tag - Oculto no MVP */}
              {false && currentContent.fundo_imagem && (
                <div className="w-full mb-4 px-3.5 py-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-2.5 text-left">
                  <div className="p-1 rounded-md bg-[#004d40] text-[#ffab00] shrink-0 mt-0.5 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#004d40] font-exo2">
                        Fundo Fotográfico Otimizado (IA Aplicado):
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-700 leading-snug italic line-clamp-2 mt-0.5">
                      &ldquo;{currentContent.fundo_imagem}&rdquo;
                    </p>
                  </div>
                </div>
              )}

              {/* Render Single Art (Feed ou Story) */}
              <div className="flex flex-row flex-wrap justify-center gap-8 w-full mt-4">
                <div className={`flex flex-col items-center gap-3 shrink-0 w-full ${canvasFormat === 'story' ? 'max-w-[390px]' : canvasFormat === 'feed-retrato' ? 'max-w-[440px]' : 'max-w-[480px]'}`}>
                  <div className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider font-exo2 flex items-center gap-2">
                    <Maximize2 className="w-3.5 h-3.5 text-[#ffab00]" />
                    Modelo Visual Atual
                  </div>
                  <SingleArtRenderer
                    content={currentContent}
                    format={canvasFormat}
                    theme={canvasTheme}
                    templateLayout={templateLayout}
                    logoVariant={logoVariant}
                    productImage={productImage}
                    backgroundImage={backgroundImage}
                    containerId="agro-canvas-main"
                    imageBoxFormat={imageBoxFormat}
                    badgeText={socialManualData.badge !== 'Sem Selo' ? socialManualData.badge : undefined}
                    preserveProductBackground={socialManualData.preserveProductBackground}
                    scopeOverride={appMode}
                  />
                  <div className="flex w-full max-w-[390px] gap-2 mt-2">
                    <button
                      onClick={() => handleDownloadCanvas('agro-canvas-main', 'final')}
                      className={`flex-1 py-2.5 hover:opacity-90 text-white rounded-xl text-xs font-bold font-exo2 tracking-wide uppercase flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer ${appMode === 'PET' ? 'bg-[#001C71]' : 'bg-[#004d40]'}`}
                    >
                      <Download className="w-4 h-4 text-[#ffab00]" />
                      Baixar Imagem
                    </button>
                    <button
                      onClick={() => handlePrintCanvas('agro-canvas-main')}
                      className="px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-bold font-exo2 tracking-wide uppercase flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                      title="Imprimir arte diretamente em folha de papel"
                    >
                      <Printer className="w-4 h-4 text-white" />
                      Imprimir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        ) : currentModule === 'STORE_POSTERS' ? (
          /* STORE POSTERS MODULE */
          <div className="space-y-4">
            {/* Mode Switcher: Individual vs Lote vs Revisão */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-1.5 max-w-lg mx-auto flex flex-wrap items-center justify-center gap-2">
              <button 
                onClick={() => setPosterMode('MANUAL')}
                className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition ${posterMode === 'MANUAL' ? 'bg-[#004d40] text-white shadow-xs' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Individual (Manual)
              </button>
              <button 
                onClick={() => setPosterMode('BATCH')}
                className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition ${posterMode === 'BATCH' ? 'bg-[#004d40] text-white shadow-xs' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Lote (Simples)
              </button>
              {/* Correção/Revisão Hidden for MVP */}
              {false && (
                <button 
                  onClick={() => setPosterMode('REVIEW')}
                  className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition ${posterMode === 'REVIEW' ? 'bg-[#d67022] text-white shadow-xs' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Correção/Revisão
                </button>
              )}
            </div>

            {posterMode === 'REVIEW' ? (
              <BatchReviewGrid onStartExport={handleStartBatchFromGrid} scope={appMode} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-6">
                  {/* Template Selector */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Modelo Visual</span>
                    <div className="flex flex-col sm:flex-row items-stretch gap-2">
                      <button 
                        onClick={() => setPosterTemplate('promo-mono-a4')}
                        className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition border flex items-center justify-center gap-1.5 ${posterTemplate === 'promo-mono-a4' ? 'bg-black text-white border-black' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                        Econômico (P&B)
                      </button>
                      {appMode === 'AGRO' && (
                        <button 
                          onClick={() => setPosterTemplate('promo-agro-a4')}
                          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition border flex items-center justify-center gap-1.5 ${posterTemplate === 'promo-agro-a4' ? 'bg-[#004d40] text-white border-[#004d40]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-[#ffab00]" />
                          Tema Verde
                        </button>
                      )}
                      {appMode === 'PET' && (
                        <button 
                          onClick={() => setPosterTemplate('promo-pet-a4')}
                          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition border flex items-center justify-center gap-1.5 ${posterTemplate === 'promo-pet-a4' ? 'bg-[#004b87] text-white border-[#004b87]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-[#4897D0]" />
                          Tema Pet
                        </button>
                      )}
                      <button 
                        onClick={() => setPosterTemplate('promo-text-only')}
                        className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition border flex items-center justify-center gap-1.5 ${posterTemplate === 'promo-text-only' ? 'bg-[#0047b3] text-white border-[#0047b3]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-[#d67022]" />
                        Tema Azul
                      </button>
                    </div>
                  </div>

                  {/* Título Customizado (Palavra de Destaque) */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Título da Etiqueta</span>
                    <select
                      value={posterHeaderText}
                      onChange={(e) => setPosterHeaderText(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-800 bg-gray-50 focus:ring-[#004d40] focus:border-[#004d40] transition"
                    >
                      <option value="OFERTA">OFERTA</option>
                      <option value="LIQUIDAÇÃO">LIQUIDAÇÃO</option>
                      <option value="PROMOÇÃO">PROMOÇÃO</option>
                      <option value="SUPER PREÇO">SUPER PREÇO</option>
                      <option value="ESPECIAL">ESPECIAL</option>
                      <option value="NOVIDADE">NOVIDADE</option>
                      <option value="PREÇO BAIXO">PREÇO BAIXO</option>
                    </select>
                  </div>

                  {posterMode === 'BATCH' ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                      <h2 className="text-2xl font-bold text-gray-800 font-exo2 mb-2">Cartazes Físicos (Lote)</h2>
                      <p className="text-gray-500 text-sm mb-6">
                        Importe a planilha e o sistema renderizará automaticamente todas as etiquetas para impressão.
                      </p>
                      <ExcelBatchUploader onProcessBatch={(items, format) => handleStartBatch(items, format)} />
                    </div>
                  ) : (
                    <PosterManualEditor 
                      data={manualPosterData}
                      onChange={setManualPosterData}
                    />
                  )}
                </div>

                <div className="lg:col-span-5 flex flex-col items-center gap-3 w-full">
                  <div className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider font-exo2">
                    Preview do Cartaz (A4)
                  </div>
                  <SingleArtRenderer
                    content={{
                      ...EMPTY_AGRO_CONTENT,
                      linha: appMode,
                      textos_hero: { titulo: manualPosterData.titulo, palavra_destaque_ouro: '', subtitulo: '' },
                      modulo_preco: {
                        ativo: true,
                        valor_de: manualPosterData.valorDe,
                        valor_por: manualPosterData.valorPor,
                        condicoes_pagamento: ''
                      },
                      tipo_postagem: 'promocao'
                    }}
                    format="a4-retrato"
                    theme="azul-coagro"
                    templateLayout={posterTemplate}
                    imageBoxFormat="rectangular"
                    codigoProduto={manualPosterData.codigo}
                    containerId="preview-poster-a4"
                    badgeText={posterHeaderText}
                    scopeOverride={appMode}
                  />
                  
                  <div className="flex w-full max-w-[420px] gap-2 mt-2">
                    <button
                      onClick={() => handleDownloadCanvas('preview-poster-a4', 'cartaz-a4')}
                      className="flex-1 py-3 bg-[#d67022] hover:bg-[#b55b17] text-white rounded-xl text-xs sm:text-sm font-bold font-exo2 tracking-wide uppercase flex items-center justify-center gap-1 sm:gap-2 shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                      PNG
                    </button>
                    <button
                      onClick={() => handleDownloadPdf('preview-poster-a4', 'cartaz-a4')}
                      className="flex-1 py-3 bg-[#004d40] hover:bg-[#00382e] text-white rounded-xl text-xs sm:text-sm font-bold font-exo2 tracking-wide uppercase flex items-center justify-center gap-1 sm:gap-2 shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                      PDF
                    </button>
                    <button
                      onClick={() => handlePrintCanvas('preview-poster-a4')}
                      className="flex-1 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs sm:text-sm font-bold font-exo2 tracking-wide uppercase flex items-center justify-center gap-1 sm:gap-2 shadow-sm transition active:scale-95 cursor-pointer"
                      title="Imprimir cartaz diretamente em folha A4"
                    >
                      <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                      Imprimir
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* BRAND HUB & GOVERNANCE MODULE */
          <BrandHubModule scope={appMode} onShowNotice={showNotice} />
        )}
      </main>

      {/* 3. Modals */}
      {batchItemsToRender && (
        <BatchRendererModal
          items={batchItemsToRender}
          exportFormat={batchExportFormat}
          templateLayout={batchTemplateToRender}
          headerText={batchHeaderTextToRender}
          scope={appMode}
          onClose={() => setBatchItemsToRender(null)}
        />
      )}

      {/* 4. Notificação Toast de Download e Impressão */}
      {downloadNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#004d40] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#ffab00]/50 flex items-center gap-3 transition-all duration-300 pointer-events-none">
          <span className="font-exo2 font-bold text-xs sm:text-sm tracking-wide">{downloadNotice}</span>
        </div>
      )}
    </div>
  );
}
