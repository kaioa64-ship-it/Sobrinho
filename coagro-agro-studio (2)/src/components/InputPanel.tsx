import React, { useState, useEffect, useRef } from 'react';
import { AGRO_PRESETS } from '../data/agroPresets';
import { PresetProduct, AgroPostContent, TemplateLayout, CanvasFormat, EMPTY_AGRO_CONTENT, EMPTY_PET_CONTENT } from '../types/agro';
import {
  removeBackgroundWithAPI,
  processProductImage,
  refineCutoutWithPreset,
  removeWhiteBackground,
  MaskPreset,
} from '../lib/imageTransparency';
import { extractPriceFromText, parsePriceToFloat } from '../lib/priceParser';
import { formatBrlValue, formatBrlWithSymbol } from '../lib/priceFormatter';
import {
  Upload,
  Sparkles,
  RefreshCw,
  Tag,
  Check,
  X,
  FileText,
  Columns2,
  Columns,
  Maximize2,
  Wand2,
  Info,
  Edit3,
  Sliders,
  DollarSign,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Box,
  Loader2,
  Layers,
  Scissors
} from 'lucide-react';
import { resolveCommunicationMode, CommunicationMode } from '../lib/communicationMode';
import { resolveDefaultCta } from '../lib/contentNormalizer';

import { CONTENT_LIMITS } from '../lib/layoutRules';

interface InputPanelProps {
  appMode: 'AGRO' | 'PET';
  onSetAppMode: (mode: 'AGRO' | 'PET') => void;
  onGenerateContent: (params: {
    imageBase64?: string;
    mimeType?: string;
    prompt?: string;
    format: 'feed' | 'story';
    templateLayout?: TemplateLayout;
    isManualTemplate?: boolean;
    communicationMode?: CommunicationMode;
    communicationSelection?:
      | 'AUTO'
      | 'PROMOTION'
      | 'SINGLE_PRICE'
      | 'INFORMATIVE';
    targetFocus?: string;
    priceInfo?: {
      ativo: boolean;
      valor_de: string;
      valor_por: string;
      condicoes_pagamento?: string;
    };
    isNewImage?: boolean;
  }) => Promise<void>;
  onSelectPreset: (preset: PresetProduct) => void;
  isGenerating: boolean;
  currentImage?: string;
  onSetProductImage: (url: string) => void;
  currentContent: AgroPostContent;
  onUpdateContent?: (content: AgroPostContent) => void;
  selectedFormat: CanvasFormat;
  onSelectFormat: (format: CanvasFormat) => void;
  selectedTemplate: TemplateLayout;
  onSelectTemplate: (template: TemplateLayout) => void;
  imageBoxFormat?: 'rectangular' | 'square';
  onSelectImageBoxFormat?: (format: 'rectangular' | 'square') => void;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  appMode,
  onSetAppMode,
  onGenerateContent,
  onSelectPreset,
  isGenerating,
  currentImage,
  onSetProductImage,
  currentContent,
  onUpdateContent,
  selectedFormat,
  onSelectFormat,
  selectedTemplate,
  onSelectTemplate,
  imageBoxFormat = 'rectangular',
  onSelectImageBoxFormat,
}) => {
  const [userCommand, setUserCommand] = useState('');
  const [showPriceFields, setShowPriceFields] = useState(false);
  const [valorDe, setValorDe] = useState('');
  const [valorPor, setValorPor] = useState('');
  const [condicoesPagamento, setCondicoesPagamento] = useState('');
  const [previousTitle, setPreviousTitle] = useState<string | null>(null);

  const [autoRemoveBg, setAutoRemoveBg] = useState(true);
  const [maskPreset, setMaskPreset] = useState<MaskPreset>('standard');
  const [cachedRawCutout, setCachedRawCutout] = useState<string | null>(null);
  const [cachedOriginalImage, setCachedOriginalImage] = useState<string | null>(null);
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [bgProcessingStage, setBgProcessingStage] = useState<string>('');
  const [bgProgressPercent, setBgProgressPercent] = useState<number>(0);
  const [imageUploadedAlert, setImageUploadedAlert] = useState(false);

  // Painel de Edição Direta dos Campos Pré-Renderizados (Tempo Real)
  const [isLiveEditorOpen, setIsLiveEditorOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sincroniza campos de preço locais com o conteúdo gerado
  useEffect(() => {
    const preco = currentContent.modulo_preco || currentContent.textos_da_arte?.modulo_preco;
    if (preco && preco.ativo && preco.valor_por) {
      setValorPor(preco.valor_por);
      if (preco.valor_de) setValorDe(preco.valor_de);
      if (preco.condicao || preco.condicoes_pagamento) {
        setCondicoesPagamento(preco.condicao || preco.condicoes_pagamento || '');
      }
      setShowPriceFields(true);
    } else {
      setValorPor('');
      setValorDe('');
      setCondicoesPagamento('');
      setShowPriceFields(false);
    }
  }, [currentContent]);

  // Detecção inteligente em tempo real de preços no texto da descrição
  const detectedPrices = React.useMemo(() => {
    return extractPriceFromText(userCommand);
  }, [userCommand]);

  // Detecção em tempo real de intenção (Promoção vs Informativo/Novidade)
  const isPromotionIntent = Boolean(
    valorPor.trim() ||
      detectedPrices.hasPrice ||
      (userCommand &&
        (userCommand.toLowerCase().includes('r$') ||
          userCommand.toLowerCase().includes('por') ||
          userCommand.toLowerCase().includes('de ') ||
          /\b\d+[,.]\d{2}\b/.test(userCommand) ||
          userCommand.toLowerCase().includes('promoção') ||
          userCommand.toLowerCase().includes('oferta') ||
          userCommand.toLowerCase().includes('preço')))
  );

  // Upload de Imagem: Interface Otimista (Heurística instantânea + WASM em Background)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const rawBase64 = event.target?.result as string;
        setCachedOriginalImage(rawBase64);
        setCachedRawCutout(null);

        // Roda apenas a heurística leve e instantânea ao anexar
        setIsProcessingBg(true);
        setBgProcessingStage('Recorte Rápido...');
        setBgProgressPercent(50);
        
        try {
          const instantCutout = await removeWhiteBackground(rawBase64);
          onSetProductImage(instantCutout);
        } catch (err) {
          onSetProductImage(rawBase64);
        } finally {
          setIsProcessingBg(false);
          setBgProcessingStage('');
          setBgProgressPercent(0);
        }

        setImageUploadedAlert(true);
        setTimeout(() => setImageUploadedAlert(false), 4000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    onSetProductImage('');
    setCachedRawCutout(null);
    setCachedOriginalImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStripBackgroundNow = async () => {
    const sourceImg = cachedOriginalImage || currentImage;
    if (!sourceImg) return;
    
    // Mostra o feedback de que o modelo WASM está rodando sob demanda
    setIsProcessingBg(true);
    setBgProcessingStage('Carregando IA Neural (WASM)...');
    setBgProgressPercent(10);
    
    try {
      const result = await processProductImage(
        sourceImg,
        maskPreset,
        (stage, percent) => {
          setBgProcessingStage(stage);
          if (percent) setBgProgressPercent(percent);
        }
      );
      setCachedRawCutout(result.rawCutoutUrl);
      onSetProductImage(result.finalUrl);
    } catch (e) {
      console.warn('Erro ao remover fundo com WASM:', e);
    } finally {
      setIsProcessingBg(false);
      setBgProcessingStage('');
      setBgProgressPercent(0);
    }
  };

  // Alternância ultrarrápida de preset (<50ms via Canvas sobre o recorte bruto em cache)
  const handlePresetChange = async (newPreset: MaskPreset) => {
    setMaskPreset(newPreset);
    if (cachedRawCutout) {
      setIsProcessingBg(true);
      setBgProcessingStage('Ajustando máscara e bordas...');
      setBgProgressPercent(85);
      try {
        const refined = await refineCutoutWithPreset(cachedRawCutout, newPreset);
        onSetProductImage(refined);
      } catch (err) {
        console.warn('Erro ao aplicar preset de máscara:', err);
      } finally {
        setIsProcessingBg(false);
        setBgProcessingStage('');
        setBgProgressPercent(0);
      }
    } else if (cachedOriginalImage || currentImage) {
      handleStripBackgroundNow();
    }
  };

  const handleToggleAutoRemove = async (checked: boolean) => {
    setAutoRemoveBg(checked);
    if (!checked) {
      if (cachedOriginalImage) {
        onSetProductImage(cachedOriginalImage);
      }
    } else {
      if (cachedRawCutout) {
        setIsProcessingBg(true);
        const refined = await refineCutoutWithPreset(cachedRawCutout, maskPreset);
        onSetProductImage(refined);
        setIsProcessingBg(false);
      } else if (cachedOriginalImage || currentImage) {
        handleStripBackgroundNow();
      }
    }
  };

  // Disparo manual explícito de geração de arte e legenda
  const handleExecuteGenerate = () => {
    if (!userCommand.trim()) {
      alert('Para gerar a arte, é obrigatório digitar a descrição.');
      return;
    }

    let finalDe = valorDe.trim();
    let finalPor = valorPor.trim();
    let finalCond = condicoesPagamento.trim();

    // Se o usuário não digitou nos campos manuais, mas digitou o preço na descrição:
    if (!finalPor && detectedPrices.hasPrice && detectedPrices.valorPor) {
      finalPor = detectedPrices.valorPor;
      if (!finalDe && detectedPrices.valorDe) finalDe = detectedPrices.valorDe;
      if (!finalCond && detectedPrices.condicoes) finalCond = detectedPrices.condicoes;

      // Sincroniza visualmente os campos para o usuário acompanhar
      setValorPor(finalPor);
      if (finalDe) setValorDe(finalDe);
      if (finalCond) setCondicoesPagamento(finalCond);
      setShowPriceFields(true);
    }

    // Regra Mestre: Se existirem 2 valores, o maior é SEMPRE "DE" e o menor é SEMPRE "POR"
    if (finalDe && finalPor) {
      const fDe = parsePriceToFloat(finalDe);
      const fPor = parsePriceToFloat(finalPor);
      if (fDe > 0 && fPor > 0 && fPor > fDe) {
        const tmp = finalDe;
        finalDe = finalPor;
        finalPor = tmp;
        setValorDe(finalDe);
        setValorPor(finalPor);
      }
    }

    const hasPrice = Boolean(finalPor);
    const priceInfo = hasPrice
      ? {
          ativo: true,
          valor_de: finalDe,
          valor_por: finalPor,
          condicoes_pagamento: finalCond || undefined,
        }
      : undefined;

    // Resolução de modo e seleção para o backend (Correção 4)
    const currentPriceObj = currentContent.modulo_preco || currentContent.textos_da_arte?.modulo_preco;
    const resolvedMode = resolveCommunicationMode(currentContent.tipo_postagem, currentPriceObj);
    const commSelection: 'AUTO' | 'PROMOTION' | 'SINGLE_PRICE' | 'INFORMATIVE' =
      currentContent.tipo_postagem === undefined
        ? 'AUTO'
        : resolvedMode;

    const executeWithImage = async () => {
      let finalBase64 = currentImage;
      if (currentImage && !currentImage.startsWith('data:')) {
        try {
          const response = await fetch(currentImage);
          const blob = await response.blob();
          finalBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch {
          finalBase64 = currentImage;
        }
      }

      onGenerateContent({
        imageBase64: finalBase64,
        prompt: userCommand.trim(),
        format: selectedFormat === 'story' ? 'story' : 'feed',
        templateLayout: selectedTemplate,
        isManualTemplate: false,
        communicationMode: resolvedMode,
        communicationSelection: commSelection,
        priceInfo,
        isNewImage: false,
      });
    };

    executeWithImage();
  };

  const handleQuickExample = (preset: PresetProduct) => {
    onSelectPreset(preset);
    if (preset.defaultContent.template_layout) {
      onSelectTemplate(preset.defaultContent.template_layout);
    }
    if (preset.defaultContent.modulo_preco?.ativo) {
      setUserCommand(
        `Promoção ${preset.name} por ${preset.defaultContent.modulo_preco.valor_por}`
      );
      setValorDe(preset.defaultContent.modulo_preco.valor_de || '');
      setValorPor(preset.defaultContent.modulo_preco.valor_por || '');
      setCondicoesPagamento(preset.defaultContent.modulo_preco.condicoes_pagamento || '');
      setShowPriceFields(true);
    } else {
      setUserCommand(`Chegou na Coagro: ${preset.name}. Garanta o manejo do seu rebanho.`);
      setValorDe('');
      setValorPor('');
      setCondicoesPagamento('');
      setShowPriceFields(false);
    }
  };

  // Funções de Edição Direta em Tempo Real (Live Editing)
  const updateCurrentArt = (updater: (prev: AgroPostContent) => AgroPostContent) => {
    if (onUpdateContent) {
      const updated = updater({ ...currentContent });
      onUpdateContent(updated);
    }
  };

  const currentPreco = currentContent.modulo_preco || currentContent.textos_da_arte?.modulo_preco;
  const isPrecoAtivo = Boolean(currentPreco?.ativo && currentPreco?.valor_por);
  const currentMode = resolveCommunicationMode(currentContent.tipo_postagem, currentPreco);
  const isExplicitAuto = currentContent.tipo_postagem === undefined;

  // 4 Opções de Seleção de Modo (Correção 2 & 3)
  const handleLiveCommunicationModeChange = (mode: 'auto' | 'promocao' | 'preco-unico' | 'informativo') => {
    updateCurrentArt((prev) => {
      const oldPreco = prev.modulo_preco || prev.textos_da_arte?.modulo_preco || { ativo: false, valor_de: '', valor_por: '' };
      let newPreco = { ...oldPreco };
      let nextPostType: string | undefined;
      let effectiveMode: CommunicationMode;

      if (mode === 'auto') {
        nextPostType = undefined;
        effectiveMode = resolveCommunicationMode(undefined, newPreco);
      } else if (mode === 'promocao') {
        nextPostType = 'promocao';
        effectiveMode = 'PROMOTION';
        newPreco = {
          ...oldPreco,
          ativo: true,
          valor_por: oldPreco.valor_por || valorPor || '',
          valor_de: oldPreco.valor_de || valorDe || '',
        };
      } else if (mode === 'preco-unico') {
        nextPostType = 'preco-unico';
        effectiveMode = 'SINGLE_PRICE';
        newPreco = {
          ...oldPreco,
          ativo: true,
          valor_por: oldPreco.valor_por || valorPor || '',
          valor_de: '', // Preço único não mostra DE! (RF-01, RF-06)
        };
      } else {
        // informativo
        nextPostType = 'informativo';
        effectiveMode = 'INFORMATIVE';
        newPreco = {
          ...oldPreco,
          ativo: false,
        };
      }

      const defaultCta = resolveDefaultCta(
        effectiveMode,
        prev.categoria_produto
      );

      return {
        ...prev,
        tipo_postagem: nextPostType,
        modulo_preco: newPreco,
        textos_da_arte: {
          ...prev.textos_da_arte,
          titulo_impacto:
            prev.textos_da_arte?.titulo_impacto ||
            prev.textos_hero?.titulo ||
            '',
          palavra_destaque:
            prev.textos_da_arte?.palavra_destaque ||
            prev.textos_hero?.palavra_destaque_ouro ||
            '',
          subtitulo:
            prev.textos_da_arte?.subtitulo ||
            prev.textos_hero?.subtitulo ||
            '',
          bullets_tecnicos:
            prev.textos_da_arte?.bullets_tecnicos ||
            prev.diferenciais_tecnicos ||
            [],
          cta: defaultCta,
          modulo_preco: newPreco,
        },
      };
    });
  };

  // Preservação do modo anterior no toggle de preço (Correção 5)
  const handleLivePriceToggle = (ativo: boolean) => {
    updateCurrentArt((prev) => {
      const oldPreco = prev.modulo_preco || prev.textos_da_arte?.modulo_preco || { ativo: false, valor_de: '', valor_por: '' };
      const previousMode = resolveCommunicationMode(
        prev.tipo_postagem,
        oldPreco
      );

      const nextPostType = !ativo
        ? 'informativo'
        : previousMode === 'SINGLE_PRICE'
        ? 'preco-unico'
        : 'promocao';

      const newPreco = {
        ...oldPreco,
        ativo,
        valor_por: oldPreco.valor_por || valorPor || '',
        valor_de: nextPostType === 'preco-unico' ? '' : (oldPreco.valor_de || valorDe || ''),
        condicao: oldPreco.condicao || condicoesPagamento || '',
        condicoes_pagamento: oldPreco.condicoes_pagamento || condicoesPagamento || '',
      };

      return {
        ...prev,
        modulo_preco: newPreco,
        tipo_postagem: nextPostType,
        textos_da_arte: {
          ...prev.textos_da_arte,
          titulo_impacto: prev.textos_da_arte?.titulo_impacto || prev.textos_hero?.titulo || '',
          palavra_destaque: prev.textos_da_arte?.palavra_destaque || prev.textos_hero?.palavra_destaque_ouro || '',
          subtitulo: prev.textos_da_arte?.subtitulo || prev.textos_hero?.subtitulo || '',
          bullets_tecnicos: prev.textos_da_arte?.bullets_tecnicos || prev.diferenciais_tecnicos || [],
          cta: prev.textos_da_arte?.cta || (ativo ? 'GARANTA JÁ O SEU' : 'SAIBA MAIS'),
          modulo_preco: newPreco,
        },
      };
    });
  };

  // Preservação do modo manual ao editar preços (Correção 1)
  const handleLivePriceChange = (
    field: 'valor_de' | 'valor_por' | 'condicoes_pagamento',
    value: string
  ) => {
    updateCurrentArt((prev) => {
      const oldPrice =
        prev.modulo_preco ||
        prev.textos_da_arte?.modulo_preco || {
          ativo: true,
          valor_de: '',
          valor_por: '',
          condicoes_pagamento: '',
        };

      const resolvedMode = resolveCommunicationMode(
        prev.tipo_postagem,
        oldPrice
      );

      const updatedPrice = {
        ...oldPrice,
        ativo: resolvedMode !== 'INFORMATIVE',
        [field]: value,
        ...(field === 'condicoes_pagamento'
          ? { condicao: value }
          : {}),
        ...(resolvedMode === 'SINGLE_PRICE'
          ? { valor_de: '' }
          : {}),
      };

      const preservedPostType =
        prev.tipo_postagem === undefined
          ? undefined
          : resolvedMode === 'PROMOTION'
          ? 'promocao'
          : resolvedMode === 'SINGLE_PRICE'
          ? 'preco-unico'
          : 'informativo';

      return {
        ...prev,
        tipo_postagem: preservedPostType,
        modulo_preco: updatedPrice,
        textos_da_arte: {
          ...prev.textos_da_arte,
          titulo_impacto:
            prev.textos_da_arte?.titulo_impacto ||
            prev.textos_hero?.titulo ||
            '',
          palavra_destaque:
            prev.textos_da_arte?.palavra_destaque ||
            prev.textos_hero?.palavra_destaque_ouro ||
            '',
          subtitulo:
            prev.textos_da_arte?.subtitulo ||
            prev.textos_hero?.subtitulo ||
            '',
          bullets_tecnicos:
            prev.textos_da_arte?.bullets_tecnicos ||
            prev.diferenciais_tecnicos ||
            [],
          cta:
            prev.textos_da_arte?.cta ||
            resolveDefaultCta(
              resolvedMode,
              prev.categoria_produto
            ),
          modulo_preco: updatedPrice,
        },
      };
    });
  };

  const handleLiveTitleChange = (newTitle: string) => {
    updateCurrentArt((prev) => ({
      ...prev,
      textos_hero: {
        ...prev.textos_hero,
        titulo: newTitle,
        palavra_destaque_ouro: prev.textos_hero?.palavra_destaque_ouro || '',
        subtitulo: prev.textos_hero?.subtitulo || '',
      },
      textos_da_arte: {
        ...prev.textos_da_arte,
        titulo_impacto: newTitle,
        palavra_destaque: prev.textos_da_arte?.palavra_destaque || '',
        subtitulo: prev.textos_da_arte?.subtitulo || '',
        bullets_tecnicos: prev.textos_da_arte?.bullets_tecnicos || [],
        cta: prev.textos_da_arte?.cta || '',
      },
      caixa_titulo: {
        ...prev.caixa_titulo,
        texto: newTitle,
        palavra_ouro: prev.caixa_titulo?.palavra_ouro || '',
      },
    }));
  };

  const handleLiveGoldenWordChange = (word: string) => {
    updateCurrentArt((prev) => ({
      ...prev,
      textos_hero: {
        ...prev.textos_hero,
        titulo: prev.textos_hero?.titulo || '',
        palavra_destaque_ouro: word,
        subtitulo: prev.textos_hero?.subtitulo || '',
      },
      textos_da_arte: {
        ...prev.textos_da_arte,
        titulo_impacto: prev.textos_da_arte?.titulo_impacto || '',
        palavra_destaque: word,
        subtitulo: prev.textos_da_arte?.subtitulo || '',
        bullets_tecnicos: prev.textos_da_arte?.bullets_tecnicos || [],
        cta: prev.textos_da_arte?.cta || '',
      },
      caixa_titulo: {
        ...prev.caixa_titulo,
        texto: prev.caixa_titulo?.texto || '',
        palavra_ouro: word,
      },
    }));
  };

  const handleLiveSubtitleChange = (newSub: string) => {
    updateCurrentArt((prev) => ({
      ...prev,
      textos_hero: {
        ...prev.textos_hero,
        titulo: prev.textos_hero?.titulo || '',
        palavra_destaque_ouro: prev.textos_hero?.palavra_destaque_ouro || '',
        subtitulo: newSub,
      },
      textos_da_arte: {
        ...prev.textos_da_arte,
        titulo_impacto: prev.textos_da_arte?.titulo_impacto || '',
        palavra_destaque: prev.textos_da_arte?.palavra_destaque || '',
        subtitulo: newSub,
        bullets_tecnicos: prev.textos_da_arte?.bullets_tecnicos || [],
        cta: prev.textos_da_arte?.cta || '',
      },
      caixa_subtitulo: {
        ...prev.caixa_subtitulo,
        texto: newSub,
      },
    }));
  };

  const handleLiveBulletChange = (index: number, val: string) => {
    updateCurrentArt((prev) => {
      const currentBullets = [
        ...(prev.diferenciais_tecnicos || prev.textos_da_arte?.bullets_tecnicos || prev.beneficios_tecnicos || []),
      ];
      while (currentBullets.length < 3) currentBullets.push('');
      currentBullets[index] = val;

      return {
        ...prev,
        diferenciais_tecnicos: currentBullets,
        beneficios_tecnicos: currentBullets,
        textos_da_arte: {
          ...prev.textos_da_arte,
          titulo_impacto: prev.textos_da_arte?.titulo_impacto || '',
          palavra_destaque: prev.textos_da_arte?.palavra_destaque || '',
          subtitulo: prev.textos_da_arte?.subtitulo || '',
          bullets_tecnicos: currentBullets,
          cta: prev.textos_da_arte?.cta || '',
        },
      };
    });
  };

  const handleLiveCtaChange = (newCta: string) => {
    updateCurrentArt((prev) => ({
      ...prev,
      textos_da_arte: {
        ...prev.textos_da_arte,
        titulo_impacto: prev.textos_da_arte?.titulo_impacto || '',
        palavra_destaque: prev.textos_da_arte?.palavra_destaque || '',
        subtitulo: prev.textos_da_arte?.subtitulo || '',
        bullets_tecnicos: prev.textos_da_arte?.bullets_tecnicos || [],
        cta: newCta,
      },
    }));
  };

  // Valores atuais renderizados para visualização no editor
  const rawTitulo = currentContent.textos_hero?.titulo || currentContent.textos_da_arte?.titulo_impacto || '';
  const renderedTitulo = typeof rawTitulo === 'string' ? rawTitulo : String(rawTitulo || '');
  
  const rawPalavraOuro = currentContent.textos_hero?.palavra_destaque_ouro || currentContent.textos_da_arte?.palavra_destaque || '';
  const renderedPalavraOuro = typeof rawPalavraOuro === 'string' ? rawPalavraOuro : String(rawPalavraOuro || '');
  
  const rawSubtitulo = currentContent.textos_hero?.subtitulo || currentContent.textos_da_arte?.subtitulo || '';
  const renderedSubtitulo = typeof rawSubtitulo === 'string' ? rawSubtitulo : String(rawSubtitulo || '');
  
  const rawBullets = currentContent.diferenciais_tecnicos || currentContent.textos_da_arte?.bullets_tecnicos || [];
  const renderedBullets = Array.isArray(rawBullets) ? rawBullets.map(b => String(b || '')) : typeof rawBullets === 'string' ? [rawBullets] : [];
  
  const rawCta = currentContent.textos_da_arte?.cta || '';
  const renderedCta = typeof rawCta === 'string' ? rawCta : String(rawCta || '');

  // Métricas e Alerta do Limite Ideal do Título para Redes Sociais
  const titleCharCount = renderedTitulo.trim().length;
  const titleWordsCount = renderedTitulo.trim() ? renderedTitulo.trim().split(/\s+/).filter(Boolean).length : 0;
  const IDEAL_TITLE_CHARS = 28; // Limite recomendado para stories (1080x1920) e feed (1:1 / 4:5)
  const MAX_RECOMMENDED_CHARS = 35; // Acima de 35 caracteres, o impacto visual cai e o risco de corte aumenta

  const titleStatus: 'ideal' | 'warning' | 'danger' =
    titleCharCount === 0 || titleCharCount <= IDEAL_TITLE_CHARS
      ? 'ideal'
      : titleCharCount <= MAX_RECOMMENDED_CHARS
      ? 'warning'
      : 'danger';

  // Verifica se a arte já foi gerada com sucesso
  const isGenerated = Boolean(currentContent.textos_da_arte?.titulo_impacto || currentContent.textos_hero?.titulo);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col font-['Inter']">
      <div className="p-5 sm:p-6 space-y-6">
        {!isGenerated && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

        {/* =============================================================== */}
        {/* PARTE 1: FOTO & DESCRIÇÃO DO PRODUTO (O que estamos criando)   */}
        {/* =============================================================== */}

        {/* 1. Foto do Produto / Insumo */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 font-exo2 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#004d40] text-white flex items-center justify-center text-[10px] font-black">
                1
              </span>
              <span>Foto do Produto / Insumo</span>
            </label>
            <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded-md">
              Otimizado
            </span>
          </div>

          {currentImage ? (
            <div className="relative rounded-xl border-2 border-emerald-500/30 bg-emerald-50/20 p-3 space-y-2.5 shadow-2xs">
              <div className="flex items-center gap-3">
                {/* Checkerboard backdrop para demonstrar transparência */}
                <div
                  className="w-18 h-18 rounded-lg overflow-hidden shadow-xs border border-gray-200 shrink-0 flex items-center justify-center p-1 relative"
                  style={{
                    backgroundImage: `linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)`,
                    backgroundSize: '12px 12px',
                    backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <img
                    src={currentImage}
                    alt="Produto Selecionado"
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-contain filter drop-shadow-xs transition-opacity duration-300 ${isProcessingBg ? 'opacity-30' : 'opacity-100'}`}
                  />
                  {isProcessingBg && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                      <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {isProcessingBg ? (
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-emerald-700 font-exo2 flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        <span>{bgProcessingStage || 'Recortando...'}</span>
                      </p>
                      <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(15, bgProgressPercent)}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-gray-500">
                        Pode levar alguns segundos...
                      </p>
                    </div>
                  ) : cachedRawCutout ? (
                    <div>
                      <p className="text-xs font-bold text-emerald-700 font-exo2 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Recorte IA Aplicado!</span>
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                        Modelo neural aplicado com sucesso.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-gray-700 font-exo2">
                        Recorte Rápido Aplicado
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">
                        Este é o recorte simples (instantâneo). Se o fundo não ficou perfeito, aprimore abaixo.
                      </p>
                      <button
                        type="button"
                        onClick={handleStripBackgroundNow}
                        disabled={isProcessingBg}
                        className="mt-2 w-full flex justify-center items-center gap-1.5 px-3 py-1.5 bg-[#004d40] text-white rounded-md text-[10px] font-bold shadow-sm hover:bg-[#00382e] transition cursor-pointer"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>Aprimorar Recorte com IA (Melhor, + lento)</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1.5 bg-white border border-gray-300 hover:border-gray-400 rounded-lg text-xs font-semibold text-gray-700 shadow-2xs transition cursor-pointer"
                  >
                    Trocar
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    title="Remover imagem"
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 3. Presets de Refinamento de Máscara (Abas Rápidas) só exibidas quando IA rodou */}
              {cachedRawCutout && (
                <div className="pt-2 border-t border-emerald-500/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-[#004d40]" />
                      <span>Sintonia Fina da IA:</span>
                    </span>
                    <span className="text-[9px] text-gray-500 font-medium">
                      {maskPreset === 'standard' && 'Padrão (Equilibrado / Gôndola)'}
                      {maskPreset === 'aggressive' && 'Agressivo (Bordas Rígidas / Sacarias)'}
                      {maskPreset === 'details' && 'Detalhes (Vazados / Arames / Grades)'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePresetChange('standard')}
                      disabled={isProcessingBg}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer border ${
                        maskPreset === 'standard'
                          ? 'bg-[#004d40] text-white border-[#004d40] shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                      title="Equilibrado: Limpeza padrão de ruídos de fundo de gôndola"
                    >
                      <span>Padrão</span>
                      <span className={`text-[8px] font-normal ${maskPreset === 'standard' ? 'text-emerald-100' : 'text-gray-400'}`}>
                        Equilibrado
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePresetChange('aggressive')}
                      disabled={isProcessingBg}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer border ${
                        maskPreset === 'aggressive'
                          ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                      title="Agressivo: Corte severo para sacos de ração, caixas e produtos onde a prateleira colou"
                    >
                      <span>Agressivo</span>
                      <span className={`text-[8px] font-normal ${maskPreset === 'aggressive' ? 'text-amber-100' : 'text-gray-400'}`}>
                        Sacos / Caixas
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePresetChange('details')}
                      disabled={isProcessingBg}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer border ${
                        maskPreset === 'details'
                          ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                      title="Detalhes/Vazados: Preserva aberturas internas (arames, trituradores, grades e motores)"
                    >
                      <span>Detalhes</span>
                      <span className={`text-[8px] font-normal ${maskPreset === 'details' ? 'text-blue-100' : 'text-gray-400'}`}>
                        Arames / Grades
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-[#004d40] rounded-xl p-5 text-center cursor-pointer transition bg-gray-50/60 hover:bg-gray-50 flex flex-col items-center justify-center gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100/80 text-[#004d40] flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800 font-exo2">
                  Enviar foto do insumo, defensivo, vacina ou maquinário
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Clique ou arraste a imagem. Você poderá digitar o preço e a descrição com calma antes de gerar.
                </p>
              </div>
            </div>
          )}

          {imageUploadedAlert && (
            <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-800 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Foto carregada! Digite a descrição e clique em <strong>Gerar Arte & Legenda</strong> quando estiver pronto.</span>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Exemplos Rápidos com 1 Clique e Botão de Limpar Tudo */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-gray-400 font-medium">Exemplos rápidos:</span>
              {AGRO_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleQuickExample(p)}
                  className="text-[10px] px-2 py-1 rounded-md bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-600 border border-gray-200 transition cursor-pointer"
                >
                  {p.category}: {p.name.split(' ')[0]}
                </button>
              ))}
            </div>

            {(Boolean(currentImage) || Boolean(userCommand) || Boolean(renderedTitulo) || isPrecoAtivo) && (
              <button
                type="button"
                onClick={() => {
                  onSetProductImage('');
                  setUserCommand('');
                  setValorDe('');
                  setValorPor('');
                  setCondicoesPagamento('');
                  setShowPriceFields(false);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                  if (onUpdateContent) {
                    onUpdateContent(appMode === 'PET' ? EMPTY_PET_CONTENT : EMPTY_AGRO_CONTENT);
                  }
                }}
                className="text-[10px] px-2 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition cursor-pointer flex items-center gap-1"
                title="Limpar todos os campos e voltar ao estado inicial zerado"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Zerar Tudo</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Descrição / Comando com Detecção Automática de Linguagem & Preço */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 font-exo2 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#004d40] text-white flex items-center justify-center text-[10px] font-black">
                2
              </span>
              <span>Descrição / Comando da Peça</span>
            </label>

            {/* Badge Dinâmico de Detecção Automática de Oferta */}
            {isPromotionIntent ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                <Tag className="w-3 h-3 text-[#ffab00]" />
                <span>Oferta com Preço</span>
              </span>
            ) : userCommand.trim().length > 3 ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                <Info className="w-3 h-3 text-[#001C71]" />
                <span>Informativo / Novidade</span>
              </span>
            ) : null}
          </div>

          <textarea
            rows={2}
            value={userCommand}
            onChange={(e) => setUserCommand(e.target.value)}
            placeholder="Ex: Forrageira TRF 300 Trapp de R$ 3.890 por R$ 3.190 em até 10x sem juros (ou qualquer descrição com preço e condições)"
            className="w-full text-xs p-3 rounded-xl border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004d40] focus:border-transparent transition shadow-2xs resize-none"
          />

          {/* Destaque Inteligente quando a IA detecta preços no texto */}
          {detectedPrices.hasPrice && (
            <div className="mt-1.5 p-2.5 bg-amber-50/90 rounded-xl border border-amber-300 flex items-center justify-between">
              <div className="text-[11px] text-amber-950 flex items-center gap-1.5 flex-wrap">
                <span className="font-bold flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                  {detectedPrices.valorDe ? 'Promoção identificada:' : 'Preço identificado:'}
                </span>
                {detectedPrices.valorDe && (
                  <span className="text-gray-600 font-medium">
                    <span className="text-[10px] uppercase font-bold text-gray-500 mr-1">Mais Alto (DE):</span>
                    <span className="line-through">R$ {detectedPrices.valorDe}</span>
                  </span>
                )}
                <span className="font-black text-[#004d40] bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  {detectedPrices.valorDe ? 'MAIS BAIXO (POR):' : 'POR:'} R$ {detectedPrices.valorPor}
                </span>
                {detectedPrices.condicoes && (
                  <span className="text-[10px] font-bold text-amber-900 bg-white px-1.5 py-0.5 rounded border border-amber-200">
                    {detectedPrices.condicoes}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (detectedPrices.valorDe) setValorDe(detectedPrices.valorDe);
                  if (detectedPrices.valorPor) setValorPor(detectedPrices.valorPor);
                  if (detectedPrices.condicoes) setCondicoesPagamento(detectedPrices.condicoes);
                  setShowPriceFields(true);
                }}
                className="text-[10px] font-bold text-[#004d40] hover:text-[#00796b] underline ml-2 shrink-0 cursor-pointer"
              >
                Ajustar campos manuais
              </button>
            </div>
          )}

          {/* Campos Opcionais de Preço De / Por */}
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setShowPriceFields(!showPriceFields)}
              className="text-[11px] text-[#004d40] hover:text-[#00796b] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Tag className="w-3 h-3 text-[#ffab00]" />
              <span>{showPriceFields ? 'Ocultar campos manuais de preço' : '+ Ajustar valores De / Por / Condições manualmente'}</span>
            </button>

            {showPriceFields && (
              <div className="space-y-2 mt-2 p-2.5 bg-amber-50/50 rounded-xl border border-amber-200/80">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                      Valor De (Mais Alto):
                    </label>
                    <input
                      type="text"
                      value={valorDe}
                      onChange={(e) => setValorDe(e.target.value)}
                      placeholder="Ex: 3.890,00"
                      className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#ffab00]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                      Valor Por (Mais Baixo):
                    </label>
                    <input
                      type="text"
                      value={valorPor}
                      onChange={(e) => setValorPor(e.target.value)}
                      placeholder="Ex: 3.190,00"
                      className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white text-gray-800 font-bold focus:outline-none focus:ring-1 focus:ring-[#ffab00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                    Condição de Pagamento (opcional):
                  </label>
                  <input
                    type="text"
                    value={condicoesPagamento}
                    onChange={(e) => setCondicoesPagamento(e.target.value)}
                    placeholder="Ex: À VISTA ou EM ATÉ 10X SEM JUROS"
                    className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#ffab00]"
                  />
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    Se preenchido, será exibido abaixo do preço. Se deixado vazio, nenhum texto financeiro será inventado.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Requisitos Obrigatórios: Foto + Descrição para Liberação da Geração */}
          <div className="pt-3 space-y-2">
            <div className="p-2 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  currentImage ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {currentImage ? '✓' : '1'}
                </span>
                <span className={currentImage ? 'text-emerald-800 font-semibold' : 'text-gray-500'}>
                  {currentImage ? 'Foto do Produto pronta' : '1. Envie a foto do produto'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  userCommand.trim() ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {userCommand.trim() ? '✓' : '2'}
                </span>
                <span className={userCommand.trim() ? 'text-emerald-800 font-semibold' : 'text-gray-500'}>
                  {userCommand.trim() ? 'Descrição preenchida' : '2. Digite a descrição'}
                </span>
              </div>
            </div>

            {/* Botão Principal de Geração IA (Bloqueado até que a descrição esteja presente) */}
            <button
              type="button"
              onClick={handleExecuteGenerate}
              disabled={isGenerating || !userCommand.trim()}
              className={`w-full py-3.5 px-4 rounded-xl font-exo2 font-black text-sm tracking-wider uppercase transition flex items-center justify-center gap-2 border shadow-md ${
                !userCommand.trim()
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : appMode === 'PET' 
                    ? 'bg-gradient-to-r from-[#4897D0] via-[#4897D0] to-[#3A7AA8] text-white hover:shadow-lg hover:brightness-105 active:scale-[0.99] border-blue-500/30 cursor-pointer'
                    : 'bg-gradient-to-r from-[#004d40] via-[#004d40] to-[#00695c] text-white hover:shadow-lg hover:brightness-105 active:scale-[0.99] border-emerald-500/30 cursor-pointer'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#ffab00]" />
                  <span>Analisando e gerando arte...</span>
                </>
              ) : !userCommand.trim() ? (
                <>
                  <Edit3 className="w-4 h-4 text-amber-600" />
                  <span>Digite a descrição para poder gerar</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>{appMode === 'PET' ? 'Gerar Arte Pet com IA' : 'Gerar Arte & Legenda com IA'}</span>
                </>
              )}
            </button>
          </div>
        </div>
        </div>
        )}

        {isGenerated && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
               <div>
                 <h3 className="text-sm font-bold text-gray-800 font-exo2 flex items-center gap-1.5">
                   <CheckCircle2 className="w-4 h-4 text-[#004d40]" />
                   Arte Gerada com Sucesso
                 </h3>
                 <p className="text-[10px] text-gray-500 mt-0.5">Use os controles abaixo para ajustes finos.</p>
               </div>
               <button
                 type="button"
                 onClick={() => {
                   onSetProductImage('');
                   setUserCommand('');
                   setValorDe('');
                   setValorPor('');
                   setCondicoesPagamento('');
                   setShowPriceFields(false);
                   if (fileInputRef.current) fileInputRef.current.value = '';
                   if (onUpdateContent) onUpdateContent(appMode === 'PET' ? EMPTY_PET_CONTENT : EMPTY_AGRO_CONTENT);
                 }}
                 className="text-[10px] px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-700 font-bold border border-gray-200 hover:border-rose-200 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
               >
                 <RefreshCw className="w-3 h-3" />
                 Nova Arte
               </button>
            </div>

        {/* =============================================================== */}
        {/* PARTE 4 (MOVIDA): MATRIZ DE DIAGRAMAÇÃO & TEMPLATE (Ajustes de Layout)   */}
        {/* =============================================================== */}
        <div className="pt-2 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 font-exo2 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#004d40] text-white flex items-center justify-center text-[10px] font-black">
                1
              </span>
              <span>Formato & Template</span>
            </label>
          </div>

          {/* Proporção (Formato da Peça: 1:1, 4:5, 9:16) - Oculto no MVP */}
          <div className="hidden">
            <span className="block text-[11px] font-semibold text-gray-700 mb-1.5">
              Proporção da Arte:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled
                className="py-2 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition opacity-50 cursor-not-allowed border-gray-200 text-gray-600 bg-gray-50"
                title="Em breve"
              >
                <div className="w-3.5 h-3.5 border-2 border-current rounded-xs shrink-0" />
                <span className="truncate">1:1 (Feed)</span>
                <span className="text-[10px] ml-1">🔒</span>
              </button>

              <button
                type="button"
                disabled
                className="py-2 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition opacity-50 cursor-not-allowed border-gray-200 text-gray-600 bg-gray-50"
                title="Em breve"
              >
                <div className="w-3 h-4 border-2 border-current rounded-xs shrink-0" />
                <span className="truncate">4:5 (Retrato)</span>
                <span className="text-[10px] ml-1">🔒</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectFormat('story')}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  selectedFormat === 'story'
                    ? 'border-[#004d40] bg-[#004d40]/10 text-[#004d40] ring-2 ring-[#004d40]/20 font-bold shadow-xs'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="w-2.5 h-4 border-2 border-current rounded-xs shrink-0" />
                <span>9:16 (Story)</span>
              </button>
            </div>
          </div>

          {/* Matriz de Diagramação (Split Vertical vs Hero Central vs Pet Central) */}
          <div>
            <div className="grid grid-cols-3 gap-2.5">
              {appMode === 'AGRO' && (
                <>
                  {/* Template 1: Split Vertical */}
                  <button
                    type="button"
                    onClick={() => onSelectTemplate('split-vertical')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      selectedTemplate === 'split-vertical'
                        ? 'border-[#004d40] bg-[#004d40]/5 ring-2 ring-[#004d40]/20 shadow-xs'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-exo2 font-bold text-xs text-gray-900 flex items-center gap-1.5">
                        <Columns2 className="w-3.5 h-3.5 text-[#004d40]" />
                        Split Vertical
                      </span>
                      {selectedTemplate === 'split-vertical' && (
                        <span className="w-2 h-2 rounded-full bg-[#004d40]" />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Produto à esquerda
                    </p>
                  </button>

                  {/* Template 2: Hero Central */}
                  <button
                    type="button"
                    onClick={() => onSelectTemplate('hero-central')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      selectedTemplate === 'hero-central'
                        ? 'border-[#004d40] bg-[#004d40]/5 ring-2 ring-[#004d40]/20 shadow-xs'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-exo2 font-bold text-xs text-gray-900 flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5 text-[#ffab00]" />
                        Hero Central
                      </span>
                      {selectedTemplate === 'hero-central' && (
                        <span className="w-2 h-2 rounded-full bg-[#ffab00]" />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Produto centralizado
                    </p>
                  </button>
                </>
              )}

              {appMode === 'PET' && (
                <>
                  {/* Template 3: Pet Central */}
                  <button
                    type="button"
                    onClick={() => onSelectTemplate('pet-central')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      selectedTemplate === 'pet-central'
                        ? 'border-[#4897D0] bg-[#4897D0]/5 ring-2 ring-[#4897D0]/20 shadow-xs'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-exo2 font-bold text-xs text-gray-900 flex items-center gap-1.5">
                        <Wand2 className="w-3.5 h-3.5 text-[#4897D0]" />
                        Pet Central
                      </span>
                      {selectedTemplate === 'pet-central' && (
                        <span className="w-2 h-2 rounded-full bg-[#4897D0]" />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Padrão Coagro Pet
                    </p>
                  </button>

                  {/* Template 4: Pet Split */}
                  <button
                    type="button"
                    onClick={() => onSelectTemplate('pet-split')}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      selectedTemplate === 'pet-split'
                        ? 'border-[#4897D0] bg-[#4897D0]/5 ring-2 ring-[#4897D0]/20 shadow-xs'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-exo2 font-bold text-xs text-gray-900 flex items-center gap-1.5">
                        <Columns className="w-3.5 h-3.5 text-[#4897D0]" />
                        Pet Split
                      </span>
                      {selectedTemplate === 'pet-split' && (
                        <span className="w-2 h-2 rounded-full bg-[#4897D0]" />
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Produto à esquerda
                    </p>
                  </button>
                </>
              )}
            </div>

            {/* Seletor dinâmico de Bounding Box para Hero Central (Resolução Base 1080x1920) */}
            {selectedTemplate === 'hero-central' && onSelectImageBoxFormat && (
              <div className="mt-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-800 font-exo2 flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-[#004d40]" />
                    <span>Zona de Segurança da Imagem (Bounding Box)</span>
                  </span>
                  <span className="text-[9px] font-mono text-emerald-800 bg-emerald-100/70 px-1.5 py-0.5 rounded font-bold">
                    Story 1080x1920
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectImageBoxFormat('rectangular')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      imageBoxFormat === 'rectangular'
                        ? 'bg-[#004d40] text-white shadow-xs font-bold'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>Retangular (900x630)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectImageBoxFormat('square')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      imageBoxFormat === 'square'
                        ? 'bg-[#004d40] text-white shadow-xs font-bold'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>Quadrado (630x630)</span>
                  </button>
                </div>
                <p className="text-[9px] text-gray-500 leading-tight">
                  Contém estritamente o produto com <code>object-bottom</code> e garante que textos nunca sobreponham a imagem.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* =============================================================== */}
        {/* PARTE 2 (PÓS-GERAÇÃO): EDIÇÃO DIRETA DA ARTE (LIVE PREVIEW)      */}
        {/* =============================================================== */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsLiveEditorOpen(!isLiveEditorOpen)}
              className="text-xs font-bold uppercase tracking-wider text-gray-800 font-exo2 flex items-center gap-1.5 hover:text-[#004d40] transition cursor-pointer"
            >
              <span className="w-5 h-5 rounded-full bg-[#004d40] text-white flex items-center justify-center text-[10px] font-black">
                2
              </span>
              <span>Editar Textos Manualmente</span>
              {isLiveEditorOpen ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
            </button>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Live Preview
            </span>
          </div>

          {isLiveEditorOpen && (
            <div className="space-y-4 bg-gray-50/80 p-3.5 rounded-xl border border-gray-200/80">
              {/* 1. Módulo de Preço & Modo de Comunicação (RF-01, RF-02, RF-06) */}
              <details className="group p-3 bg-white rounded-lg border border-amber-200 shadow-2xs space-y-2.5 transition-all">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#ffab00]" />
                      Modo Comercial & Preço
                    </span>
                    <span className="text-[10px] font-bold text-[#001C71] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      {isExplicitAuto
                        ? `Auto: ${
                            currentMode === 'PROMOTION'
                              ? 'Promoção'
                              : currentMode === 'SINGLE_PRICE'
                              ? 'Preço Único'
                              : 'Informativo'
                          }`
                        : currentMode === 'PROMOTION'
                        ? 'Promoção'
                        : currentMode === 'SINGLE_PRICE'
                        ? 'Preço Único'
                        : 'Informativo'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-3 space-y-2.5">

                {/* 4 Opções de Seleção de Modo (Correção 3) */}
                <div className="grid grid-cols-4 gap-1 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleLiveCommunicationModeChange('auto')}
                    className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      isExplicitAuto
                        ? 'bg-purple-700 text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>⚡ Auto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLiveCommunicationModeChange('promocao')}
                    className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      !isExplicitAuto && currentMode === 'PROMOTION'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>🏷️ Promoção</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLiveCommunicationModeChange('preco-unico')}
                    className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      !isExplicitAuto && currentMode === 'SINGLE_PRICE'
                        ? 'bg-[#004d40] text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>💰 Preço Único</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLiveCommunicationModeChange('informativo')}
                    className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                      !isExplicitAuto && currentMode === 'INFORMATIVE'
                        ? 'bg-[#001C71] text-white shadow-2xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>📢 Informativo</span>
                  </button>
                </div>

                {currentMode === 'PROMOTION' && (
                  <div className="space-y-2 pt-1 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">
                          Valor DE (R$):
                        </label>
                        <input
                          type="text"
                          value={currentPreco?.valor_de || ''}
                          onChange={(e) => handleLivePriceChange('valor_de', e.target.value)}
                          placeholder="Ex: 3.890,00"
                          className="w-full text-xs p-1.5 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#ffab00]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                          Valor POR (R$):
                        </label>
                        <input
                          type="text"
                          value={currentPreco?.valor_por || ''}
                          onChange={(e) => handleLivePriceChange('valor_por', e.target.value)}
                          placeholder="Ex: 3.190,00"
                          className="w-full text-xs p-1.5 rounded-md border border-amber-400 bg-amber-50/50 text-gray-900 font-black focus:outline-none focus:ring-1 focus:ring-[#ffab00]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">
                        Condição de Pagamento (opcional):
                      </label>
                      <input
                        type="text"
                        value={currentPreco?.condicoes_pagamento || currentPreco?.condicao || ''}
                        onChange={(e) => handleLivePriceChange('condicoes_pagamento', e.target.value)}
                        placeholder="Ex: À VISTA ou EM ATÉ 10X SEM JUROS"
                        className="w-full text-xs p-1.5 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#ffab00]"
                      />
                    </div>
                  </div>
                )}

                {currentMode === 'SINGLE_PRICE' && (
                  <div className="space-y-2 pt-1 border-t border-gray-100">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                        Preço Vigente (R$):
                      </label>
                      <input
                        type="text"
                        value={currentPreco?.valor_por || ''}
                        onChange={(e) => handleLivePriceChange('valor_por', e.target.value)}
                        placeholder="Ex: 3.190,00"
                        className="w-full text-xs p-1.5 rounded-md border border-emerald-400 bg-emerald-50/40 text-gray-900 font-black focus:outline-none focus:ring-1 focus:ring-[#004d40]"
                      />
                      <p className="text-[9px] text-gray-500 mt-0.5">
                        Exibe apenas &quot;R$ valor&quot; sem &quot;DE/POR&quot; e sem linguagem de desconto.
                      </p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">
                        Condição de Pagamento (opcional):
                      </label>
                      <input
                        type="text"
                        value={currentPreco?.condicoes_pagamento || currentPreco?.condicao || ''}
                        onChange={(e) => handleLivePriceChange('condicoes_pagamento', e.target.value)}
                        placeholder="Ex: À VISTA ou EM ATÉ 10X SEM JUROS"
                        className="w-full text-xs p-1.5 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#004d40]"
                      />
                    </div>
                  </div>
                )}

                {currentMode === 'INFORMATIVE' && (
                  <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-200/80 text-[11px] text-blue-900 leading-snug">
                    <p className="font-semibold flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-[#001C71] shrink-0" />
                      <span>Modo Informativo Ativo</span>
                    </p>
                    <p className="text-[10px] text-blue-800/80 mt-1">
                      Nenhum cartão financeiro é renderizado na arte. O foco é a recomendação técnica, sanidade, manejo ou novidade.
                    </p>
                  </div>
                )}
                  </div>
              </details>

              {/* 2. Título de Impacto com Indicador Visual de Caracteres & Alerta de Limite Ideal */}
              <details className="group p-3 bg-white rounded-lg border border-gray-200 shadow-2xs space-y-3 transition-all" open>
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#ffab00]" />
                      Título de Impacto & Destaque
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Stories & Feed
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-3 space-y-3">

                <div>
                  {/* Cabeçalho do campo com Contador e Tag de Limite Ideal */}
                  <div className="flex items-center justify-between mb-1 gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                      <span>Título Principal:</span>
                      {titleWordsCount > 0 && (
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.2 rounded-md ${
                            titleWordsCount <= 4
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {titleWordsCount} {titleWordsCount === 1 ? 'palavra' : 'palavras'}
                          {titleWordsCount > 4 && ' (máx. 4)'}
                        </span>
                      )}
                    </label>

                    {/* Indicador Visual de Contagem de Caracteres e Status de Impacto */}
                    <div className="flex items-center gap-1 shrink-0">
                      {titleStatus === 'ideal' && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 stroke-[2.5]" />
                          <span>{titleCharCount}/{IDEAL_TITLE_CHARS} • Limite Ideal</span>
                        </span>
                      )}
                      {titleStatus === 'warning' && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                          <AlertTriangle className="w-2.5 h-2.5 text-amber-600 stroke-[2.5]" />
                          <span>{titleCharCount}/{IDEAL_TITLE_CHARS} • Limite Recomendado</span>
                        </span>
                      )}
                      {titleStatus === 'danger' && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs animate-pulse">
                          <AlertCircle className="w-2.5 h-2.5 text-rose-600 stroke-[2.5]" />
                          <span>{titleCharCount}/{IDEAL_TITLE_CHARS} • Acima do Ideal</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Input do Título com Borda Dinâmica baseada no Status */}
                  <div className="relative">
                    <input
                      type="text"
                      value={renderedTitulo}
                      onChange={(e) => handleLiveTitleChange(e.target.value)}
                      placeholder="Ex: FORRAGEIRA DE ALTA POTÊNCIA"
                      className={`w-full text-xs p-2 rounded-lg bg-white uppercase font-black transition-all shadow-2xs ${
                        titleStatus === 'ideal'
                          ? 'border border-gray-300 text-gray-800 focus:outline-none focus:border-[#004d40] focus:ring-2 focus:ring-[#004d40]/20'
                          : titleStatus === 'warning'
                          ? 'border border-amber-400 text-gray-900 bg-amber-50/15 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                          : 'border border-rose-400 text-gray-900 bg-rose-50/20 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      }`}
                    />
                  </div>

                  {/* Barra Visual de Progresso de Impacto para Redes Sociais */}
                  <div className="mt-1.5 space-y-1">
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden relative border border-gray-200/60">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          titleStatus === 'ideal'
                            ? 'bg-emerald-500'
                            : titleStatus === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, (titleCharCount / IDEAL_TITLE_CHARS) * 100)}%` }}
                      />
                    </div>

                    {/* Mensagem e Alerta de Impacto Recomendado para Redes Sociais */}
                    <div className="flex items-center justify-between text-[9px] pt-0.5">
                      {titleStatus === 'ideal' && (
                        <p className="text-emerald-700 font-medium flex items-center gap-1 leading-tight">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span><strong>Impacto excelente:</strong> leitura instantânea em Stories (1080x1920) e Feed.</span>
                        </p>
                      )}
                      {titleStatus === 'warning' && (
                        <p className="text-amber-800 font-medium flex items-center gap-1 leading-tight">
                          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                          <span><strong>Atenção:</strong> próximo do limite ({IDEAL_TITLE_CHARS} chars). Título pode quebrar em 2 linhas.</span>
                        </p>
                      )}
                      {titleStatus === 'danger' && (
                        <div className="w-full flex items-center justify-between gap-1 flex-wrap">
                          <p className="text-rose-700 font-medium flex items-center gap-1 leading-tight">
                            <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                            <span><strong>Alerta para redes:</strong> excedeu o limite ideal ({titleCharCount - IDEAL_TITLE_CHARS} chars a mais). Pode poluir a arte.</span>
                          </p>
                          <div className="flex items-center gap-1 ml-auto">
                            {previousTitle && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleLiveTitleChange(previousTitle);
                                  setPreviousTitle(null);
                                }}
                                className="text-[9px] font-bold text-gray-600 hover:text-gray-900 underline shrink-0 cursor-pointer"
                              >
                                Desfazer redução
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const words = renderedTitulo.trim().split(/\s+/);
                                let newTitle = '';
                                for (const w of words) {
                                  if ((newTitle + (newTitle ? ' ' : '') + w).length <= IDEAL_TITLE_CHARS) {
                                    newTitle += (newTitle ? ' ' : '') + w;
                                  } else {
                                    break;
                                  }
                                }
                                setPreviousTitle(renderedTitulo);
                                const finalReduced = newTitle || renderedTitulo.slice(0, IDEAL_TITLE_CHARS).trim();
                                handleLiveTitleChange(finalReduced);

                                // Se a palavra-ouro não estiver mais no título reduzido, reseta para não quebrar a marcação (Correção 11)
                                const reducedWords = finalReduced.toUpperCase().split(/\s+/).map((w) => w.replace(/[.,!?:;]/g, ''));
                                if (renderedPalavraOuro && !reducedWords.includes(renderedPalavraOuro.toUpperCase())) {
                                  handleLiveGoldenWordChange('');
                                }
                              }}
                              className="text-[9px] font-bold text-rose-700 hover:text-rose-900 underline shrink-0 cursor-pointer"
                            >
                              Reduzir para o limite
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Palavra Destaque em Ouro */}
                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-[10px] font-semibold text-gray-600 mb-1.5">
                    Palavra Destaque ({appMode === 'PET' ? 'Laranja Pet' : 'Ouro Agro'}):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {renderedTitulo ? (
                      renderedTitulo.split(/\s+/).filter(Boolean).map((word, index) => {
                        const cleanWord = word.replace(/[.,!?:;]/g, '');
                        const isSelected = renderedPalavraOuro?.toUpperCase() === cleanWord.toUpperCase() || renderedPalavraOuro?.toUpperCase() === word.toUpperCase();
                        return (
                          <button
                            key={`${word}-${index}`}
                            type="button"
                            onClick={() => handleLiveGoldenWordChange(isSelected ? '' : cleanWord)}
                            className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                              isSelected
                                ? appMode === 'PET'
                                  ? 'bg-[#E96C2C] text-white border border-[#E96C2C]'
                                  : 'bg-[#ffab00] text-gray-900 border border-[#ffab00]'
                                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {cleanWord}
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-[10px] text-gray-400 italic">Digite um título para selecionar o destaque.</p>
                    )}
                  </div>
                  <p className="text-[9px] text-gray-400 mt-1">
                    Selecione uma palavra do título para receber a cor de destaque da marca.
                  </p>
                </div>
              </div>
              </details>

              {/* 3. Subtítulo Técnico com Alerta de Limite */}
              <details className="group p-3 bg-white rounded-lg border border-gray-200 shadow-2xs space-y-1 transition-all">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-800">
                      Subtítulo / Descrição de Função
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderedSubtitulo.length > CONTENT_LIMITS.subtitle.maxCharacters && (
                      <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                        {renderedSubtitulo.length}/{CONTENT_LIMITS.subtitle.maxCharacters} chars
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" />
                  </div>
                </summary>
                <div className="mt-3 space-y-1">
                  <input
                    type="text"
                    value={renderedSubtitulo}
                    onChange={(e) => handleLiveSubtitleChange(e.target.value)}
                    placeholder="Ex: Rotor balanceado para silagem uniforme e corte de alta precisão."
                    className="w-full text-xs p-1.5 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#004d40]"
                  />
                </div>
              </details>

              {/* 4. Diferenciais Técnicos (3 Bullets) com Alerta de Limite */}
              <details className="group p-3 bg-white rounded-lg border border-gray-200 shadow-2xs space-y-2 transition-all">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-gray-800 block">
                      3 Diferenciais Técnicos
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderedBullets.some((b) => (b || '').length > CONTENT_LIMITS.benefit.maxCharacters) && (
                      <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                        Item &gt; {CONTENT_LIMITS.benefit.maxCharacters} chars
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" />
                  </div>
                </summary>
                <div className="mt-3 space-y-2">
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-[#004d40] w-4 text-center">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={renderedBullets[idx] || ''}
                        onChange={(e) => handleLiveBulletChange(idx, e.target.value)}
                        placeholder={`Diferencial ${idx + 1}`}
                        className="w-full text-xs p-1.5 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#004d40]"
                      />
                    </div>
                  ))}
                </div>
              </details>

              {/* 5. Botão CTA com Alerta de Limite */}
              <details className="group p-3 bg-white rounded-lg border border-gray-200 shadow-2xs space-y-1 transition-all">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <div className="flex items-center gap-2">
                    <label className="block text-[11px] font-bold text-gray-800">
                      Texto do Botão CTA
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    {renderedCta.length > CONTENT_LIMITS.cta.maxCharacters && (
                      <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                        {renderedCta.length}/{CONTENT_LIMITS.cta.maxCharacters} chars
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" />
                  </div>
                </summary>
                <div className="mt-3 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {['Chama no WhatsApp', 'Vem conferir na loja', 'Vem para a Coagro', 'Garanta já o seu'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleLiveCtaChange(preset.toUpperCase())}
                        className="py-1 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] rounded-full border border-gray-200 transition cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={renderedCta}
                    onChange={(e) => handleLiveCtaChange(e.target.value.toUpperCase())}
                    placeholder="Ex: GARANTA JÁ O SEU"
                    className="w-full text-xs p-1.5 rounded-md border border-gray-300 bg-white text-gray-800 uppercase font-black focus:outline-none focus:ring-1 focus:ring-[#ffab00]"
                  />
                </div>
              </details>
            </div>
          )}
        </div>

          </div>
        )}
      </div>
    </div>
  );
};
