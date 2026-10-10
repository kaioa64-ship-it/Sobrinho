import React, { useState } from 'react';
import { COAGRO_STORES, COAGRO_CORPORATE_INFO, CoagroStore } from '../../data/coagroStores';
import { LogoHorizontalAzul, CoagroPetLogo } from '../../assets/coagroLogos';
import { Printer, FileText, Download, Building2, MapPin, Phone, FileCheck, Check } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface OfficialDocumentsTabProps {
  scope: 'AGRO' | 'PET';
  onShowNotice: (msg: string) => void;
}

export const OfficialDocumentsTab: React.FC<OfficialDocumentsTabProps> = ({ scope, onShowNotice }) => {
  const isPet = scope === 'PET';
  const [selectedStoreId, setSelectedStoreId] = useState<string>('bananeira');
  const [docMode, setDocMode] = useState<'BLANK' | 'NOTICE'>('NOTICE');

  // Dados do comunicado rápido
  const [docTitle, setDocTitle] = useState('COMUNICADO OFICIAL DE FILIAL');
  const [docRecipient, setDocRecipient] = useState('Aos Clientes, Produtores e Parceiros Comerciais');
  const [docBody, setDocBody] = useState(
    'Informamos que, devido ao período de safra e alta demanda de plantio na região, a nossa equipe técnica e o atendimento de balcão estarão operando em regime de plantão especial.\n\nPara cotações diretas de defensivos, sementes e nutrição vegetal, favor entrar em contato diretamente com a nossa gerência através do WhatsApp oficial informado no rodapé deste documento.'
  );
  const [docSigner, setDocSigner] = useState('Gerência de Filial • Grupo Coagro');

  const selectedStore = COAGRO_STORES.find(s => s.id === selectedStoreId) || COAGRO_STORES[0];

  const corporateUnits = COAGRO_STORES.filter(s => s.tipo === 'corporativo');
  const storeBranches = COAGRO_STORES.filter(s => s.tipo !== 'corporativo');

  const handlePrintDocument = async () => {
    try {
      const el = document.getElementById('official-letterhead-canvas');
      if (!el) {
        onShowNotice('⚠️ Documento não encontrado para impressão.');
        return;
      }
      onShowNotice('🖨️ Preparando folha A4 em alta definição para impressão...');
      const dataUrl = await toPng(el, { quality: 1, pixelRatio: 3, cacheBust: true });

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
      if (!frameDoc || !iframe.contentWindow) return;

      frameDoc.open();
      frameDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Papel Timbrado - ${selectedStore.nome}</title>
            <style>
              @page { size: A4 portrait; margin: 0; }
              html, body { margin: 0; padding: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #fff; }
              img { width: 100vw; height: 100vh; object-fit: contain; }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" />
          </body>
        </html>
      `);
      frameDoc.close();

      const img = frameDoc.querySelector('img');
      const trigger = () => {
        setTimeout(() => {
          iframe?.contentWindow?.focus();
          iframe?.contentWindow?.print();
        }, 150);
      };
      if (img && !img.complete) {
        img.onload = trigger;
      } else {
        trigger();
      }
    } catch (err: any) {
      alert('Erro ao imprimir documento: ' + err.message);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const el = document.getElementById('official-letterhead-canvas');
      if (!el) return;
      onShowNotice('⏳ Gerando PDF em 300 DPI alta resolução...');
      // pixelRatio 3 garante 2480x3508px (resolução gráfica 300 DPI exata para A4)
      const dataUrl = await toPng(el, { quality: 1, pixelRatio: 3, cacheBust: true });
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
      const filename = `Papel_Timbrado_${selectedStore.id}_${Date.now()}.pdf`;
      pdf.save(filename);
      onShowNotice(`✅ PDF em alta resolução baixado (${filename})`);
    } catch (err: any) {
      alert('Erro ao gerar PDF: ' + err.message);
    }
  };

  const handleDownloadWordDocx = () => {
    const htmlWord = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Papel Timbrado Oficial - ${selectedStore.nome}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page { size: 21.0cm 29.7cm; margin: 2.0cm 2.0cm 2.0cm 2.0cm; }
          body { font-family: 'Arial', sans-serif; color: #1f2937; line-height: 1.6; }
          .header-table { width: 100%; border-bottom: 2.5pt solid #004d40; padding-bottom: 12pt; margin-bottom: 25pt; }
          .logo-cell { vertical-align: middle; width: 45%; }
          .logo-title { font-size: 20pt; font-weight: 900; color: #004d40; letter-spacing: -0.5pt; margin: 0; }
          .logo-sub { font-size: 9pt; font-weight: bold; color: #ffab00; text-transform: uppercase; margin-top: 2pt; }
          .info-cell { vertical-align: middle; text-align: right; font-size: 9pt; color: #4b5563; line-height: 1.35; }
          .store-name { color: #004d40; font-size: 11pt; font-weight: bold; }
          .content-area { min-height: 520pt; font-size: 11pt; line-height: 1.6; color: #111827; }
          .footer-table { width: 100%; border-top: 1pt solid #d1d5db; padding-top: 10pt; margin-top: 30pt; font-size: 8.5pt; color: #6b7280; }
        </style>
      </head>
      <body>
        <table class='header-table' cellpadding='0' cellspacing='0'>
          <tr>
            <td class='logo-cell'>
              <div class='logo-title'>GRUPO COAGRO</div>
              <div class='logo-sub'>Papel Timbrado Corporativo</div>
            </td>
            <td class='info-cell'>
              <div class='store-name'>${selectedStore.nome.toUpperCase()}</div>
              <div>${selectedStore.razaoSocial} | CNPJ: <strong>${selectedStore.cnpj}</strong></div>
              <div>${selectedStore.endereco}</div>
              <div>${selectedStore.cidade} - ${selectedStore.estado} • CEP: ${selectedStore.cep}</div>
              <div>Telefone / WhatsApp: <strong>${selectedStore.telefoneFormatado}</strong></div>
            </td>
          </tr>
        </table>

        <div class='content-area'>
          ${docMode === 'NOTICE' ? `
            <h2 style='font-size: 14pt; color: #111827; text-transform: uppercase; margin-bottom: 4pt;'>${docTitle}</h2>
            <p style='font-size: 10pt; color: #6b7280; font-weight: bold; margin-bottom: 18pt;'>${docRecipient}</p>
            <div style='font-size: 11pt; color: #374151; white-space: pre-wrap; line-height: 1.6;'>${docBody}</div>
            <div style='margin-top: 40pt; text-align: center;'>
              <div style='width: 220pt; border-top: 1pt solid #9ca3af; margin: 0 auto 6pt auto;'></div>
              <div style='font-size: 10pt; font-weight: bold; text-transform: uppercase; color: #111827;'>${docSigner}</div>
              <div style='font-size: 9pt; color: #6b7280;'>${selectedStore.cidade}/${selectedStore.estado} • Grupo Coagro</div>
            </div>
          ` : `
            <p style='color: #9ca3af; font-style: italic;'>[Digite aqui o conteúdo do seu ofício, laudo técnico, relatório ou contrato...]</p>
          `}
        </div>

        <table class='footer-table' cellpadding='0' cellspacing='0'>
          <tr>
            <td style='color: #004d40; font-weight: bold;'>GRUPO COAGRO</td>
            <td style='text-align: right;'>${COAGRO_CORPORATE_INFO.website} • ${COAGRO_CORPORATE_INFO.instagram}</td>
          </tr>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlWord], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Modelo_Word_${selectedStore.id}_${Date.now()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    onShowNotice(`✅ Modelo oficial do Word (.DOC) baixado para ${selectedStore.nome}!`);
  };

  return (
    <div className="space-y-8 font-['Inter']">
      {/* SELETOR DE FILIAL DAS UNIDADES COAGRO */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 font-exo2 uppercase tracking-wide flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#004d40]" />
              Seletor de Unidade / Filial Oficial (Corporativo & Lojas)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Escolha a unidade para que o CNPJ correto, endereço e dados fiscais sejam sincronizados em todos os documentos.
            </p>
          </div>

          <div className="w-full sm:w-80">
            <select
              value={selectedStoreId}
              onChange={(e) => {
                setSelectedStoreId(e.target.value);
                const s = COAGRO_STORES.find(item => item.id === e.target.value);
                if (s) onShowNotice(`Unidade ativa: ${s.nome}`);
              }}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 font-exo2 focus:ring-2 focus:ring-[#004d40]"
            >
              <optgroup label="🏢 Unidades Corporativas & Centrais">
                {corporateUnits.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.nome} (CNPJ: {store.cnpj})
                  </option>
                ))}
              </optgroup>
              <optgroup label="🏬 Filiais de Loja Física">
                {storeBranches.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.nome} ({store.cidade} - {store.estado})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Card Resumo Fiscal da Loja Selecionada */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="font-exo2 font-black text-[#004d40] text-sm block">
              {selectedStore.nome}
            </span>
            <span className="text-gray-600 font-mono text-[11px]">
              Razão Social: <strong>{selectedStore.razaoSocial}</strong> • CNPJ: <strong>{selectedStore.cnpj}</strong>
            </span>
          </div>
          <div className="flex items-center gap-4 text-gray-500 text-[11px]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#004d40]" />
              {selectedStore.endereco} ({selectedStore.cidade}/{selectedStore.estado})
            </span>
            <span className="flex items-center gap-1 font-bold text-[#004d40]">
              <Phone className="w-3.5 h-3.5" />
              {selectedStore.telefoneFormatado}
            </span>
          </div>
        </div>
      </section>

      {/* ÁREA DE CRIAÇÃO E PREVIEW DO DOCUMENTO A4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Esquerda: Controles do Documento (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-gray-900 font-exo2 uppercase tracking-wide border-b border-gray-100 pb-2">
              Opções do Documento A4
            </h4>

            {/* Alternador de Modo: Folha em Branco vs Comunicado */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setDocMode('BLANK')}
                className={`py-2 text-xs font-bold font-exo2 rounded-lg transition ${
                  docMode === 'BLANK' ? 'bg-[#004d40] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Folha em Branco (Bandeja)
              </button>
              <button
                type="button"
                onClick={() => setDocMode('NOTICE')}
                className={`py-2 text-xs font-bold font-exo2 rounded-lg transition ${
                  docMode === 'NOTICE' ? 'bg-[#004d40] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Comunicado de Loja (1 pág.)
              </button>
            </div>

            {/* Campos Editáveis para Comunicado */}
            {docMode === 'NOTICE' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Título do Ofício / Comunicado</label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#004d40]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Destinatário</label>
                  <input
                    type="text"
                    value={docRecipient}
                    onChange={(e) => setDocRecipient(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-[#004d40]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Texto do Documento</label>
                  <textarea
                    rows={5}
                    value={docBody}
                    onChange={(e) => setDocBody(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-normal leading-relaxed focus:ring-1 focus:ring-[#004d40]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Assinatura / Responsável</label>
                  <input
                    type="text"
                    value={docSigner}
                    onChange={(e) => setDocSigner(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-[#004d40]"
                  />
                </div>
              </div>
            )}

            {docMode === 'BLANK' && (
              <p className="text-xs text-gray-500 italic p-3 bg-gray-50 rounded-lg border border-gray-100">
                A folha será gerada com cabeçalho oficial e rodapé institucional limpos, perfeita para imprimir em lote na loja e colocar na bandeja da impressora para uso geral.
              </p>
            )}

            {/* Botão de Download Word */}
            <div className="pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleDownloadWordDocx}
                className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded-xl text-xs font-bold font-exo2 flex items-center justify-center gap-2 transition"
              >
                <FileCheck className="w-4 h-4 text-blue-700" />
                Baixar Modelo no Microsoft Word (.DOC)
              </button>
              <span className="block text-[10px] text-gray-400 text-center mt-1">
                Abre no Microsoft Word com cabeçalho timbrado e dados fiscais da filial
              </span>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Live Preview A4 & Ações de Impressão (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center gap-4">
          <div className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider font-exo2">
            Preview do Documento A4 (210 × 297 mm)
          </div>

          {/* Canvas A4 do Documento */}
          <div
            id="official-letterhead-canvas"
            className="w-full max-w-[440px] aspect-[210/297] bg-white border border-gray-300 shadow-xl rounded-sm p-6 sm:p-8 flex flex-col justify-between text-gray-800 font-['Inter'] relative select-none"
          >
            {/* CABEÇALHO OFICIAL */}
            <header className="border-b-2 border-[#004d40] pb-3 flex items-start justify-between gap-3">
              <div className="w-32 sm:w-40">
                {isPet ? <CoagroPetLogo className="w-full h-auto" /> : <LogoHorizontalAzul className="w-full h-auto" />}
              </div>
              <div className="text-right text-[8px] sm:text-[9.5px] text-gray-600 leading-tight">
                <span className="font-exo2 font-black uppercase text-[#004d40] block text-[9px] sm:text-[11px]">
                  {selectedStore.nome}
                </span>
                <span>{selectedStore.razaoSocial}</span>
                <span className="block font-mono text-gray-500">CNPJ: {selectedStore.cnpj}</span>
                <span>{selectedStore.endereco}</span>
                <span className="block">{selectedStore.cidade} - {selectedStore.estado} • CEP: {selectedStore.cep}</span>
                <span className="text-[#004d40] font-bold">Tel/Zap: {selectedStore.telefoneFormatado}</span>
              </div>
            </header>

            {/* CORPO DO DOCUMENTO */}
            <main className="flex-1 py-4 sm:py-6 flex flex-col justify-start text-[10px] sm:text-[11.5px] leading-relaxed">
              {docMode === 'NOTICE' ? (
                <div className="space-y-3">
                  <div className="border-b border-gray-100 pb-2">
                    <h2 className="font-exo2 font-black text-sm sm:text-base text-gray-900 uppercase tracking-wide">
                      {docTitle}
                    </h2>
                    <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">
                      {docRecipient}
                    </span>
                  </div>
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {docBody}
                  </div>
                  <div className="pt-6 text-center">
                    <div className="w-40 h-px bg-gray-400 mx-auto mb-1.5" />
                    <span className="font-exo2 font-bold uppercase text-[10px] text-gray-800 block">
                      {docSigner}
                    </span>
                    <span className="text-[9px] text-gray-500">
                      {selectedStore.cidade}/{selectedStore.estado} • Grupo Coagro
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-full border border-dashed border-gray-200 rounded-lg flex items-center justify-center p-4 text-center text-gray-300">
                  <span className="text-xs uppercase font-exo2 tracking-wider">
                    Área livre para impressão de ofícios e relatórios
                  </span>
                </div>
              )}
            </main>

            {/* RODAPÉ OFICIAL LIMPO (SEM TEXTO VAREJO AGROPECUÁRIO & PET) */}
            <footer className="border-t border-gray-200 pt-2 flex items-center justify-between text-[8px] sm:text-[9px] text-gray-500">
              <span className="font-exo2 font-bold text-[#004d40]">
                GRUPO COAGRO
              </span>
              <span className="font-mono text-gray-600">{COAGRO_CORPORATE_INFO.website} • {COAGRO_CORPORATE_INFO.instagram}</span>
            </footer>
          </div>

          {/* BOTÕES DE IMPRESSÃO E PDF */}
          <div className="flex w-full max-w-[440px] gap-2 mt-1">
            <button
              onClick={handlePrintDocument}
              className="flex-1 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs sm:text-sm font-bold font-exo2 tracking-wide uppercase flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir Direto (A4)
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex-1 py-3 bg-[#004d40] hover:bg-[#00382e] text-white rounded-xl text-xs sm:text-sm font-bold font-exo2 tracking-wide uppercase flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Baixar PDF (300 DPI)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
