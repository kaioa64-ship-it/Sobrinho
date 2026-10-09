import React, { useState, useEffect, useRef } from 'react';
import { PresetProduct, AgroPostContent, TemplateLayout, CanvasFormat, EMPTY_AGRO_CONTENT, EMPTY_PET_CONTENT } from '../types/agro';
import {
  processProductImage,
  refineCutoutWithPreset,
  removeWhiteBackground,
  MaskPreset,
} from '../lib/imageTransparency';
import { extractPriceFromText, parsePriceToFloat } from '../lib/priceParser';
import { formatBrlValue, formatBrlWithSymbol } from '../lib/priceFormatter';
import {
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import { resolveCommunicationMode, CommunicationMode } from '../lib/communicationMode';
import { resolveDefaultCta } from '../lib/contentNormalizer';

import { CONTENT_LIMITS } from '../lib/layoutRules';
import { TemplateMatrixSection } from './input-panel/TemplateMatrixSection';
import { ProductPhotoSection } from './input-panel/ProductPhotoSection';
import { ProductDescriptionSection } from './input-panel/ProductDescriptionSection';
import { LivePriceSection } from './input-panel/LivePriceSection';
import { LiveTextFieldsSection } from './input-panel/LiveTextFieldsSection';
import { LiveTitleSection } from './input-panel/LiveTitleSection';

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

  // Verifica se a arte já foi gerada com sucesso
  const isGenerated = Boolean(currentContent.textos_da_arte?.titulo_impacto || currentContent.textos_hero?.titulo);

  // Reset geral do painel. Movido do JSX do antigo bloco de foto para cá:
  // quem é dono do estado é este componente, não a seção de apresentação.
  const handleResetAll = () => {
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
  };

  const showResetButton =
    Boolean(currentImage) || Boolean(userCommand) || Boolean(renderedTitulo) || isPrecoAtivo;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col font-['Inter']">
      <div className="p-5 sm:p-6 space-y-6">
        {!isGenerated && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

        {/* =============================================================== */}
        {/* PARTE 1: FOTO & DESCRIÇÃO DO PRODUTO (O que estamos criando)   */}
        {/* =============================================================== */}

        <ProductPhotoSection
          currentImage={currentImage}
          isProcessingBg={isProcessingBg}
          bgProcessingStage={bgProcessingStage}
          bgProgressPercent={bgProgressPercent}
          cachedRawCutout={cachedRawCutout}
          maskPreset={maskPreset}
          imageUploadedAlert={imageUploadedAlert}
          fileInputRef={fileInputRef}
          showResetButton={showResetButton}
          onFileUpload={handleFileUpload}
          onRemoveImage={handleRemoveImage}
          onStripBackgroundNow={handleStripBackgroundNow}
          onPresetChange={handlePresetChange}
          onQuickExample={handleQuickExample}
          onResetAll={handleResetAll}
        />

        <ProductDescriptionSection
          appMode={appMode}
          userCommand={userCommand}
          onUserCommandChange={setUserCommand}
          detectedPrices={detectedPrices}
          isPromotionIntent={isPromotionIntent}
          currentImage={currentImage}
          showPriceFields={showPriceFields}
          onPriceFieldsVisibilityChange={setShowPriceFields}
          valorDe={valorDe}
          onValorDeChange={setValorDe}
          valorPor={valorPor}
          onValorPorChange={setValorPor}
          condicoesPagamento={condicoesPagamento}
          onCondicoesChange={setCondicoesPagamento}
          isGenerating={isGenerating}
          onGenerate={handleExecuteGenerate}
        />
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
                 onClick={handleResetAll}
                 className="text-[10px] px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-700 font-bold border border-gray-200 hover:border-rose-200 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
               >
                 <RefreshCw className="w-3 h-3" />
                 Nova Arte
               </button>
            </div>

        <TemplateMatrixSection
          appMode={appMode}
          selectedFormat={selectedFormat}
          onSelectFormat={onSelectFormat}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={onSelectTemplate}
          imageBoxFormat={imageBoxFormat}
          onSelectImageBoxFormat={onSelectImageBoxFormat}
        />

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
              <LivePriceSection
                isExplicitAuto={isExplicitAuto}
                currentMode={currentMode}
                onModeChange={handleLiveCommunicationModeChange}
                currentPreco={currentPreco}
                onPriceChange={handleLivePriceChange}
              />

              <LiveTitleSection
                appMode={appMode}
                renderedTitulo={renderedTitulo}
                onTitleChange={handleLiveTitleChange}
                renderedPalavraOuro={renderedPalavraOuro}
                onGoldenWordChange={handleLiveGoldenWordChange}
                previousTitle={previousTitle}
                onPreviousTitleChange={setPreviousTitle}
              />

              <LiveTextFieldsSection
                renderedSubtitulo={renderedSubtitulo}
                onSubtitleChange={handleLiveSubtitleChange}
                renderedBullets={renderedBullets}
                onBulletChange={handleLiveBulletChange}
                renderedCta={renderedCta}
                onCtaChange={handleLiveCtaChange}
              />
            </div>
          )}
        </div>

          </div>
        )}
      </div>
    </div>
  );
};
