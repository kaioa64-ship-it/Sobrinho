import React, { useState, useEffect } from 'react';
import { AgroContent } from '../types/agro';
import { X, Copy, Check, Edit3, Save, Code2 } from 'lucide-react';

interface JsonViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: AgroContent;
  onUpdateContent: (newContent: AgroContent) => void;
}

export function formatCleanRenderJson(content: AgroContent): any {
  const isStory =
    content.formato_gerado?.toLowerCase() === 'story' ||
    content.formato?.toLowerCase() === 'story';

  const preco = content.textos_da_arte?.modulo_preco || content.modulo_preco;
  const hasPreco = preco && preco.ativo && Boolean(preco.valor_por);

  const cleanObj: any = {
    linha: content.linha || 'AGRO',
    formato_gerado: content.formato_gerado || (isStory ? 'Story' : 'Feed'),
    fundo_imagem:
      content.fundo_imagem ||
      'Fotografia profissional agrícola em alta resolução, lavoura viçosa de grãos sob a luz matinal límpida, folhas sadias com orvalho matinal em primeiro plano, horizonte amplo do agronegócio brasileiro, iluminação cinematográfica e profundidade de campo suave.',
    textos_da_arte: {
      titulo_impacto:
        content.textos_da_arte?.titulo_impacto ||
        content.caixa_titulo?.texto ||
        'BLINDAGEM TOTAL NA SUA LAVOURA',
      palavra_destaque:
        content.textos_da_arte?.palavra_destaque ||
        content.caixa_titulo?.palavra_ouro ||
        content.caixa_titulo?.palavra_ouro_destaque ||
        'BLINDAGEM',
      subtitulo:
        content.textos_da_arte?.subtitulo ||
        content.caixa_subtitulo?.texto ||
        'Ação sistêmica contra as principais doenças foliares.',
      bullets_tecnicos:
        content.textos_da_arte?.bullets_tecnicos ||
        content.beneficios_tecnicos || [
          'Efeito residual prolongado no campo',
          'Rápida absorção foliar em até 2 horas',
          'Máxima produtividade por hectare',
        ],
      cta: content.textos_da_arte?.cta || 'GARANTA JÁ O SEU',
    },
    legenda_instagram:
      content.legenda_instagram ||
      content.legenda_post ||
      'Proteção preventiva e curativa com máxima eficiência técnica para a sua lavoura. Conte com a tradição e suporte agronômico do Grupo Coagro para defender o seu rendimento no campo.\n\nFale com nossos consultores técnicos e proteja seu investimento.\n\n#GrupoCoagro #AgroNordeste #DefensivosAgricolas #ProdutividadeNoCampo #ManejoEficiente #Alagoas #Sergipe #Agronomia',
  };

  if (hasPreco) {
    cleanObj.textos_da_arte.modulo_preco = {
      ativo: true,
      valor_de: preco.valor_de || '',
      valor_por: preco.valor_por || '',
    };
  }

  return cleanObj;
}

export const JsonViewerModal: React.FC<JsonViewerModalProps> = ({
  isOpen,
  onClose,
  content,
  onUpdateContent,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    const cleanObject = formatCleanRenderJson(content);
    setJsonText(JSON.stringify(cleanObject, null, 2));
    setIsEditing(false);
    setParseError(null);
  }, [content, isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const titulo =
        parsed.textos_da_arte?.titulo_impacto ||
        parsed.caixa_titulo?.texto ||
        '';

      const palavra =
        parsed.textos_da_arte?.palavra_destaque ||
        parsed.caixa_titulo?.palavra_ouro ||
        '';

      const sub =
        parsed.textos_da_arte?.subtitulo ||
        parsed.caixa_subtitulo?.texto ||
        '';

      const bullets =
        parsed.textos_da_arte?.bullets_tecnicos ||
        parsed.beneficios_tecnicos ||
        [];

      const cta =
        parsed.textos_da_arte?.cta ||
        'GARANTA JÁ O SEU';

      const preco =
        parsed.textos_da_arte?.modulo_preco ||
        parsed.modulo_preco || {
          ativo: false,
          valor_de: '',
          valor_por: '',
        };

      const fundo =
        parsed.fundo_imagem ||
        content.fundo_imagem ||
        '';

      const legenda =
        parsed.legenda_instagram ||
        parsed.legenda_post ||
        '';

      const isStory =
        parsed.formato_gerado?.toLowerCase() === 'story' ||
        parsed.formato?.toLowerCase() === 'story';

      const updated: AgroContent = {
        ...content,
        linha: parsed.linha || 'AGRO',
        formato_gerado: parsed.formato_gerado || (isStory ? 'Story' : 'Feed'),
        formato: isStory ? 'story' : 'feed',
        fundo_imagem: fundo,
        textos_da_arte: {
          titulo_impacto: titulo,
          palavra_destaque: palavra,
          subtitulo: sub,
          bullets_tecnicos: bullets,
          cta: cta,
          modulo_preco: preco,
        },
        caixa_titulo: {
          texto: titulo,
          palavra_ouro: palavra,
          palavra_ouro_destaque: palavra,
        },
        caixa_subtitulo: {
          texto: sub,
        },
        beneficios_tecnicos: bullets,
        modulo_preco: preco,
        legenda_instagram: legenda,
        legenda_post: legenda,
      };

      onUpdateContent(updated);
      setIsEditing(false);
      setParseError(null);
    } catch (err: any) {
      setParseError('Erro de sintaxe JSON: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-['Inter']">
      <div className="bg-[#1F2937] text-gray-100 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-[#111827] px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#004d40] text-[#ffab00]">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-exo2 font-bold text-base text-white">
                JSON Estruturado Coagro AGRO
              </h3>
              <p className="text-xs text-gray-400">
                Prompt fotográfico otimizado de fundo e textos da arte
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* JSON Editor / Viewer */}
        <div className="p-6 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-[#ffab00]">
              {isEditing ? 'Modo de Edição Direta:' : 'Modo Somente Leitura:'}
            </span>
            <button
              onClick={() => {
                if (isEditing) {
                  const cleanObject = formatCleanRenderJson(content);
                  setJsonText(JSON.stringify(cleanObject, null, 2));
                  setIsEditing(false);
                  setParseError(null);
                } else {
                  setIsEditing(true);
                }
              }}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Descartar Edição' : 'Editar JSON'}</span>
            </button>
          </div>

          {parseError && (
            <div className="p-2.5 mb-2 rounded-lg bg-red-900/50 border border-red-700 text-red-200 text-xs">
              {parseError}
            </div>
          )}

          <div className="flex-1 min-h-[300px] overflow-hidden rounded-xl border border-gray-700 bg-[#0F172A]">
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              readOnly={!isEditing}
              className={`w-full h-full p-4 font-mono text-xs leading-relaxed focus:outline-none resize-none ${
                isEditing
                  ? 'bg-transparent text-emerald-300'
                  : 'bg-transparent text-gray-300 cursor-default'
              }`}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#111827] px-6 py-3 border-t border-gray-700 flex items-center justify-between">
          <div className="text-[11px] text-gray-400">
            Divisão: <strong className="text-[#ffab00]">COAGRO AGRO</strong> • Formato:{' '}
            <strong className="text-white">
              {content.formato_gerado || (content.formato === 'story' ? 'Story' : 'Feed')}
            </strong>
          </div>
          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-[#004d40] hover:bg-[#00796b] text-white text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Save className="w-3.5 h-3.5 text-[#ffab00]" />
                <span>Aplicar Alterações na Arte</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
