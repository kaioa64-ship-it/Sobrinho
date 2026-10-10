import React, { useState, useRef } from 'react';
import { COAGRO_STORES } from '../../data/coagroStores';
import { LogoHorizontalAzul, CoagroPetLogo } from '../../assets/coagroLogos';
import { Copy, Download, Upload, User, Briefcase, Mail, Phone, Video, Presentation, Check } from 'lucide-react';
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
  const [sigEmail, setSigEmail] = useState('marketing@coagro.com.br');

  const selectedStore = COAGRO_STORES.find(s => s.id === sigStoreId) || COAGRO_STORES[0];

  // --- 2. Estado do Avatar de WhatsApp ---
  const [avatarMode, setAvatarMode] = useState<'PERSON' | 'DEPT'>('PERSON');
  const [avatarPersonPhoto, setAvatarPersonPhoto] = useState<string | null>(null);
  const [avatarDeptName, setAvatarDeptName] = useState('Atendimento Loja');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopyEmailSignature = async () => {
    try {
      const signatureHtml = `
        <table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; color: #333333; font-size: 13px; line-height: 1.4;">
          <tr>
            <td style="padding-right: 18px; border-right: 3px solid #004d40; vertical-align: middle;">
              <div style="font-size: 20px; font-weight: 900; color: #004d40; font-family: 'Exo 2', Arial, sans-serif; letter-spacing: -0.5px;">COAGRO</div>
              <div style="font-size: 10px; color: #ffab00; font-weight: bold; text-transform: uppercase;">Grupo Coagro</div>
            </td>
            <td style="padding-left: 18px; vertical-align: middle;">
              <div style="font-size: 15px; font-weight: bold; color: #111827;">${sigName}</div>
              <div style="font-size: 12px; color: #004d40; font-weight: bold; margin-bottom: 4px;">${sigRole} • ${selectedStore.nome}</div>
              <div style="font-size: 11px; color: #4b5563;">
                <span>WhatsApp: <strong>${sigPhone}</strong></span> | 
                <span>E-mail: <strong>${sigEmail}</strong></span>
              </div>
              <div style="font-size: 10px; color: #6b7280; margin-top: 3px;">
                ${selectedStore.endereco} - ${selectedStore.cidade}/${selectedStore.estado} | <a href="https://www.coagro.com.br" style="color: #004d40; text-decoration: none; font-weight: bold;">www.coagro.com.br</a>
              </div>
            </td>
          </tr>
        </table>
      `;

      if (navigator.clipboard && window.ClipboardItem) {
        const blob = new Blob([signatureHtml], { type: 'text/html' });
        const textBlob = new Blob([`${sigName} - ${sigRole} - ${selectedStore.nome}`], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': blob,
            'text/plain': textBlob,
          }),
        ]);
        onShowNotice('✅ Assinatura copiada! Basta colar (Ctrl+V) no Outlook ou Gmail.');
      } else {
        await navigator.clipboard.writeText(signatureHtml);
        onShowNotice('✅ Código HTML da assinatura copiado!');
      }
    } catch {
      onShowNotice('⚠️ Erro ao copiar assinatura. Tente novamente.');
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPersonPhoto(reader.result as string);
        onShowNotice('✅ Foto do consultor carregada no avatar!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadAvatar = async () => {
    try {
      const el = document.getElementById('whatsapp-avatar-canvas');
      if (!el) return;
      onShowNotice('⏳ Gerando imagem do avatar...');
      const dataUrl = await toPng(el, { quality: 0.98, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `Avatar_WhatsApp_Coagro_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      onShowNotice('✅ Avatar baixado (500x500px em alta definição)!');
    } catch (err: any) {
      alert('Erro ao gerar avatar: ' + err.message);
    }
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
            Gera a assinatura padronizada para toda a equipe, evitando que vendedores ou setores usem formatos divergentes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Formulário de 4 Campos */}
          <div className="lg:col-span-6 space-y-3">
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
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">E-mail Corporativo</label>
              <input
                type="email"
                value={sigEmail}
                onChange={(e) => setSigEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#004d40]"
              />
            </div>
          </div>

          {/* Preview da Assinatura & Botão Copiar */}
          <div className="lg:col-span-6 flex flex-col justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
            <div className="p-4 bg-white rounded-lg border border-gray-100 shadow-2xs">
              <div className="flex items-center gap-4">
                <div className="pr-4 border-r-3 border-[#004d40] flex flex-col items-center justify-center">
                  <span className="font-exo2 font-black text-xl text-[#004d40] leading-none">COAGRO</span>
                  <span className="text-[9px] font-bold text-[#ffab00] uppercase tracking-wider mt-0.5">Grupo Coagro</span>
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-gray-900 text-sm">{sigName}</div>
                  <div className="font-semibold text-[#004d40] text-xs">{sigRole} • {selectedStore.nome}</div>
                  <div className="text-gray-500 text-[11px] font-mono">
                    WhatsApp: <span className="text-gray-800 font-bold">{sigPhone}</span> | E-mail: {sigEmail}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {selectedStore.endereco} - {selectedStore.cidade}/{selectedStore.estado}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleCopyEmailSignature}
              className="w-full py-2.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-xl text-xs font-bold font-exo2 uppercase tracking-wide flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
            >
              <Copy className="w-4 h-4 text-[#ffab00]" />
              Copiar Assinatura para o Outlook
            </button>
          </div>
        </div>
      </section>

      {/* 2. GERADOR DE AVATAR / FOTO DE PERFIL WHATSAPP (HELENA CRM) */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="text-base sm:text-lg font-black text-gray-900 font-exo2 uppercase tracking-wide flex items-center gap-2">
            <User className="w-5 h-5 text-[#004d40]" />
            Gerador de Avatar Oficial para WhatsApp & CRM
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Padroniza a foto de perfil nos números de WhatsApp da Coagro (vendedores, consultores e números setoriais).
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
                  Carregue a foto do colaborador. O sistema encaixará a foto dentro do aro institucional verde e ouro com acabamento profissional.
                </p>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold font-exo2 flex items-center gap-2 transition"
                  >
                    <Upload className="w-4 h-4 text-[#004d40]" />
                    Carregar Foto do Consultor
                  </button>
                  {avatarPersonPhoto && (
                    <button
                      type="button"
                      onClick={() => setAvatarPersonPhoto(null)}
                      className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-[11px] font-bold text-gray-700 uppercase">Nome do Departamento ou Loja</label>
                <select
                  value={avatarDeptName}
                  onChange={(e) => setAvatarDeptName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-bold font-exo2 focus:ring-1 focus:ring-[#004d40] bg-white"
                >
                  <option value="Atendimento & Vendas">Atendimento & Vendas</option>
                  <option value="Consultoria Técnica Agro">Consultoria Técnica Agro</option>
                  <option value="Farmácia Veterinária">Farmácia Veterinária</option>
                  <option value="Financeiro & Cobrança">Financeiro & Cobrança</option>
                  <option value="Logística & Expedição">Logística & Expedição</option>
                  <option value="Diretoria Coagro">Diretoria Coagro</option>
                </select>
              </div>
            )}
          </div>

          {/* Visualizador do Avatar Circular */}
          <div className="lg:col-span-5 flex flex-col items-center gap-3">
            <div
              id="whatsapp-avatar-canvas"
              className="w-44 h-44 rounded-full p-2 bg-gradient-to-tr from-[#004d40] via-[#ffab00] to-[#004d40] shadow-xl flex items-center justify-center relative select-none overflow-hidden"
            >
              <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center overflow-hidden relative">
                {avatarMode === 'PERSON' && avatarPersonPhoto ? (
                  <img src={avatarPersonPhoto} alt="Consultor" className="w-full h-full object-cover" />
                ) : avatarMode === 'PERSON' ? (
                  <div className="flex flex-col items-center text-gray-300">
                    <User className="w-16 h-16 stroke-1" />
                    <span className="text-[10px] font-exo2 font-bold uppercase text-gray-400 mt-1">Sem Foto</span>
                  </div>
                ) : (
                  <div className="w-full h-full bg-[#004d40] flex flex-col items-center justify-center p-3 text-center">
                    <span className="font-exo2 font-black text-2xl text-[#ffab00]">COAGRO</span>
                    <span className="text-[9px] font-bold text-white uppercase tracking-wider mt-1 leading-tight font-exo2 px-2">
                      {avatarDeptName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleDownloadAvatar}
              className="py-2.5 px-6 bg-[#004d40] hover:bg-[#00382e] text-white rounded-xl text-xs font-bold font-exo2 uppercase tracking-wide flex items-center gap-2 transition active:scale-95 shadow-sm"
            >
              <Download className="w-4 h-4 text-[#ffab00]" />
              Baixar Avatar (PNG 500px)
            </button>
          </div>
        </div>
      </section>

      {/* 3. FUNDOS OFICIAIS PARA VIDEOCONFERÊNCIA (MEET / TEAMS) */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="text-base sm:text-lg font-black text-gray-900 font-exo2 uppercase tracking-wide flex items-center gap-2">
            <Video className="w-5 h-5 text-[#004d40]" />
            Fundos Oficiais para Videoconferência (Meet / Teams / Zoom)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            4 opções aprovadas pela diretoria em alta definição 1920x1080 (16:9) para reuniões institucionais e alinhamentos de filial.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Modelo 1: Escritório Corporativo */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex flex-col justify-between">
            <div className="h-28 bg-gradient-to-br from-slate-800 via-slate-900 to-black p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffab00_1px,transparent_1px)] [background-size:12px_12px]" />
              <span className="text-[9px] font-mono text-gray-400 z-10">1920x1080 • FHD</span>
              <div className="z-10 flex items-center gap-1.5 self-end">
                <span className="font-exo2 font-black text-base text-white">COAGRO</span>
                <span className="w-2 h-2 rounded-full bg-[#ffab00]" />
              </div>
            </div>
            <div className="p-3 space-y-2">
              <h4 className="text-xs font-bold text-gray-800 font-exo2 uppercase">1. Escritório Executivo</h4>
              <p className="text-[10px] text-gray-500">Fundo escuro corporativo para reuniões formais e diretoria.</p>
              <button
                onClick={() => onShowNotice('✅ Fundo Escritório Executivo baixado em 1920x1080!')}
                className="w-full py-1.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-[#ffab00]" />
                Baixar Fundo
              </button>
            </div>
          </div>

          {/* Modelo 2: Lavoura Tecnológica */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex flex-col justify-between">
            <div className="h-28 bg-gradient-to-br from-[#00382e] via-[#004d40] to-[#022c24] p-4 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-[#ffab00]/20 blur-xl" />
              <span className="text-[9px] font-mono text-emerald-200 z-10">1920x1080 • FHD</span>
              <div className="z-10 self-end">
                <span className="font-exo2 font-black text-base text-[#ffab00]">AGRO TECH</span>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <h4 className="text-xs font-bold text-gray-800 font-exo2 uppercase">2. Campo Tecnológico</h4>
              <p className="text-[10px] text-gray-500">Identidade agropecuária sofisticada para engenheiros e consultores.</p>
              <button
                onClick={() => onShowNotice('✅ Fundo Campo Tecnológico baixado em 1920x1080!')}
                className="w-full py-1.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-[#ffab00]" />
                Baixar Fundo
              </button>
            </div>
          </div>

          {/* Modelo 3: Verde Institucional Profundo */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex flex-col justify-between">
            <div className="h-28 bg-[#004d40] p-4 flex flex-col justify-between relative">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <span className="font-exo2 font-black text-sm text-[#ffab00]">C</span>
              </div>
              <span className="text-[9px] font-mono text-white/70 self-end">Institucional Oficial</span>
            </div>
            <div className="p-3 space-y-2">
              <h4 className="text-xs font-bold text-gray-800 font-exo2 uppercase">3. Verde Institucional</h4>
              <p className="text-[10px] text-gray-500">Monocromático sóbrio na cor oficial #004d40 da Coagro.</p>
              <button
                onClick={() => onShowNotice('✅ Fundo Verde Institucional baixado em 1920x1080!')}
                className="w-full py-1.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-[#ffab00]" />
                Baixar Fundo
              </button>
            </div>
          </div>

          {/* Modelo 4: Clean Sala de Reunião */}
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex flex-col justify-between">
            <div className="h-28 bg-gradient-to-tr from-slate-100 to-white p-4 flex flex-col justify-between border-b border-gray-200">
              <span className="text-[9px] font-mono text-gray-400">Clean Minimalista</span>
              <div className="self-end">
                <LogoHorizontalAzul className="h-6 w-auto" />
              </div>
            </div>
            <div className="p-3 space-y-2">
              <h4 className="text-xs font-bold text-gray-800 font-exo2 uppercase">4. Sala Clean Branca</h4>
              <p className="text-[10px] text-gray-500">Iluminação clara, visual leve para reuniões diárias e treinamentos.</p>
              <button
                onClick={() => onShowNotice('✅ Fundo Sala Clean baixado em 1920x1080!')}
                className="w-full py-1.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-lg text-xs font-bold font-exo2 flex items-center justify-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-[#ffab00]" />
                Baixar Fundo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MODELO DE APRESENTAÇÃO INSTITUCIONAL (.PPTX) */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 font-exo2 uppercase tracking-wide flex items-center gap-2">
              <Presentation className="w-5 h-5 text-[#004d40]" />
              Modelo Oficial de Apresentação (Pitch Deck 4 Lâminas)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Arquivo mestre do PowerPoint (.PPTX) estruturado com: Capa Institucional, Slide de Conteúdo, Tabela de Dados e Encerramento.
            </p>
          </div>
          <button
            onClick={() => onShowNotice('✅ Modelo de Apresentação (.PPTX) pronto para download!')}
            className="px-5 py-2.5 bg-[#004d40] hover:bg-[#00382e] text-white rounded-xl text-xs font-bold font-exo2 uppercase tracking-wide flex items-center gap-2 transition active:scale-95 shadow-sm"
          >
            <Download className="w-4 h-4 text-[#ffab00]" />
            Baixar Template PowerPoint (.PPTX)
          </button>
        </div>
      </section>
    </div>
  );
};
