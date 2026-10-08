import { extractPriceFromText, formatBrlWithSymbol, parsePriceToFloat } from '../utils/priceParser.js';
import { generateOptimizedPhotoPrompt, inferAgroBackground } from '../utils/prompts.js';
import { analyzeAgroDescriptionServer } from './analyzer.js';

export function generateHeuristicAgroContent(params: {
  prompt?: string;
  format?: string;
  priceInfo?: any;
  templateLayout?: string;
}): any {
  const p = (params.prompt || '').toLowerCase();
  const isStory = params.format === 'story';

  const detected = extractPriceFromText(params.prompt);
  const hasPrice =
    Boolean(params.priceInfo?.ativo && params.priceInfo?.valor_por) ||
    detected.hasPrice ||
    p.includes('r$') ||
    p.includes('por') ||
    /\b\d+[,.]\d{2}\b/.test(p) ||
    p.includes('promoção') ||
    p.includes('oferta');

  let deVal = params.priceInfo?.valor_de || (detected.hasPrice ? detected.valorDe : '') || '';
  let porVal = params.priceInfo?.valor_por || (detected.hasPrice ? detected.valorPor : '') || '';
  let condicoesVal =
    params.priceInfo?.condicoes_pagamento || (detected.hasPrice ? detected.condicoes : '') || '';

  if (deVal && porVal) {
    const fDe = parsePriceToFloat(deVal);
    const fPor = parsePriceToFloat(porVal);
    if (fDe > 0 && fPor > 0 && fPor > fDe) {
      const temp = deVal;
      deVal = porVal;
      porVal = temp;
    }
  }

  const formattedDe = deVal ? formatBrlWithSymbol(deVal) : '';
  const formattedPor = porVal ? formatBrlWithSymbol(porVal) : '';
  const hasTwo = Boolean(deVal && porVal);

  const analysis = analyzeAgroDescriptionServer(params.prompt || '', hasTwo, Boolean(porVal));

  const chosenLayout = params.templateLayout || analysis.recommendedLayout;
  const chosenTitle = analysis.suggestedTitle;
  const chosenHighlight = analysis.suggestedHighlight;
  const chosenSubtitle = analysis.subtitle;

  let beneficios: string[] = [];

  if (p.includes('triturador')) {
    beneficios = [
      'Motor 2HP de alta potência',
      'Saída lateral direcionável',
      'Corte e trituração precisa',
    ];
  } else if (p.includes('forrageira') || p.includes('ensiladeira')) {
    beneficios = [
      'Rotor com navalhas temperadas',
      'Bica de saída direcionável',
      'Chassi reforçado antivibração',
    ];
  } else if (p.includes('pulverizador')) {
    beneficios = [
      'Tanque ergonômico reforçado',
      'Pressão constante e uniforme',
      'Maior autonomia por aplicação',
    ];
  } else if (p.includes('vacina')) {
    beneficios = [
      'Imunização preventiva eficaz',
      'Segurança sanitária do rebanho',
      'Suporte técnico veterinário',
    ];
  }

  const backdropPrompt = generateOptimizedPhotoPrompt(
    `${params.prompt || ''} ${chosenTitle} ${chosenSubtitle}`
  );
  const backdropUrl = inferAgroBackground(`${backdropPrompt} ${params.prompt || ''}`);

  return {
    linha: 'AGRO',
    tipo_postagem: hasTwo ? 'promocao' : hasPrice ? 'preco-unico' : 'informativo_novidade',
    template_layout: chosenLayout,
    formato_gerado: isStory ? 'Story' : 'Feed',
    prompt_fundo_ia: backdropPrompt,
    fundo_imagem: backdropPrompt,
    fundo_imagem_url: backdropUrl,
    textos_hero: {
      titulo: chosenTitle,
      palavra_destaque_ouro: chosenHighlight,
      subtitulo: chosenSubtitle,
    },
    diferenciais_tecnicos: beneficios,
    renderizacao_visual: {
      porte_visual: chosenLayout.includes('split') ? 'maquina_pesada' : 'medio',
      tipo_ancoragem: chosenLayout.includes('split') ? 'chao' : 'flutuante_central',
      fator_ocupacao_percentual: chosenLayout.includes('split') ? 90 : 65
    },
    textos_da_arte: {
      titulo_impacto: chosenTitle,
      palavra_destaque: chosenHighlight,
      subtitulo: chosenSubtitle,
      bullets_tecnicos: beneficios,
      cta: hasPrice ? 'GARANTA JÁ O SEU' : 'CONFIRA NA COAGRO',
      modulo_preco: {
        ativo: hasPrice,
        valor_de: formattedDe,
        valor_por: formattedPor,
        condicoes_pagamento: condicoesVal || '',
      },
    },
    legenda_instagram: `Garanta máxima produtividade na sua propriedade com o ${chosenSubtitle}! Condições imperdíveis na Coagro.\n\nFale com nosso time de especialistas ou visite uma de nossas lojas.\n\n#Coagro #AgroNegocio #OfertaAgro #CampoForte`,
  };
}
