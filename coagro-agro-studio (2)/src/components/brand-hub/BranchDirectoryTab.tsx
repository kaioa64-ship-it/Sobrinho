import React, { useState } from 'react';
import { COAGRO_STORES, CoagroStore } from '../../data/coagroStores';
import { Building2, Search, MapPin, Phone, Copy, ExternalLink, Check, Store } from 'lucide-react';

interface BranchDirectoryTabProps {
  onShowNotice: (msg: string) => void;
}

export const BranchDirectoryTab: React.FC<BranchDirectoryTabProps> = ({ onShowNotice }) => {
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [copiedStoreId, setCopiedStoreId] = useState<string | null>(null);

  const filteredStores = COAGRO_STORES.filter((store) => {
    const matchSearch =
      store.nome.toLowerCase().includes(search.toLowerCase()) ||
      store.cidade.toLowerCase().includes(search.toLowerCase()) ||
      store.cnpj.includes(search);
    const matchState = selectedState === 'ALL' || store.estado === selectedState;
    return matchSearch && matchState;
  });

  const handleCopyStoreFiscalData = (store: CoagroStore) => {
    const text = `RAZÃO SOCIAL: ${store.razaoSocial}
FILIAL: ${store.nome}
CNPJ: ${store.cnpj}
ENDEREÇO: ${store.endereco}
CIDADE/UF: ${store.cidade} - ${store.estado} | CEP: ${store.cep}
TELEFONE/WHATSAPP: ${store.telefoneFormatado}`;

    navigator.clipboard.writeText(text);
    setCopiedStoreId(store.id);
    onShowNotice(`✅ Dados cadastrais de ${store.nome} copiados!`);
    setTimeout(() => setCopiedStoreId(null), 2500);
  };

  return (
    <div className="space-y-6 font-['Inter']">
      {/* CABEÇALHO & FILTROS DO DIRETÓRIO */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-gray-900 font-exo2 uppercase tracking-wide flex items-center gap-2">
              <Store className="w-5 h-5 text-[#004d40]" />
              Diretório Oficial de Unidades & Filiais Físicas (Grupo Coagro)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Relação completa de CNPJs centrais e filiais, endereços normalizados, contatos e links do Google Maps.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-exo2">
              {filteredStores.length} de {COAGRO_STORES.length} Unidades
            </span>
          </div>
        </div>

        {/* Barra de Busca e Filtro de Estado */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome da filial, cidade ou CNPJ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#004d40] bg-gray-50/50"
            />
          </div>

          <div className="flex gap-2">
            {['ALL', 'AL', 'SE', 'BA'].map((uf) => (
              <button
                key={uf}
                type="button"
                onClick={() => setSelectedState(uf)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold font-exo2 transition ${
                  selectedState === uf
                    ? 'bg-[#004d40] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {uf === 'ALL' ? 'Todos os Estados' : uf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRADE DE CARDS DAS FILIAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStores.map((store) => (
          <div
            key={store.id}
            className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm flex flex-col justify-between hover:border-gray-300 transition hover:shadow-md"
          >
            <div className="space-y-3">
              {/* Header do Card */}
              <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <h4 className="font-exo2 font-black text-sm text-gray-900 uppercase">
                    {store.nome}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-mono block">
                    {store.razaoSocial}
                  </span>
                </div>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-bold rounded-md text-[10px] uppercase font-exo2">
                  {store.cidade} - {store.estado}
                </span>
              </div>

              {/* Informações de Endereço e Contato */}
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#004d40] shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight">
                    {store.endereco} • CEP: {store.cep}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-[#ffab00] shrink-0" />
                  <span className="text-[11px] font-mono text-gray-800 font-bold">
                    CNPJ: {store.cnpj}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-bold text-gray-800">
                    {store.telefoneFormatado}
                  </span>
                </div>
              </div>
            </div>

            {/* Ações do Card */}
            <div className="pt-4 border-t border-gray-100 mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => handleCopyStoreFiscalData(store)}
                className={`flex-1 py-2 rounded-xl text-[11px] font-bold font-exo2 flex items-center justify-center gap-1.5 transition ${
                  copiedStoreId === store.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#004d40] hover:bg-[#00382e] text-white active:scale-95'
                }`}
                title="Copiar Razão Social, CNPJ e Endereço formatados"
              >
                {copiedStoreId === store.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#ffab00]" />
                    Copiar Dados
                  </>
                )}
              </button>

              <a
                href={store.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition flex items-center justify-center"
                title="Ver no Google Maps"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
