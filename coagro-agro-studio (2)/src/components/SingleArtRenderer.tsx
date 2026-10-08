import React, { useEffect, useState } from 'react';
import { AgroPostContent, CanvasFormat, CanvasTheme, TemplateLayout } from '../types/agro';
import { LogoVariant } from '../assets/coagroLogos';
import { PULVERIZADOR_XP16_SVG } from '../assets/productPackshots';
import { removeWhiteBackground } from '../lib/imageTransparency';
import { formatBrlValue, formatBrlWithSymbol } from '../lib/priceFormatter';
import { resolveCommunicationMode } from '../lib/communicationMode';
import { cleanNoise, normalizeBenefits, resolveDefaultCta } from '../lib/contentNormalizer';
import { resolveBackgroundFromPrompt } from '../lib/backgroundResolver';
import { processAdaptiveProduct, AdaptiveProductInfo } from '../lib/alphaBounds';
import { getPalette } from '../lib/brand.config';
import { BackgroundLayer } from './art-renderer/BackgroundLayer';
import { HeroCentral } from './art-renderer/templates/HeroCentral';
import { SplitVertical } from './art-renderer/templates/SplitVertical';
import { PetCentral } from './art-renderer/templates/PetCentral';
import { PetSplitVertical } from './art-renderer/templates/PetSplitVertical';
import { CanvasEmptyState } from './art-renderer/CanvasEmptyState';
import { PromoTextOnly } from './art-renderer/templates/PromoTextOnly';
import { PromoAgroA4 } from './art-renderer/templates/PromoAgroA4';
import { PromoMonoA4 } from './art-renderer/templates/PromoMonoA4';
import { UnifiedCentral } from './art-renderer/templates/UnifiedCentral';
import { UnifiedSplit } from './art-renderer/templates/UnifiedSplit';
import { UnifiedCentralWithMascot } from './art-renderer/templates/UnifiedCentralWithMascot';
import { UnifiedSplitWithMascot } from './art-renderer/templates/UnifiedSplitWithMascot';
import { InformativeCentral } from './art-renderer/templates/InformativeCentral';
import { InformativeSplit } from './art-renderer/templates/InformativeSplit';
import { PromoSimples } from './art-renderer/templates/PromoSimples';

interface SingleArtRendererProps {
  content: AgroPostContent;
  format: CanvasFormat;
  theme: CanvasTheme;
  templateLayout?: TemplateLayout;
  logoVariant?: LogoVariant;
  productImage?: string;
  backgroundImage?: string;
  badgeText?: string;
  containerId?: string;
  imageBoxFormat?: 'rectangular' | 'square';
  codigoProduto?: string;
  preserveProductBackground?: boolean;
  scopeOverride?: 'AGRO' | 'PET'; // Modo manual: força a marca vinda do appMode
}

export const SingleArtRenderer: React.FC<SingleArtRendererProps> = ({
  content,
  format,
  theme,
  templateLayout,
  logoVariant,
  productImage,
  backgroundImage,
  containerId = 'agro-single-art-canvas',
  imageBoxFormat,
  codigoProduto,
  badgeText,
  preserveProductBackground,
  scopeOverride,
}) => {
  const isStory = format === 'story';

  // 3. FALLBACK DE RENDERIZAÇÃO
  const [forceFallbackTemplate, setForceFallbackTemplate] = useState<string | null>(null);

  // Resolução determinística do Modo de Comunicação (RF-01, RF-02, RF-06)
  const price = content.modulo_preco || content.textos_da_arte?.modulo_preco;
  const mode = resolveCommunicationMode(content.tipo_postagem, price);
  const hasPrice = mode !== 'INFORMATIVE' && !!price?.valor_por;

  // No Story 9:16, Hero Central é o padrão recomendado (RF-03)
  const initialTemplate =
    forceFallbackTemplate ||
    templateLayout ||
    content.template_layout ||
    'promo-simples';

  // 4. AUTO-ROTEAMENTO (INFERÊNCIA DE TEMPLATE)
  let activeTemplate = initialTemplate;
  if (!hasPrice) {
    if (!activeTemplate.includes('informative')) {
      activeTemplate = activeTemplate.includes('split') ? 'informative-split' : 'informative-central';
    }
  }

  const isSplit = activeTemplate.toLowerCase().includes('split');

  // Normalização de textos com limpeza de ruídos - SEM valores pré-selecionados
  const rawTitle =
    content.textos_hero?.titulo ||
    content.textos_da_arte?.titulo_impacto ||
    content.caixa_titulo?.texto ||
    '';
  const title = cleanNoise(rawTitle);

  const rawHighlight =
    content.textos_hero?.palavra_destaque_ouro ||
    content.textos_da_arte?.palavra_destaque ||
    content.caixa_titulo?.palavra_ouro ||
    content.caixa_titulo?.palavra_ouro_destaque ||
    '';
  const highlight = cleanNoise(rawHighlight);

  const rawSubtitle =
    content.textos_hero?.subtitulo ||
    content.textos_da_arte?.subtitulo ||
    content.caixa_subtitulo?.texto ||
    '';
  const subtitle = cleanNoise(rawSubtitle);

  const rawBenefits =
    content.diferenciais_tecnicos ||
    content.textos_da_arte?.bullets_tecnicos ||
    content.beneficios_tecnicos ||
    [];
  const benefits = normalizeBenefits(rawBenefits);

  const currentPrice = hasPrice ? formatBrlValue(price?.valor_por) : '';
  const oldPrice =
    mode === 'PROMOTION' && price?.valor_de
      ? formatBrlWithSymbol(price.valor_de)
      : '';
  const condition = cleanNoise(price?.condicoes_pagamento || '');
  const rawCta = content.textos_da_arte?.cta;
  const cta = cleanNoise(
    rawCta || (title ? resolveDefaultCta(mode, content.categoria_produto) : '')
  );

  // Resolução de Temas e Fundos Fotográficos (RF-08)
  const effectiveTheme = theme || content.tema || 'campo-agro';
  const isLight = effectiveTheme === 'clean-branco';
  const isBlue = effectiveTheme === 'azul-coagro';
  const scope: 'AGRO' | 'PET' =
    scopeOverride || (content.tema === 'clean-branco' || content.tema === 'azul-coagro' ? 'PET' : 'AGRO');
  const logo = logoVariant || (isLight ? 'h-azul' : 'h-mono-branca');

  const activeBackground = resolveBackgroundFromPrompt(
    content.fundo_imagem,
    backgroundImage,
    content.fundo_imagem_url
  );

  const isPhoto =
    ['campo-agro', 'fundo-gerado'].includes(effectiveTheme) &&
    Boolean(activeBackground);

  const backgroundStyle: React.CSSProperties = isBlue
    ? { background: 'radial-gradient(circle at 50% 40%, #002b82 0%, #001C71 80%)' }
    : isLight
    ? { background: 'radial-gradient(circle at 50% 40%, #ffffff 0%, #f1f5f9 85%)' }
    : { background: 'radial-gradient(circle at 50% 40%, #006b59 0%, #004d40 80%)' };

  // Processamento do produto: sem produto padrão, começa vazio se não fornecido
  const sourceProduct = productImage || '';
  const [processedProduct, setProcessedProduct] = useState(sourceProduct);
  const [adaptiveInfo, setAdaptiveInfo] = useState<AdaptiveProductInfo>({
    croppedSrc: sourceProduct,
    bounds: null,
    orientation: 'compact',
    isWide: false,
    isSmall: false,
  });

  useEffect(() => {
    let mounted = true;

    // Redefine o estado adaptativo para nunca reaproveitar a imagem anterior
    setAdaptiveInfo({
      croppedSrc: sourceProduct,
      bounds: null,
      orientation: 'compact',
      isWide: false,
      isSmall: false,
    });

    if (!sourceProduct) {
      setProcessedProduct('');
      return;
    }

    if (preserveProductBackground || sourceProduct.startsWith('data:image/svg+xml')) {
      setProcessedProduct(sourceProduct);
      processAdaptiveProduct(sourceProduct).then(adaptive => {
        if (mounted) setAdaptiveInfo(adaptive);
      });
      return () => {
        mounted = false;
      };
    }

    removeWhiteBackground(sourceProduct)
      .then(async (transparentImg) => {
        if (!mounted) return;
        setProcessedProduct(transparentImg);

        // Calcula bounding box alfa e faz tight crop para ancoragem física pela base
        const adaptive = await processAdaptiveProduct(transparentImg);
        if (mounted) {
          setAdaptiveInfo(adaptive);
        }
      })
      .catch(() => {
        if (mounted) {
          setProcessedProduct(sourceProduct);
          setForceFallbackTemplate('promo-simples');
          setAdaptiveInfo({
            croppedSrc: sourceProduct,
            bounds: null,
            orientation: 'compact',
            isWide: false,
            isSmall: false,
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, [sourceProduct]);

  const aspectClass = format === 'a4-retrato'
    ? 'aspect-[210/297] max-w-[420px]'
    : isStory
    ? 'aspect-[9/16] max-w-[390px]'
    : format === 'feed-retrato'
    ? 'aspect-[4/5] max-w-[440px]'
    : 'aspect-square max-w-[480px]';

  const canvasClasses = `@container w-full ${aspectClass} relative overflow-hidden font-['Inter']`;
  const { titleColor, subtitleColor, highlightColor } = getPalette(scope, isLight);

  // A imagem final do produto usa o recorte justo dos pixels visíveis (tight crop) para ancoragem pela base
  const finalProductImg = adaptiveInfo.croppedSrc || processedProduct;

  // Estado totalmente zerado: sem imagem e sem título e sem benefícios
  const isArtEmpty = !sourceProduct && !title && benefits.length === 0;

  return (
    <div className="flex justify-center items-center w-full select-none">
      <div id={containerId} style={backgroundStyle} className={canvasClasses}>
        <BackgroundLayer
          theme={effectiveTheme}
          activeBackground={activeBackground}
          isPhoto={isPhoto}
          isBlue={isBlue}
        />

        {isArtEmpty && activeTemplate !== 'promo-text-only' && activeTemplate !== 'promo-agro-a4' && activeTemplate !== 'promo-mono-a4' ? (
          <CanvasEmptyState logoVariant={logo} isStory={isStory} scope={scope} />
        ) : activeTemplate === 'promo-text-only' ? (
          <PromoTextOnly 
            title={title || subtitle}
            oldPrice={oldPrice}
            currentPrice={currentPrice}
            codigo={codigoProduto}
            headerText={badgeText}
          />
        ) : activeTemplate === 'promo-agro-a4' ? (
          <PromoAgroA4 
            title={title || subtitle}
            oldPrice={oldPrice}
            currentPrice={currentPrice}
            codigo={codigoProduto}
            headerText={badgeText}
          />
        ) : activeTemplate === 'promo-mono-a4' ? (
          <PromoMonoA4 
            title={title || subtitle}
            oldPrice={oldPrice}
            currentPrice={currentPrice}
            codigo={codigoProduto}
            headerText={badgeText}
          />
        ) : activeTemplate === 'unified-central' ? (
          <UnifiedCentral
            codigo={codigoProduto}
            scope={scope}
            isLight={isLight}
            title={title}
            highlight={highlight}
            subtitle={subtitle}
            processedProduct={finalProductImg}
            isStory={isStory}
            logoVariant={logo}
            mode={mode}
            hasPrice={hasPrice}
            currentPrice={currentPrice}
            oldPrice={oldPrice}
            condition={condition}
            benefits={benefits}
            cta={cta}
            renderizacao={content.renderizacao_visual}
          />
        ) : activeTemplate === 'unified-central-mascot' ? (
          <UnifiedCentral
            
            scope={content.tema === 'clean-branco' || content.tema === 'azul-coagro' ? 'PET' : 'AGRO'}
            title={title}
            highlight={highlight}
            subtitle={subtitle}
            processedProduct={finalProductImg}
            isStory={isStory}
            logoVariant={logo}
            mode={mode}
            hasPrice={hasPrice}
            currentPrice={currentPrice}
            oldPrice={oldPrice}
            condition={condition}
            benefits={benefits}
            cta={cta}
            renderizacao={content.renderizacao_visual}
          />
        ) : activeTemplate === 'unified-split' ? (
          <UnifiedSplit
            codigo={codigoProduto}
            scope={scope}
            isLight={isLight}
            title={title}
            highlight={highlight}
            subtitle={subtitle}
            processedProduct={finalProductImg}
            isStory={isStory}
            logoVariant={logo}
            mode={mode}
            hasPrice={hasPrice}
            currentPrice={currentPrice}
            oldPrice={oldPrice}
            condition={condition}
            benefits={benefits}
            cta={cta}
            renderizacao={content.renderizacao_visual}
          />
        ) : activeTemplate === 'unified-split-mascot' ? (
          <UnifiedSplitWithMascot
            
            scope={content.tema === 'clean-branco' || content.tema === 'azul-coagro' ? 'PET' : 'AGRO'}
            title={title}
            highlight={highlight}
            subtitle={subtitle}
            processedProduct={finalProductImg}
            isStory={isStory}
            logoVariant={logo}
            mode={mode}
            hasPrice={hasPrice}
            currentPrice={currentPrice}
            oldPrice={oldPrice}
            condition={condition}
            benefits={benefits}
            cta={cta}
            renderizacao={content.renderizacao_visual}
            textBackground={content.fundo_texto}
          />
        ) : activeTemplate === 'promo-simples' ? (
          <PromoSimples
            backgroundColorHex={content.fundo_cor_hex}
            codigo={codigoProduto}
            scope={scope}
            title={title}
            highlight={highlight}
            subtitle={subtitle}
            processedProduct={sourceProduct}
            isStory={isStory}
            logoVariant={logo}
            mode={mode}
            hasPrice={hasPrice}
            currentPrice={currentPrice}
            oldPrice={oldPrice}
            condition={condition}
            renderizacao={content.renderizacao_visual}
          />
        ) : activeTemplate === 'informative-central' ? (
          <InformativeCentral
            codigo={codigoProduto}
            scope={scope}
            isLight={isLight}
            title={title}
            highlight={highlight}
            subtitle={subtitle}
            processedProduct={finalProductImg}
            isStory={isStory}
            logoVariant={logo}
            benefits={benefits}
            cta={cta}
            renderizacao={content.renderizacao_visual}
            textBackground={false}
          />
        ) : activeTemplate === 'informative-split' ? (
          <InformativeSplit
            codigo={codigoProduto}
            scope={scope}
            isLight={isLight}
            title={title}
            highlight={highlight}
            subtitle={subtitle}
            processedProduct={finalProductImg}
            isStory={isStory}
            logoVariant={logo}
            benefits={benefits}
            cta={cta}
            renderizacao={content.renderizacao_visual}
            textBackground={false}
          />
        ) : activeTemplate === 'pet-central' ? (
            <PetCentral
            codigo={codigoProduto}
              title={title}
              highlight={highlight}
              subtitle={subtitle}
              processedProduct={finalProductImg}
              isStory={isStory}
              mode={mode}
              hasPrice={hasPrice}
              currentPrice={currentPrice}
              oldPrice={oldPrice}
              condition={condition}
              benefits={benefits}
              renderizacao={content.renderizacao_visual}
            />
        ) : activeTemplate === 'pet-split' || activeTemplate === 'pet-split-vertical' ? (
          <PetSplitVertical
            codigo={codigoProduto}
            title={title}
            highlight={highlight}
            subtitle={subtitle}
            processedProduct={finalProductImg}
            isStory={isStory}
            mode={mode}
            hasPrice={hasPrice}
            currentPrice={currentPrice}
            oldPrice={oldPrice}
            condition={condition}
            benefits={benefits}
            cta={cta}
            isWide={adaptiveInfo.isWide}
            renderizacao={content.renderizacao_visual}
          />
        ) : isSplit ? (
          <SplitVertical
            codigo={codigoProduto}
            scope={scope}
            title={title}
            highlight={highlight}
            highlightColor={highlightColor}
            titleColor={titleColor}
            subtitle={subtitle}
            subtitleColor={subtitleColor}
            processedProduct={finalProductImg}
            isStory={isStory}
            logoVariant={logo}
            mode={mode}
            hasPrice={hasPrice}
            currentPrice={currentPrice}
            oldPrice={oldPrice}
            condition={condition}
            benefits={benefits}
            cta={cta}
            isWide={adaptiveInfo.isWide}
            renderizacao={content.renderizacao_visual}
          />
        ) : (
          <HeroCentral
            codigo={codigoProduto}
            scope={scope}
            title={title}
            highlight={highlight}
            highlightColor={highlightColor}
            titleColor={titleColor}
            subtitle={subtitle}
            subtitleColor={subtitleColor}
            processedProduct={finalProductImg}
            isStory={isStory}
            logoVariant={logo}
            mode={mode}
            hasPrice={hasPrice}
            currentPrice={currentPrice}
            oldPrice={oldPrice}
            condition={condition}
            benefits={benefits}
            cta={cta}
            orientation={adaptiveInfo.orientation}
            isWide={adaptiveInfo.isWide}
            isSmall={adaptiveInfo.isSmall}
            imageBoxFormat={imageBoxFormat || (content as any).image_box_format}
            renderizacao={content.renderizacao_visual}
          />
        )}

        {/* Selo Promocional Flutuante (Injetado via SingleArtRenderer) */}
        {badgeText && !['promo-text-only', 'promo-agro-a4', 'promo-mono-a4'].includes(activeTemplate) && (
          <div className="absolute top-5 right-5 z-50 bg-[#ffab00] text-[#004d40] px-3 py-1 rounded-tl-xl rounded-br-xl font-exo2 font-black uppercase text-[13px] sm:text-[15px] shadow-lg border border-[#004d40]/20 transform rotate-3">
            {badgeText}
          </div>
        )}
      </div>
    </div>
  );
};
