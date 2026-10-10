import React, { useState } from 'react';
import { Layers, FileText, Users, Store, ShieldCheck } from 'lucide-react';
import { BrandAssetsTab } from './BrandAssetsTab';
import { OfficialDocumentsTab } from './OfficialDocumentsTab';
import { TeamDigitalTab } from './TeamDigitalTab';
import { BranchDirectoryTab } from './BranchDirectoryTab';

interface BrandHubModuleProps {
  scope: 'AGRO' | 'PET';
  onShowNotice: (msg: string) => void;
}

export type BrandHubTab = 'assets' | 'documents' | 'team' | 'directory';

export const BrandHubModule: React.FC<BrandHubModuleProps> = ({ scope, onShowNotice }) => {
  const [activeTab, setActiveTab] = useState<BrandHubTab>('documents');
  const isPet = scope === 'PET';

  return (
    <div className="space-y-6 font-['Inter']">
      {/* HEADER DO BRAND HUB */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#004d40] text-[#ffab00] rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-exo2 uppercase tracking-wide">
              Brand Hub & Governança de Marca ({isPet ? 'Coagro Pet' : 'Grupo Coagro'})
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Central corporativa de documentos oficiais, vetores, padronização de filiais e ativos de comunicação.
          </p>
        </div>

        {/* NAVEGAÇÃO ENTRE AS 4 ABAS DO BRAND HUB */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-gray-100 rounded-2xl border border-gray-200/80 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-exo2 transition ${
              activeTab === 'documents'
                ? 'bg-[#004d40] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <FileText className="w-4 h-4 text-[#ffab00]" />
            Papelaria Oficial (A4)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-exo2 transition ${
              activeTab === 'assets'
                ? 'bg-[#004d40] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            Logos & Cores
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-exo2 transition ${
              activeTab === 'team'
                ? 'bg-[#004d40] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <Users className="w-4 h-4" />
            Equipe & Digital
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-exo2 transition ${
              activeTab === 'directory'
                ? 'bg-[#004d40] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
            }`}
          >
            <Store className="w-4 h-4" />
            12 Filiais
          </button>
        </div>
      </div>

      {/* CONTEÚDO DA ABA ATIVA */}
      <div>
        {activeTab === 'documents' && (
          <OfficialDocumentsTab scope={scope} onShowNotice={onShowNotice} />
        )}
        {activeTab === 'assets' && (
          <BrandAssetsTab scope={scope} onShowNotice={onShowNotice} />
        )}
        {activeTab === 'team' && (
          <TeamDigitalTab scope={scope} onShowNotice={onShowNotice} />
        )}
        {activeTab === 'directory' && (
          <BranchDirectoryTab onShowNotice={onShowNotice} />
        )}
      </div>
    </div>
  );
};
