import React, { useState } from 'react';
import { CanvasFormat, CanvasTheme, AgroContent, TemplateLayout } from '../types/agro';
import { LogoVariant } from '../assets/coagroLogos';
import { toPng } from 'html-to-image';
import { uploadToGoogleDrive } from '../lib/googleDrive';
import { getAccessToken, googleSignIn } from '../lib/firebase';
import { formatCleanRenderJson } from './JsonViewerModal';
import {
  Download,
  HardDrive,
  Copy,
  Check,
  Palette,
  Layout,
  FileCode,
  ExternalLink,
  RefreshCw,
  Columns2,
  Maximize2,
  Box,
} from 'lucide-react';

interface ExportToolbarProps {
  content: AgroContent;
  format: CanvasFormat;
  onSetFormat: (format: CanvasFormat) => void;
  theme: CanvasTheme;
  onSetTheme: (theme: CanvasTheme) => void;
  templateLayout?: TemplateLayout;
  onSetTemplateLayout?: (template: TemplateLayout) => void;
  imageBoxFormat?: 'rectangular' | 'square';
  onSetImageBoxFormat?: (fmt: 'rectangular' | 'square') => void;
  logoVariant: LogoVariant;
  onSetLogoVariant: (variant: LogoVariant) => void;
  user?: any;
  onPromptLogin?: () => void;
  targetElementId?: string;
  appMode?: 'AGRO' | 'PET';
}

export const ExportToolbar: React.FC<ExportToolbarProps> = ({
  content,
  format,
  onSetFormat,
  theme,
  onSetTheme,
  templateLayout = 'split-vertical',
  onSetTemplateLayout,
  imageBoxFormat = 'rectangular',
  onSetImageBoxFormat,
  logoVariant,
  onSetLogoVariant,
  targetElementId = 'agro-single-art-canvas',
  appMode = 'AGRO',
}) => {
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [isSavingDrive, setIsSavingDrive] = useState(false);
  const [driveSavedLink, setDriveSavedLink] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'json' | 'caption' | null>(null);

  // Download high-resolution PNG
  const handleDownloadPng = async () => {
    try {
      setIsExportingPng(true);
      const element = document.getElementById(targetElementId);
      if (!element) {
        throw new Error('Elemento da arte não encontrado para renderização.');
      }

      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: 1.5,
      });

      const prefix = appMode === 'PET' ? 'coagro-pet' : 'coagro-agro';
      const filename = `${prefix}-${(content.formato || 'post').toLowerCase()}-${Date.now()}.png`;
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      console.error('Erro ao exportar PNG:', err);
      alert('Erro ao gerar imagem: ' + err.message);
    } finally {
      setIsExportingPng(false);
    }
  };

  // Save to Google Drive (with on-demand auth)
  const handleSaveToDrive = async () => {
    try {
      setIsSavingDrive(true);
      setDriveSavedLink(null);

      // Check if access token is available; if not, prompt on-demand
      let token = await getAccessToken();
      if (!token) {
        const signRes = await googleSignIn();
        token = signRes?.accessToken || null;
      }

      const element = document.getElementById(targetElementId);
      if (!element) {
        throw new Error('Arte não encontrada para exportar ao Drive.');
      }

      // Generate PNG data url
      const dataUrl = await toPng(element, {
        quality: 0.98,
        pixelRatio: 1.5,
      });

      const brandLabel = appMode === 'PET' ? 'Pet' : 'Agro';
      const defaultTitle = `Campanha Coagro ${brandLabel}`;
      const title = content.caixa_titulo?.texto || defaultTitle;
      const fileName = `Coagro_${brandLabel}_${title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;

      const uploaded = await uploadToGoogleDrive({
        name: fileName,
        mimeType: 'image/png',
        data: dataUrl,
        description: `Arte oficial gerada para a divisão ${brandLabel.toUpperCase()} do Grupo Coagro.\nLegenda: ${content.legenda_post || ''}`,
      });

      if (uploaded.webViewLink) {
        setDriveSavedLink(uploaded.webViewLink);
      }
    } catch (err: any) {
      console.error('Erro ao salvar no Google Drive:', err);
      alert('Erro ao salvar no Google Drive: ' + err.message);
    } finally {
      setIsSavingDrive(false);
    }
  };

  // Copy pure JSON (strict format adhering to user specification)
  const handleCopyJson = () => {
    const cleanObject = formatCleanRenderJson(content);
    const jsonString = JSON.stringify(cleanObject, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopiedType('json');
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Removed Copiar Legenda method as it is handled by App.tsx

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 space-y-4 font-['Inter']">
      {/* Styling Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        {/* Format Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-gray-500 uppercase font-exo2 flex items-center gap-1">
            <Layout className="w-3.5 h-3.5 text-[#004d40]" /> Proporção:
          </span>
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => onSetFormat('feed-quadrado')}
              disabled
              className={`px-2 py-1 rounded font-semibold transition opacity-50 cursor-not-allowed ${
                format === 'feed-quadrado' ? 'bg-white text-[#004d40] shadow-xs' : 'text-gray-600'
              }`}
              title="Em desenvolvimento"
            >
              1:1
            </button>
            <button
              onClick={() => onSetFormat('feed-retrato')}
              disabled
              className={`px-2 py-1 rounded font-semibold transition opacity-50 cursor-not-allowed ${
                format === 'feed-retrato' ? 'bg-white text-[#004d40] shadow-xs' : 'text-gray-600'
              }`}
              title="Em desenvolvimento"
            >
              4:5
            </button>
            <button
              onClick={() => onSetFormat('story')}
              className={`px-2 py-1 rounded font-semibold transition ${
                format === 'story' ? 'bg-white text-[#004d40] shadow-xs' : 'text-gray-600'
              }`}
            >
              9:16
            </button>
          </div>
        </div>


        {/* HeroCentral Bounding Box Selector - Desativado a pedido do usuário */}
        {/* onSetImageBoxFormat && ... */}

        {/* Theme Selector */}
        <div className="flex items-center gap-1.5 hidden">
          {/* Theme is now controlled by the manual editor mostly, but we can keep it hidden here to save space or let it be */}
        </div>

        {/* Official Logo Variation Selector - Agora 100% Automático via App.tsx */}
        {/* <div className="flex items-center gap-1.5"> ... */}
      </div>


    </div>
  );
};
