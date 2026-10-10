import React, { useState, useRef } from 'react';
import { COAGRO_STORES, COAGRO_CORPORATE_INFO } from '../../data/coagroStores';
import { 
  LogoHorizontalAzul, 
  CoagroPetLogo,
  CoagroSimboloCasinha,
  CoagroSimboloCasinhaBranca,
  CoagroSimboloCasinhaAzul
} from '../../assets/coagroLogos';
import { Copy, Download, Upload, User, Mail, Phone, Video, Presentation, Check, Image as ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';

interface TeamDigitalTabProps {
  scope: 'AGRO' | 'PET';
  onShowNotice: (msg: string) => void;
}

export const TeamDigitalTab: React.FC<TeamDigitalTabProps> = ({ scope, onShowNotice }) => {
  const isPet = scope === 'PET';

  // --- 1. Estado da Assinatura de E-mail ---
  const [sigName, setSigName] = useState('Kaio Virgínio');
  const [sigRole, setSigRole] = useState('Gestor de Foco & Marketing');
  const [sigStoreId, setSigStoreId] = useState('aracaju');
  const [sigPhone, setSigPhone] = useState('(79) 99601-0164');
  const [sigEmail, setSigEmail] = useState('marketing@grupocoagro.com.br');
  const sigPhotoInputRef = useRef<HTMLInputElement>(null);

  // Foto compartilhada do colaborador (sincronizada automaticamente entre Assinatura de E-mail e Avatar de WhatsApp)
  const [collaboratorPhoto, setCollaboratorPhoto] = useState<string | null>(null);

  const selectedStore = COAGRO_STORES.find(s => s.id === sigStoreId) || COAGRO_STORES[0];

  // --- 2. Estado do Avatar de WhatsApp ---
  const [avatarMode, setAvatarMode] = useState<'PERSON' | 'DEPT'>('PERSON');
  const [avatarDeptName, setAvatarDeptName] = useState('Atendimento Loja');
  const avatarPhotoInputRef = useRef<HTMLInputElement>(null);

  const handleCopyEmailSignature = async () => {
    try {
      const signatureHtml = `
        <table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; color: #1f2937; font-size: 13px; line-height: 1.45; border-collapse: collapse;">
          <tr>
            ${collaboratorPhoto ? `
            <td style="padding-right: 16px; vertical-align: middle;">
              <img src="${collaboratorPhoto}" alt="${sigName}" width="68" height="68" style="width: 68px; height: 68px; border-radius: 50%; object-fit: cover; display: block; border: 2px solid #004d40;" />
            </td>
            ` : ''}
            <td style="padding-right: 18px; border-right: 3px solid #004d40; vertical-align: middle; text-align: center;">
              <div style="font-size: 20px; font-weight: 900; color: #004d40; font-family: 'Exo 2', Arial, sans-serif; letter-spacing: -0.5px;">COAGRO</div>
              <div style="font-size: 9px; color: #ffab00; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Grupo Coagro</div>
            </td>
            <td style="padding-left: 18px; vertical-align: middle;">
              <div style="font-size: 15px; font-weight: bold; color: #111827; letter-spacing: -0.2px;">${sigName}</div>
              <div style="font-size: 12px; color: #004d40; font-weight: bold; margin-bottom: 4px;">${sigRole} • ${selectedStore.nome}</div>
              <div style="font-size: 11px; color: #4b5563;">
                <span>WhatsApp: <strong>${sigPhone}</strong></span> &bull; 
                <span>E-mail: <strong>${sigEmail}</strong></span>
              </div>
              <div style="font-size: 10px; color: #6b7280; margin-top: 3px;">
                ${selectedStore.endereco} - ${selectedStore.cidade}/${selectedStore.estado} &bull; 
                <a href="${COAGRO_CORPORATE_INFO.websiteUrl}" style="color: #004d40; text-decoration: none; font-weight: bold;">${COAGRO_CORPORATE_INFO.website}</a>
              </div>
            </td>
          </tr>
        </table>
      `;

      if (navigator.clipboard && window.ClipboardItem) {
        const blob = new Blob([signatureHtml], { type: 'text/html' });
        const textBlob = new Blob([`${sigName} - ${sigRole} - ${selectedStore.nome} | ${COAGRO_CORPORATE_INFO.website}`], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': blob,
            'text/plain': textBlob,
          }),
        ]);
        onShowNotice('✅ Assinatura copiada! Basta colar (Ctrl+V) nas configurações do Outlook.');
      } else {
        await navigator.clipboard.writeText(signatureHtml);
        onShowNotice('✅ Código HTML da assinatura copiado!');
      }
    } catch {
      onShowNotice('⚠️ Erro ao copiar assinatura. Tente novamente.');
    }
  };

  const handleDownloadSignaturePng = async () => {
    try {
      const el = document.getElementById('outlook-signature-canvas');
      if (!el) return;
      onShowNotice('⏳ Gerando imagem da assinatura...');
      const dataUrl = await toPng(el, { quality: 1, pixelRatio: 3, cacheBust: true });
      const link = document.createElement('a');
      link.download = `Assinatura_Email_${sigName.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
      onShowNotice('✅ Imagem PNG da assinatura salva em Downloads!');
    } catch (err: any) {
      alert('Erro ao gerar assinatura: ' + err.message);
    }
  };

  // Upload sincronizado a partir do avatar (atualiza avatar e assinatura de e-mail)
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCollaboratorPhoto(reader.result as string);
        onShowNotice('✅ Foto do consultor sincronizada no avatar e na assinatura!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload sincronizado a partir da assinatura (atualiza assinatura e avatar de e-mail)
  const handleSigPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCollaboratorPhoto(reader.result as string);
        onShowNotice('✅ Foto do colaborador sincronizada na assinatura e no avatar!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCollaboratorPhoto = () => {
    setCollaboratorPhoto(null);
    onShowNotice('Foto do colaborador removida de ambas as prévias.');
  };

  const handleDownloadAvatar = async () => {
    try {
      const el = document.getElementById('whatsapp-avatar-canvas');
      if (!el) return;
      onShowNotice('⏳ Gerando avatar com a Casinha Coagro...');
      const dataUrl = await toPng(el, { quality: 1, pixelRatio: 3, cacheBust: true });
      const link = document.createElement('a');
      link.download = `Avatar_WhatsApp_Coagro_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      onShowNotice('✅ Avatar baixado em 500x500px alta definição!');
    } catch (err: any) {
      alert('Erro ao gerar avatar: ' + err.message);
    }
  };

  const handleDownloadWallpaper = async (themeKey: 'azul_titular' | 'agro_tech' | 'verde_institucional' | 'sala_clean', title: string) => {
    try {
      onShowNotice(`⏳ Gerando fundo "${title}" em Full HD 1920x1080...`);
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const casinhaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="525 0 235 210" width="235" height="210">
        <path fill="#508D2B" d="M661.66 81.01c-45.81,13.1 -59.02,56.87 -59.34,85.88 28.19,7.76 61.47,5.98 82.06,-5.22 46.07,-25.06 33.65,-70.29 33.65,-70.29 0,0 -14.18,-13.08 -37.65,-13.08 -5.71,0 -11.98,0.77 -18.72,2.7l0 0z"/>
        <path fill="#F0A01B" d="M644.15 3.65l-108.78 69.55c-6.34,4.25 -3.52,14.05 4.04,14.05l25 0c4.31,0 8.53,-1.19 12.2,-3.44l71.66 -43.85c4.49,-2.91 10.21,-2.91 14.59,-0.01l69.35 43.12c-52.53,7.92 -107.56,41.6 -125.83,78.32 33.4,-30.47 81.65,-61.01 151.48,-65.42 5.08,-0.32 10.45,0.07 15.23,-1.31 9.14,-2.64 11.21,-14.73 3.47,-20.03l-108.69 -70.99c-3.53,-2.42 -7.64,-3.63 -11.77,-3.63 -4.14,0 -8.31,1.22 -11.94,3.65l0 0z"/>
        <path fill="#386A27" d="M743.55 189.58l0 -76.98c0,-2.62 -2.11,-4.74 -4.72,-4.74 -2.28,0 -4.24,1.63 -4.64,3.88 -3.4,18.95 -14.21,42.16 -43.98,58.78 -26.43,14.76 -69.03,17.27 -105.07,7.3l0 0c0.37,-24.42 7.63,-56.88 28.46,-81.52 0.85,-1 0.14,-2.53 -1.17,-2.53l-0 0 -29.77 0c-7.2,0 -13.04,5.84 -13.04,13.05l0 82.75c0,7.21 5.84,13.05 13.04,13.05l147.87 0c7.21,0 13.04,-5.85 13.04,-13.05z"/>
      </svg>`;

      let casinhaImg: HTMLImageElement | null = null;
      try {
        casinhaImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(casinhaSvg);
        });
      } catch {
        casinhaImg = null;
      }

      if (themeKey === 'azul_titular') {
        // Modelo 1: Azul Titular Coagro (#001C71) com Logo Vertical Oficial
        const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
        grad.addColorStop(0, '#001C71');
        grad.addColorStop(0.5, '#082585');
        grad.addColorStop(1, '#020d29');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1920, 1080);

        // Iluminação central suave
        const rad = ctx.createRadialGradient(960, 480, 50, 960, 480, 850);
        rad.addColorStop(0, 'rgba(72, 151, 208, 0.18)');
        rad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, 1920, 1080);

        // Casinha no topo central
        if (casinhaImg) {
          ctx.drawImage(casinhaImg, 960 - 80, 310, 160, 142);
        }
        // Tipografia oficial
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 88px "Exo 2", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('COAGRO', 960, 530);

        ctx.fillStyle = '#ffab00';
        ctx.font = 'bold 24px "Exo 2", Arial, sans-serif';
        ctx.fillText('GRUPO COAGRO • MARCA OFICIAL', 960, 580);

        // Rodapé corporativo
        ctx.textAlign = 'right';
        ctx.fillStyle = '#93c5fd';
        ctx.font = '16px "Inter", Arial, sans-serif';
        ctx.fillText('Alagoas • Sergipe • Bahia', 1840, 1010);
        ctx.fillStyle = '#ffab00';
        ctx.font = 'bold 18px "Exo 2", Arial, sans-serif';
        ctx.fillText('www.grupocoagro.com.br', 1840, 1040);
      } else if (themeKey === 'agro_tech') {
        // Modelo 2: Campo Tecnológico (Agro Tech)
        const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
        grad.addColorStop(0, '#00261f');
        grad.addColorStop(0.6, '#004d40');
        grad.addColorStop(1, '#02332a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1920, 1080);

        // Linhas de padrão tecnológico
        ctx.strokeStyle = 'rgba(255, 171, 0, 0.08)';
        ctx.lineWidth = 1.5;
        for (let i = -500; i < 2500; i += 120) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + 400, 1080);
          ctx.stroke();
        }

        if (casinhaImg) {
          ctx.drawImage(casinhaImg, 960 - 75, 320, 150, 133);
        }
        ctx.fillStyle = '#ffab00';
        ctx.font = '900 78px "Exo 2", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('AGRO TECH', 960, 530);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px "Inter", Arial, sans-serif';
        ctx.fillText('TECNOLOGIA & CONSULTORIA AGRONÔMICA', 960, 580);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#a7f3d0';
        ctx.font = '16px "Inter", Arial, sans-serif';
        ctx.fillText('Grupo Coagro • Inovação no Campo', 1840, 1010);
        ctx.fillStyle = '#ffab00';
        ctx.font = 'bold 18px "Exo 2", Arial, sans-serif';
        ctx.fillText('www.grupocoagro.com.br', 1840, 1040);
      } else if (themeKey === 'verde_institucional') {
        // Modelo 3: Verde Safra Institucional Oficial (#004d40)
        const grad = ctx.createRadialGradient(960, 540, 100, 960, 540, 950);
        grad.addColorStop(0, '#005b4c');
        grad.addColorStop(0.7, '#004d40');
        grad.addColorStop(1, '#002f27');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1920, 1080);

        if (casinhaImg) {
          ctx.drawImage(casinhaImg, 960 - 90, 310, 180, 160);
        }
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 84px "Exo 2", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('COAGRO', 960, 540);

        ctx.fillStyle = '#ffab00';
        ctx.font = 'bold 22px "Exo 2", Arial, sans-serif';
        ctx.fillText('DESDE 1980 • NUTRIÇÃO VEGETAL, DEFENSIVOS E VETERINÁRIA', 960, 590);

        ctx.textAlign = 'right';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '16px "Inter", Arial, sans-serif';
        ctx.fillText('12 Unidades no Nordeste • Alagoas, Sergipe e Bahia', 1840, 1010);
        ctx.fillStyle = '#ffab00';
        ctx.font = 'bold 18px "Exo 2", Arial, sans-serif';
        ctx.fillText('www.grupocoagro.com.br', 1840, 1040);
      } else {
        // Modelo 4: Sala Clean / Escritório Executivo com Quadro da Coagro na Parede
        // Parede de sala corporativa clean
        const wallGrad = ctx.createLinearGradient(0, 0, 0, 960);
        wallGrad.addColorStop(0, '#f8fafc');
        wallGrad.addColorStop(1, '#e2e8f0');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(0, 0, 1920, 960);

        // Piso e rodapé moderno na base inferior
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(0, 960, 1920, 16);
        const floorGrad = ctx.createLinearGradient(0, 976, 0, 1080);
        floorGrad.addColorStop(0, '#334155');
        floorGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, 976, 1920, 104);

        // Quadro emoldurado na parede (centralizado e com proporção elegante)
        const frameX = 960 - 320;
        const frameY = 180;
        const frameW = 640;
        const frameH = 440;

        // Sombra suave do quadro
        ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
        ctx.fillRect(frameX + 12, frameY + 12, frameW, frameH);

        // Moldura preta fosca executiva
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(frameX, frameY, frameW, frameH);

        // Paspatur branco nobre
        const borderM = 24;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(frameX + borderM, frameY + borderM, frameW - borderM * 2, frameH - borderM * 2);

        // Tela interna institucional verde safra
        const innerM = borderM + 26;
        ctx.fillStyle = '#004d40';
        ctx.fillRect(frameX + innerM, frameY + innerM, frameW - innerM * 2, frameH - innerM * 2);

        // Conteúdo do quadro: Casinha e Coagro
        if (casinhaImg) {
          ctx.drawImage(casinhaImg, 960 - 50, frameY + innerM + 40, 100, 89);
        }
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 52px "Exo 2", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('COAGRO', 960, frameY + innerM + 190);

        ctx.fillStyle = '#ffab00';
        ctx.font = 'bold 16px "Exo 2", Arial, sans-serif';
        ctx.fillText('GRUPO COAGRO', 960, frameY + innerM + 225);

        // Reflexo sutil de vidro na tela
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.beginPath();
        ctx.moveTo(frameX + innerM, frameY + innerM);
        ctx.lineTo(frameX + innerM + 200, frameY + innerM);
        ctx.lineTo(frameX + innerM + 80, frameY + frameH - innerM);
        ctx.lineTo(frameX + innerM, frameY + frameH - innerM);
        ctx.closePath();
        ctx.fill();

        ctx.textAlign = 'right';
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '15px "Inter", Arial, sans-serif';
        ctx.fillText('Grupo Coagro • Sala Executiva', 1840, 1020);
        ctx.fillStyle = '#ffab00';
        ctx.font = 'bold 16px "Exo 2", Arial, sans-serif';
        ctx.fillText('www.grupocoagro.com.br', 1840, 1050);
      }

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Fundo_Videoconferencia_${themeKey}_1920x1080.png`;
      link.href = dataUrl;
      link.click();
      onShowNotice(`✅ Fundo de videoconferência "${title}" baixado em Full HD (1920x1080)!`);
    } catch (err: any) {
      alert('Erro ao gerar fundo: ' + err.message);
    }
  };

  const handleDownloadPptxTemplate = () => {
    // Gera arquivo HTML estilizado compatível com abertura direta no PowerPoint
    const pptxContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:p='urn:schemas-microsoft-com:office:powerpoint'>
      <head>
        <meta charset='utf-8'>
        <title>Apresentação Corporativa Grupo Coagro</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; background-color: #004d40; color: #ffffff; }
          .slide { width: 960px; height: 540px; page-break-after: always; padding: 40px; box-sizing: border-box; position: relative; }
          .slide-1 { background-color: #004d40; }
          .slide-2 { background-color: #ffffff; color: #1f2937; }
          h1 { font-size: 40px; color: #ffab00; margin-top: 140px; font-weight: 900; }
          h2 { font-size: 28px; color: #004d40; border-bottom: 3px solid #ffab00; padding-bottom: 10px; }
          p { font-size: 18px; line-height: 1.5; }
          .footer { position: absolute; bottom: 20px; right: 40px; font-size: 12px; color: #9ca3af; }
        </style>
      </head>
      <body>
        <div class='slide slide-1'>
          <h1>GRUPO COAGRO</h1>
          <p style='font-size: 24px; color: #ffffff;'>Apresentação Institucional & Comercial</p>
          <div class='footer' style='color: #ffab00;'>www.grupocoagro.com.br • @grupocoagro</div>
        </div>
        <div class='slide slide-2'>
          <h2>NOSSAS 12 UNIDADES & OPERAÇÕES</h2>
          <p>Alagoas &bull; Sergipe &bull; Bahia</p>
          <p>Nutrição vegetal, defensivos agrícolas, farmácia veterinária e serviços agronômicos especializados.</p>
          <div class='footer'>Grupo Coagro &bull; Documento Oficial</div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', pptxContent], { type: 'application/vnd.ms-powerpoint' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Apresentacao_Corporativa_Grupo_Coagro_${Date.now()}.ppt`;
    link.click();
    URL.revokeObjectURL(url);
    onShowNotice('✅ Apresentação corporativa (.PPT) baixada!');
  };

  return (
    <div className="space-y-8 font-['Inter']">
      {/* 1. GERADOR DE ASSINATURA DE E-MAIL (OUTLOOK) */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="text-base sm:text-lg font-black text-gray-900 font-exo2 uppercase tracking-wide flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#004d40]" />
            Gerador de Assinatura de E-mail Corporativa (Padrão Outlook)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Gera a assinatura padronizada para toda a equipe, com foto opcional, logo oficial da Coagro e links corporativos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Formulário de Campos */}
          <div className="lg:col-span-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={sigName}
                  onChange={(e) => setSigName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#004d40]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Cargo / Função</label>
                <input
                  type="text"
                  value={sigRole}
                  onChange={(e) => setSigRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#004d40]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Filial / Lotação</label>
                <select
                  value={sigStoreId}
                  onChange={(e) => {
                    setSigStoreId(e.target.value);
                    const s = COAGRO_STORES.find(item => item.id === e.target.value);
                    if (s) setSigPhone(s.telefoneFormatado);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#004d40] bg-white"
                >
                  {COAGRO_STORES.map((s) => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">WhatsApp Comercial</label>
                <input
                  type="text"
                  value={sigPhone}
                  onChange={(e) => setSigPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#004d40]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">E-mail Corporativo (@grupocoagro.com.br)</label>
              <input
                type="email"
                value={sigEmail}
                onChange={(e) => setSigEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#004d40]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Foto do Colaborador (Sincronizada)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="file"
                  ref={sigPhotoInputRef}
                  accept="image/*"
                  onChange={handleSigPhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => sigPhotoInputRef.current?.click()}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold font-exo2 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#004d40]" />
                  {collaboratorPhoto ? 'Trocar Foto' : 'Inserir Foto'}
                </button>
                {collaboratorPhoto && (
                  <button
                    type="button"
                    onClick={handleRemoveCollaboratorPhoto}
                    className="text-[11px] text-rose-600 hover:underline font-bold"
                  >
                    Remover Foto
                  </button>
                )}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Sincronizada automaticamente com o Avatar de WhatsApp.</p>
            </div>
          </div>

          {/* Preview da Assinatura & Botões de Ação */}
          <div className="lg:col-span-7 flex flex-col justify-between p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2 font-exo2">
                Preview em Tempo Real (Padrão Outlook & Gmail)
              </span>

              {/* Bloco Renderizável da Assinatura */}
              <div
                id="outlook-signature-canvas"
                className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
              >
                {/* Foto Opcional */}
                {collaboratorPhoto && (
                  <img
                    src={collaboratorPhoto}
                    alt={sigName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#004d40] shadow-2xs flex-shrink-0"
                  />
                )}

                {/* Bloco da Marca com a Casinha Coagro */}
                <div className="pr-4 border-r-3 border-[#004d40] flex flex-col items-center justify-center flex-shrink-0">
                  <CoagroSimboloCasinha className="w-10 h-10" />
                  <span className="font-exo2 font-black text-sm text-[#004d40] leading-none mt-1">COAGRO</span>
                  <span className="text-[8px] font-bold text-[#ffab00] uppercase tracking-wider">Grupo Coagro</span>
                </div>

                {/* Dados da Assinatura */}
                <div className="text-xs space-y-0.5">
                  <div className="font-black text-gray-900 text-sm font-exo2">{sigName}</div>
                  <div className="font-bold text-[#004d40] text-xs">{sigRole} • {selectedStore.nome}</div>
                  <div className="text-gray-600 text-[11px]">
                    WhatsApp: <span className="text-gray-900 font-bold">{sigPhone}</span> &bull; E-mail: <strong>{sigEmail}</strong>
                  </div>
                  <div className="text-[10px] text-gray-500 pt-0.5">
                    {selectedStore.endereco} - {selectedStore.cidade}/{selectedStore.estado} &bull; <strong className="text-[#004d40]">{COAGRO_CORPORATE_INFO.website}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações: Copiar HTML e Baixar PNG */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyEmailSignature}
                className="flex-1 py-2.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-xl text-xs font-bold font-exo2 uppercase tracking-wide flex items-center justify-center gap-2 transition active:scale-95 shadow-sm cursor-pointer"
              >
                <Copy className="w-4 h-4 text-[#ffab00]" />
                Copiar Assinatura para o Outlook
              </button>
              <button
                type="button"
                onClick={handleDownloadSignaturePng}
                className="py-2.5 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold font-exo2 uppercase tracking-wide flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Download className="w-4 h-4 text-gray-600" />
                Baixar como Imagem (PNG)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. GERADOR DE AVATAR / FOTO DE PERFIL WHATSAPP COM A CASINHA COAGRO */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="text-base sm:text-lg font-black text-gray-900 font-exo2 uppercase tracking-wide flex items-center gap-2">
            <User className="w-5 h-5 text-[#004d40]" />
            Gerador de Avatar Oficial com a Casinha Coagro (WhatsApp & CRM)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Padroniza os números comerciais da Coagro com a casinha oficial da marca, sincronizando com a assinatura e CRM.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Controles do Avatar */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setAvatarMode('PERSON')}
                className={`py-2 text-xs font-bold font-exo2 rounded-lg transition ${
                  avatarMode === 'PERSON' ? 'bg-[#004d40] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pessoa Real (Consultor/Vendedor)
              </button>
              <button
                type="button"
                onClick={() => setAvatarMode('DEPT')}
                className={`py-2 text-xs font-bold font-exo2 rounded-lg transition ${
                  avatarMode === 'DEPT' ? 'bg-[#004d40] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Setor / Departamento da Loja
              </button>
            </div>

            {avatarMode === 'PERSON' ? (
              <div className="space-y-3">
                <p className="text-xs text-gray-600 leading-relaxed">
                  Carregue a foto do colaborador. A foto sincroniza com a assinatura de e-mail e recebe a <strong>Casinha Coagro oficial</strong> como insígnia institucional.
                </p>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={avatarPhotoInputRef}
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => avatarPhotoInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold font-exo2 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[#004d40]" />
                    {collaboratorPhoto ? 'Trocar Foto do Consultor' : 'Carregar Foto do Consultor'}
                  </button>
                  {collaboratorPhoto && (
                    <button
                      type="button"
                      onClick={handleRemoveCollaboratorPhoto}
                      className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-gray-700 uppercase">Nome do Setor / Atendimento</label>
                <select
                  value={avatarDeptName}
                  onChange={(e) => setAvatarDeptName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold font-exo2 focus:ring-1 focus:ring-[#004d40] bg-white"
                >
                  <option value="Atendimento & Vendas">Atendimento & Vendas</option>
                  <option value="Consultoria Técnica Agro">Consultoria Técnica Agro</option>
                  <option value="Farmácia Veterinária">Farmácia Veterinária</option>
                  <option value="Logística & Expedição">Logística & Expedição</option>
                  <option value="Financeiro & Cobrança">Financeiro & Cobrança</option>
                  <option value="Diretoria Coagro">Diretoria Coagro</option>
                </select>
                <p className="text-[11px] text-gray-500">
                  O avatar gerado exibirá a <strong>Casinha da Coagro em vetor oficial</strong> com fundo corporativo #004d40.
                </p>
              </div>
            )}
          </div>

          {/* Visualizador do Avatar Circular com a CASINHA COAGRO */}
          <div className="lg:col-span-5 flex flex-col items-center gap-3">
            <div
              id="whatsapp-avatar-canvas"
              className="w-48 h-48 rounded-full p-2 bg-gradient-to-tr from-[#004d40] via-[#ffab00] to-[#004d40] shadow-xl flex items-center justify-center relative select-none overflow-hidden"
            >
              <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center overflow-hidden relative">
                {avatarMode === 'PERSON' && collaboratorPhoto ? (
                  <div className="w-full h-full relative">
                    <img src={collaboratorPhoto} alt="Consultor" className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1/2 translate-x-1/2 bg-white/95 rounded-full p-1 shadow-md border border-[#ffab00]/60">
                      <CoagroSimboloCasinha className="w-6 h-6" />
                    </div>
                  </div>
                ) : avatarMode === 'PERSON' ? (
                  <div className="flex flex-col items-center text-gray-300">
                    <User className="w-14 h-14 stroke-1" />
                    <span className="text-[9px] font-exo2 font-bold uppercase text-gray-400 mt-1">Carregue a foto</span>
                  </div>
                ) : (
                  <div className="w-full h-full bg-[#004d40] flex flex-col items-center justify-center p-3 text-center">
                    <CoagroSimboloCasinha className="w-14 h-14" />
                    <span className="font-exo2 font-black text-lg text-[#ffab00] mt-1 leading-none">COAGRO</span>
                    <span className="text-[8.5px] font-bold text-white uppercase tracking-wider mt-1 leading-tight font-exo2 px-2">
                      {avatarDeptName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadAvatar}
              className="py-2.5 px-6 bg-[#004d40] hover:bg-[#00382e] text-white rounded-xl text-xs font-bold font-exo2 uppercase tracking-wide flex items-center gap-2 transition active:scale-95 shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#ffab00]" />
              Baixar Avatar (PNG 500x500px)
            </button>
          </div>
        </div>
      </section>

      {/* 3. FUNDOS OFICIAIS PARA VIDEOCONFERÊNCIA COM A CASINHA COAGRO (MEET / TEAMS) */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="text-base sm:text-lg font-black text-gray-900 font-exo2 uppercase tracking-wide flex items-center gap-2">
            <Video className="w-5 h-5 text-[#004d40]" />
            Fundos Oficiais para Videoconferência com a Casinha Coagro (1920x1080)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            4 modelos Full HD (16:9) padronizados com a casinha oficial e a identidade institucional da Coagro.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Modelo 1: Azul Titular Coagro Oficial */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex flex-col justify-between">
            <div className="h-28 bg-gradient-to-br from-[#001C71] via-[#0b2b8a] to-[#001247] p-3.5 flex flex-col justify-between relative overflow-hidden">
              <span className="text-[9px] font-mono text-sky-200 z-10">FHD • 1920x1080</span>
              <div className="z-10 flex flex-col items-center justify-center self-center my-auto">
                <CoagroSimboloCasinha className="w-7 h-7 drop-shadow-md" />
                <span className="font-exo2 font-black text-xs text-white tracking-wider mt-0.5">COAGRO</span>
                <span className="text-[7px] font-bold text-[#ffab00] uppercase tracking-wider">Grupo Coagro</span>
              </div>
              <span className="text-[8px] font-mono text-sky-300/70 z-10 self-end">Azul Titular Oficial</span>
            </div>
            <div className="p-3 space-y-2">
              <h4 className="text-xs font-bold text-gray-800 font-exo2 uppercase">1. Azul Titular Coagro</h4>
              <p className="text-[10px] text-gray-500">Azul oficial #001C71 com a logomarca vertical e casinha no topo para reuniões e diretoria.</p>
              <button
                type="button"
                onClick={() => handleDownloadWallpaper('azul_titular', 'Azul Titular Coagro')}
                className="w-full py-1.5 bg-[#001C71] hover:bg-[#001452] text-white rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#ffab00]" />
                Baixar Fundo FHD
              </button>
            </div>
          </div>

          {/* Modelo 2: Campo Tecnológico (Agro Tech) */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex flex-col justify-between">
            <div className="h-28 bg-gradient-to-br from-[#00382e] via-[#004d40] to-[#022c24] p-3.5 flex flex-col justify-between relative overflow-hidden">
              <span className="text-[9px] font-mono text-emerald-200 z-10">FHD • 1920x1080</span>
              <div className="z-10 flex items-center gap-2 self-end">
                <CoagroSimboloCasinha className="w-6 h-6" />
                <span className="font-exo2 font-black text-sm text-[#ffab00]">AGRO TECH</span>
              </div>
              <span className="text-[8px] font-mono text-emerald-300/70 z-10 self-end">Tecnologia no Campo</span>
            </div>
            <div className="p-3 space-y-2">
              <h4 className="text-xs font-bold text-gray-800 font-exo2 uppercase">2. Campo Tecnológico</h4>
              <p className="text-[10px] text-gray-500">Identidade agropecuária com linhas de inovação para consultores e engenheiros.</p>
              <button
                type="button"
                onClick={() => handleDownloadWallpaper('agro_tech', 'Campo Tecnológico')}
                className="w-full py-1.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#ffab00]" />
                Baixar Fundo FHD
              </button>
            </div>
          </div>

          {/* Modelo 3: Verde Safra Institucional Oficial */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex flex-col justify-between">
            <div className="h-28 bg-[#004d40] p-3.5 flex flex-col justify-between relative overflow-hidden">
              <span className="text-[9px] font-mono text-emerald-200/80 z-10">FHD • 1920x1080</span>
              <div className="z-10 flex flex-col items-center justify-center self-center my-auto">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center p-1 backdrop-blur-xs border border-white/10">
                  <CoagroSimboloCasinha className="w-full h-full" />
                </div>
                <span className="font-exo2 font-black text-xs text-white mt-1">COAGRO</span>
              </div>
              <span className="text-[8px] font-mono text-white/70 z-10 self-end">Verde Safra Oficial</span>
            </div>
            <div className="p-3 space-y-2">
              <h4 className="text-xs font-bold text-gray-800 font-exo2 uppercase">3. Verde Institucional</h4>
              <p className="text-[10px] text-gray-500">Verde oficial #004d40 com o símbolo da Casinha Coagro em alta resolução e acento ouro.</p>
              <button
                type="button"
                onClick={() => handleDownloadWallpaper('verde_institucional', 'Verde Safra Institucional')}
                className="w-full py-1.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#ffab00]" />
                Baixar Fundo FHD
              </button>
            </div>
          </div>

          {/* Modelo 4: Sala Clean / Escritório Executivo (com Quadro Coagro) */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex flex-col justify-between">
            <div className="h-28 bg-gradient-to-b from-slate-100 to-slate-200 p-3.5 flex flex-col justify-between relative overflow-hidden border-b-2 border-slate-300">
              <span className="text-[9px] font-mono text-slate-500 z-10">FHD • 1920x1080</span>
              <div className="z-10 self-center my-auto flex items-center justify-center">
                {/* Quadro elegante na parede */}
                <div className="bg-[#1e293b] p-1 rounded-sm shadow-md border border-slate-300">
                  <div className="bg-white p-1 rounded-2xs flex flex-col items-center">
                    <div className="bg-[#004d40] px-2.5 py-1 rounded-2xs flex items-center gap-1">
                      <CoagroSimboloCasinha className="w-3.5 h-3.5" />
                      <span className="font-exo2 font-black text-[8px] text-white">COAGRO</span>
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-[8px] font-mono text-slate-500 z-10 self-end">Sala Clean Corporativa</span>
            </div>
            <div className="p-3 space-y-2">
              <h4 className="text-xs font-bold text-gray-800 font-exo2 uppercase">4. Sala Executiva Clean</h4>
              <p className="text-[10px] text-gray-500">Ambiente executivo clean e iluminado com elegante quadro institucional da Coagro na parede.</p>
              <button
                type="button"
                onClick={() => handleDownloadWallpaper('sala_clean', 'Sala Executiva Clean')}
                className="w-full py-1.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#ffab00]" />
                Baixar Fundo FHD
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MODELO DE APRESENTAÇÃO INSTITUCIONAL (.PPT) */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 font-exo2 uppercase tracking-wide flex items-center gap-2">
              <Presentation className="w-5 h-5 text-[#004d40]" />
              Modelo Oficial de Apresentação Corporativa (PowerPoint)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Arquivo estruturado para PowerPoint com lâminas de Capa Institucional, Estrutura das 12 Lojas e Fechamento Comercial.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadPptxTemplate}
            className="px-5 py-2.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-xl text-xs font-bold font-exo2 uppercase tracking-wide flex items-center gap-2 transition active:scale-95 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#ffab00]" />
            Baixar Template PowerPoint (.PPT)
          </button>
        </div>
      </section>
    </div>
  );
};
