import React, { useState, useEffect } from 'react';
import { listGoogleDriveFiles, deleteFromGoogleDrive, DriveFileItem } from '../lib/googleDrive';
import {
  HardDrive,
  X,
  Trash2,
  ExternalLink,
  RefreshCw,
  FileImage,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';

interface DriveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DriveModal: React.FC<DriveModalProps> = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Confirmation state for destructive delete
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await listGoogleDriveFiles();
      setFiles(list);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao carregar arquivos do Google Drive.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFiles();
    }
  }, [isOpen]);

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    try {
      setIsDeleting(true);
      await deleteFromGoogleDrive(fileToDelete.id);
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setFileToDelete(null);
    } catch (err: any) {
      alert('Erro ao excluir do Google Drive: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Inter']">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#001C71] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#ffab00]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/10 text-[#ffab00]">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-exo2 font-bold text-base">Arquivos no Google Drive</h3>
              <p className="text-xs text-white/70">
                Peças publicitárias e materiais Coagro Agro salvos na nuvem
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 font-exo2">
              Peças Recentes ({files.length})
            </span>
            <button
              onClick={fetchFiles}
              disabled={loading}
              className="text-xs text-[#004d40] hover:text-[#00796b] font-semibold flex items-center gap-1 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#004d40]" />
              <span className="text-xs font-medium">Buscando arquivos no seu Google Drive...</span>
            </div>
          ) : files.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <FolderOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">Nenhum arquivo encontrado</p>
              <p className="text-xs text-gray-500 mt-1">
                Gere uma peça e use o botão &quot;Salvar no Google Drive&quot; para armazená-la.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:border-[#004d40]/40 hover:bg-gray-50/50 transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#004d40] flex items-center justify-center shrink-0 border border-emerald-100">
                      <FileImage className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-800 truncate" title={file.name}>
                        {file.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {file.createdTime
                          ? new Date(file.createdTime).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Recent'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1 transition"
                        title="Abrir no Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Ver</span>
                      </a>
                    )}
                    <button
                      onClick={() => setFileToDelete(file)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Excluir arquivo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold transition"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* MANDATORY Confirmation Modal for Workspace Data Deletion */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-exo2 font-bold text-base text-gray-900">
                Confirmar Exclusão no Google Drive
              </h4>
              <p className="text-xs text-gray-600 mt-2">
                Tem certeza que deseja excluir o arquivo <strong className="text-gray-800">&quot;{fileToDelete.name}&quot;</strong> do seu Google Drive?
              </p>
              <p className="text-[11px] text-red-600 font-medium mt-1">
                Esta ação é irreversível e removerá o arquivo permanentemente.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="w-full py-2 px-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-xs font-semibold transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-full py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirmar Exclusão</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
