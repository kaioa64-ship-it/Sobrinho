import React from 'react';
import { useArtworkForm } from '../hooks/useArtworkForm';
import type { InputPanelProps } from '../hooks/useArtworkForm';

export type { InputPanelProps };

import { RefreshCw, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { TemplateMatrixSection } from './input-panel/TemplateMatrixSection';
import { ProductPhotoSection } from './input-panel/ProductPhotoSection';
import { ProductDescriptionSection } from './input-panel/ProductDescriptionSection';
import { LivePriceSection } from './input-panel/LivePriceSection';
import { LiveTextFieldsSection } from './input-panel/LiveTextFieldsSection';
import { LiveTitleSection } from './input-panel/LiveTitleSection';

/**
 * InputPanel — orquestrador de layout do painel de criação.
 *
 * Desde a Fase 2 (Bloco 3) este componente **não guarda estado**: todo o estado
 * e os handlers vivem em `useArtworkForm`. Aqui ficou apenas a composição dos 6
 * submódulos de `src/components/input-panel/`.
 */
export const InputPanel: React.FC<InputPanelProps> = (props) => {
  const {
    appMode,
    bgProcessingStage,
    bgProgressPercent,
    cachedRawCutout,
    condicoesPagamento,
    currentImage,
    currentMode,
    currentPreco,
    detectedPrices,
    fileInputRef,
    handleExecuteGenerate,
    handleFileUpload,
    handleLiveBulletChange,
    handleLiveCommunicationModeChange,
    handleLiveCtaChange,
    handleLiveGoldenWordChange,
    handleLivePriceChange,
    handleLiveSubtitleChange,
    handleLiveTitleChange,
    handlePresetChange,
    handleQuickExample,
    handleRemoveImage,
    handleResetAll,
    handleStripBackgroundNow,
    imageBoxFormat,
    imageUploadedAlert,
    isExplicitAuto,
    isGenerated,
    isGenerating,
    isLiveEditorOpen,
    isProcessingBg,
    isPromotionIntent,
    maskPreset,
    onSelectFormat,
    onSelectImageBoxFormat,
    onSelectTemplate,
    previousTitle,
    renderedBullets,
    renderedCta,
    renderedPalavraOuro,
    renderedSubtitulo,
    renderedTitulo,
    selectedFormat,
    selectedTemplate,
    setCondicoesPagamento,
    setIsLiveEditorOpen,
    setPreviousTitle,
    setShowPriceFields,
    setUserCommand,
    setValorDe,
    setValorPor,
    showPriceFields,
    showResetButton,
    userCommand,
    valorDe,
    valorPor,
  } = useArtworkForm(props);

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

