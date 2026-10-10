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
  const [sigPhoto, setSigPhoto] = useState<string | null>(null);
  const sigPhotoInputRef = useRef<HTMLInputElement>(null);

  const selectedStore = COAGRO_STORES.find(s => s.id === sigStoreId) || COAGRO_STORES[0];

  // --- 2. Estado do Avatar de WhatsApp ---
  const [avatarMode, setAvatarMode] = useState<'PERSON' | 'DEPT'>('PERSON');
  const [avatarPersonPhoto, setAvatarPersonPhoto] = useState<string | null>(null);
  const [avatarDeptName, setAvatarDeptName] = useState('Atendimento Loja');
  const avatarPhotoInputRef = useRef<HTMLInputElement>(null);

  const handleCopyEmailSignature = async () => {
    try {
      const signatureHtml = `
        <table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; color: #1f2937; font-size: 13px; line-height: 1.45; border-collapse: collapse;">
          <tr>
            ${sigPhoto ? `
            <td style="padding-right: 16px; vertical-align: middle;">
              <img src="${sigPhoto}" alt="${sigName}" width="68" height="68" style="width: 68px; height: 68px; border-radius: 50%; object-fit: cover; display: block; border: 2px solid #004d40;" />
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

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPersonPhoto(reader.result as string);
        onShowNotice('✅ Foto do consultor aplicada no avatar!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSigPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSigPhoto(reader.result as string);
        onShowNotice('✅ Foto do colaborador inserida na assinatura!');
      };
      reader.readAsDataURL(file);
    }
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

  const handleDownloadWallpaper = (title: string, bgColor: string, textColor: string, isBlue = false) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fundo
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 1920, 1080);

    // Efeito de vinheta ou textura suave
    const grad = ctx.createRadialGradient(960, 540, 100, 960, 540, 900);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1920, 1080);

    // Texto de apoio
    ctx.fillStyle = textColor;
    ctx.font = 'bold 32px "Arial"';
    ctx.textAlign = 'right';
    ctx.fillText('GRUPO COAGRO', 1840, 1000);
    ctx.font = '20px "Arial"';
    ctx.fillStyle = '#ffab00';
    ctx.fillText('www.grupocoagro.com.br', 1840, 1030);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Fundo_Videoconferencia_${title.replace(/[^a-zA-Z0-9]/g, '_')}_1920x1080.png`;
    link.href = dataUrl;
    link.click();
    onShowNotice(`✅ Fundo de videoconferência "${title}" baixado (1920x1080)!`);
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
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Foto do Colaborador (Opcional)</label>
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
                  {sigPhoto ? 'Trocar Foto' : 'Inserir Foto'}
                </button>
                {sigPhoto && (
                  <button
                    type="button"
                    onClick={() => setSigPhoto(null)}
                    className="text-[11px] text-rose-600 hover:underline font-bold"
                  >
                    Remover Foto
                  </button>
                )}
              </div>
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
                {sigPhoto && (
                  <img
                    src={sigPhoto}
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
            Padroniza os números comerciais da Coagro com a casinha oficial da marca, suportando foto do consultor ou avatar setorial.
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
                  Carregue a foto do colaborador. A foto será enquadrada com o aro ouro e verde e a <strong>Casinha Coagro oficial</strong> como insígnia institucional.
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
                    Carregar Foto do Consultor
                  </button>
                  {avatarPersonPhoto && (
                    <button
                      type="button"
                      onClick={() => setAvatarPersonPhoto(null)}
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
                {avatarMode === 'PERSON' && avatarPersonPhoto ? (
                  <div className="w-full h-full relative">
                    <img src={avatarPersonPhoto} alt="Consultor" className="w-full h-full object-cover" />
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
          {/* Modelo 1: Escritório Corporativo */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex flex-col justify-between">
            <div className="h-28 bg-gradient-to-br from-slate-900 via-zinc-900 to-black p-3.5 flex flex-col justify-between relative overflow-hidden">
              <span className="text-[9px] font-mono text-gray-400 z-10">FHD • 1920x1080</span>
              <div className="z-10 flex items-center gap-2 self-end">
                <CoagroSimboloCasinha className="w-6 h-6" />
                <span className="font-exo2 font-black text-sm text-white">COAGRO</span>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <h4 className="text-xs font-bold text-gray-800 font-exo2 uppercase">1. Escritório Executivo</h4>
              <p className="text-[10px] text-gray-500">Fundo sóbrio escuro com a Casinha Coagro para reuniões de diretoria.</p>
              <button
                type="button"
                onClick={() => handleDownloadWallpaper('Escritorio_Executivo', '#0f172a', '#ffffff')}
                className="w-full py-1.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#ffab00]" />
                Baixar Fundo FHD
              </button>
            </div>
          </div>

          {/* Modelo 2: Campo Tecnológico */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex flex-col justify-between">
            <div className="h-28 bg-gradient-to-br from-[#00382e] via-[#004d40] to-[#022c24] p-3.5 flex flex-col justify-between relative overflow-hidden">
              <span className="text-[9px] font-mono text-emerald-200 z-10">FHD • 1920x1080</span>
              <div className="z-10 flex items-center gap-2 self-end">
                <CoagroSimboloCasinha className="w-6 h-6" />
                <span className="font-exo2 font-black text-sm text-[#ffab00]">AGRO TECH</span>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <h4 className="text-xs font-bold text-gray-800 font-exo2 uppercase">2. Campo Tecnológico</h4>
              <p className="text-[10px] text-gray-500">Identidade agropecuária de inovação para engenheiros e consultores.</p>
              <button
                type="button"
                onClick={() => handleDownloadWallpaper('Campo_Tecnologico', '#004d40', '#ffab00')}
                className="w-full py-1.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#ffab00]" />
                Baixar Fundo FHD
              </button>
            </div>
          </div>

          {/* Modelo 3: Verde Institucional com a Casinha Coagro */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex flex-col justify-between">
            <div className="h-28 bg-[#004d40] p-3.5 flex flex-col justify-between relative">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center p-1">
                <CoagroSimboloCasinha className="w-full h-full" />
              </div>
              <span className="text-[9px] font-mono text-white/80 self-end">Verde Safra Oficial</span>
            </div>
            <div className="p-3 space-y-2">
              <h4 className="text-xs font-bold text-gray-800 font-exo2 uppercase">3. Verde Institucional</h4>
              <p className="text-[10px] text-gray-500">Verde oficial #004d40 com o símbolo da casinha em alta definição.</p>
              <button
                type="button"
                onClick={() => handleDownloadWallpaper('Verde_Institucional_Casinha', '#004d40', '#ffffff')}
                className="w-full py-1.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#ffab00]" />
                Baixar Fundo FHD
              </button>
            </div>
          </div>

          {/* Modelo 4: Azul Coagro Institucional */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex flex-col justify-between">
            <div className="h-28 bg-gradient-to-br from-[#001C71] via-[#0b2b8a] to-[#001247] p-3.5 flex flex-col justify-between relative">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center p-1">
                <CoagroSimboloCasinhaBranca className="w-full h-full" />
              </div>
              <span className="text-[9px] font-mono text-sky-200 self-end">Azul Titular Coagro</span>
            </div>
            <div className="p-3 space-y-2">
              <h4 className="text-xs font-bold text-gray-800 font-exo2 uppercase">4. Azul Coagro</h4>
              <p className="text-[10px] text-gray-500">Azul corporativo da marca com o símbolo branco monocromático.</p>
              <button
                type="button"
                onClick={() => handleDownloadWallpaper('Azul_Coagro_Oficial', '#001C71', '#4897D0', true)}
                className="w-full py-1.5 bg-[#001C71] hover:bg-[#001452] text-white rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition cursor-pointer"
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
