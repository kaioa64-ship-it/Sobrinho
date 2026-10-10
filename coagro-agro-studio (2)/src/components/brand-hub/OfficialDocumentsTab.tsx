import React, { useState } from 'react';
import { COAGRO_STORES, CoagroStore } from '../../data/coagroStores';
import { LogoHorizontalAzul, CoagroPetLogo } from '../../assets/coagroLogos';
import { Printer, FileText, Download, Building2, MapPin, Phone, FileCheck, Check } from 'lucide-react';
import { toPng, toJpeg } from 'html-to-image';
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

  const handlePrintDocument = async () => {
    try {
      const el = document.getElementById('official-letterhead-canvas');
      if (!el) {
        onShowNotice('⚠️ Documento não encontrado para impressão.');
        return;
      }
      onShowNotice('🖨️ Abrindo diálogo de impressão A4...');
      const dataUrl = await toPng(el, { quality: 0.98, pixelRatio: 2 });

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
      onShowNotice('⏳ Gerando PDF do documento oficial...');
      const dataUrl = await toJpeg(el, { quality: 0.92, pixelRatio: 1.8 });
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });
      pdf.addImage(dataUrl, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      const filename = `Papel_Timbrado_${selectedStore.id}_${Date.now()}.pdf`;
      pdf.save(filename);
      onShowNotice(`✅ PDF salvo em Downloads (${filename})`);
    } catch (err: any) {
      alert('Erro ao gerar PDF: ' + err.message);
    }
  };

  const handleDownloadWordDocx = () => {
    // Cria um arquivo HTML compatível com Word (.doc) que abre perfeitamente no Microsoft Word com cabeçalho da filial
    const htmlWord = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Papel Timbrado Oficial - ${selectedStore.nome}</title>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 40px; color: #1f2937; line-height: 1.6; }
          .header { border-bottom: 2px solid #004d40; padding-bottom: 15px; margin-bottom: 30px; }
          .header h1 { color: #004d40; font-size: 22px; margin: 0; }
          .header p { color: #6b7280; font-size: 11px; margin: 4px 0 0; }
          .content { min-height: 500px; font-size: 14px; }
          .footer { border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 40px; font-size: 10px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <div class='header'>
          <h1>GRUPO COAGRO • ${selectedStore.nome.toUpperCase()}</h1>
          <p>${selectedStore.razaoSocial} | CNPJ: ${selectedStore.cnpj} | Tel: ${selectedStore.telefoneFormatado}</p>
          <p>${selectedStore.endereco} - ${selectedStore.cidade}/${selectedStore.estado} - CEP: ${selectedStore.cep}</p>
        </div>
        <div class='content'>
          <p><strong>[DIGITE O CONTEÚDO DO SEU OFÍCIO OU RELATÓRIO AQUI]</strong></p>
        </div>
        <div class='footer'>
          <p>Grupo Coagro • Nutrição, Defensivos, Veterinária e Serviços Agropecuários | www.coagro.com.br</p>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlWord], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Modelo_Word_Timbrado_${selectedStore.id}.doc`;
    a.click();
    URL.revokeObjectURL(url);
    onShowNotice(`✅ Modelo do Word baixado para ${selectedStore.nome}!`);
  };

  return (
    <div className="space-y-8 font-['Inter']">
      {/* SELETOR DE FILIAL DAS 12 LOJAS */}
      <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 font-exo2 uppercase tracking-wide flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#004d40]" />
              Seletor de Unidade / Filial Oficial (12 Lojas Ativas)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Escolha a filial para que o CNPJ, endereço e canais fiscais corretos sejam injetados em todos os documentos.
            </p>
          </div>

          <div className="w-full sm:w-72">
            <select
              value={selectedStoreId}
              onChange={(e) => {
                setSelectedStoreId(e.target.value);
                const s = COAGRO_STORES.find(item => item.id === e.target.value);
                if (s) onShowNotice(`Unidade ativa: ${s.nome}`);
              }}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 font-exo2 focus:ring-2 focus:ring-[#004d40]"
            >
              {COAGRO_STORES.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.nome} ({store.cidade} - {store.estado})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Card Resumo da Filial Selecionada */}
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-exo2 font-black uppercase text-[#004d40] text-[13px]">
              {selectedStore.nome} — {selectedStore.razaoSocial}
            </span>
            <div className="text-gray-600 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
              <span><strong>CNPJ:</strong> {selectedStore.cnpj}</span>
              <span><strong>Endereço:</strong> {selectedStore.endereco}, {selectedStore.cidade}/{selectedStore.estado}</span>
              <span><strong>Telefone/Zap:</strong> {selectedStore.telefoneFormatado}</span>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-[#004d40] text-[#ffab00] rounded-full text-[10px] font-bold uppercase font-exo2">
            Dados Fiscais Verificados
          </span>
        </div>
      </section>

      {/* GERADOR DE PAPEL TIMBRADO & COMUNICADO A4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Esquerda: Controles do Documento (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
            <h4 className="text-sm font-black text-gray-900 font-exo2 uppercase tracking-wide">
              Configuração do Papel Timbrado
            </h4>

            {/* Alternador: Em Branco vs Comunicado Escrito */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
              <button
                type="button"
                onClick={() => setDocMode('BLANK')}
                className={`py-2 text-xs font-bold font-exo2 rounded-lg transition ${
                  docMode === 'BLANK' ? 'bg-[#004d40] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Folha em Branco
              </button>
              <button
                type="button"
                onClick={() => setDocMode('NOTICE')}
                className={`py-2 text-xs font-bold font-exo2 rounded-lg transition ${
                  docMode === 'NOTICE' ? 'bg-[#004d40] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Comunicado de Loja
              </button>
            </div>

            {docMode === 'NOTICE' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Título do Ofício / Comunicado</label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-[#004d40]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Destinatário / Linha de Apoio</label>
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
                Baixar Modelo no Microsoft Word (.DOCX)
              </button>
              <span className="block text-[10px] text-gray-400 text-center mt-1">
                Para ofícios de múltiplas páginas, contratos e laudos técnicos
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

            {/* RODAPÉ OFICIAL */}
            <footer className="border-t border-gray-200 pt-2 flex items-center justify-between text-[8px] sm:text-[9px] text-gray-500">
              <span className="font-exo2 font-bold text-[#004d40]">
                GRUPO COAGRO • VAREJO AGROPECUÁRIO & PET
              </span>
              <span>www.coagro.com.br • @grupocoagro</span>
            </footer>
          </div>

          {/* BOTÕES DE IMPRESSÃO E PDF */}
          <div className="flex w-full max-w-[440px] gap-2 mt-1">
            <button
              onClick={handlePrintDocument}
              className="flex-1 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs sm:text-sm font-bold font-exo2 tracking-wide uppercase flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Imprimir Direto (A4)
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex-1 py-3 bg-[#004d40] hover:bg-[#00382e] text-white rounded-xl text-xs sm:text-sm font-bold font-exo2 tracking-wide uppercase flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <FileText className="w-4 h-4" />
              Baixar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
