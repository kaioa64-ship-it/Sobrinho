import { Router } from 'express';
import { apiLimiter } from '../middleware/rateLimit.js';
import { ai } from '../config/gemini.js';
// System prompts do motor de IA. Ficaram ÓRFÃOS na modularização P2.3 e foram
// restaurados do histórico do git — sem eles /api/generate-content lançava
// ReferenceError em runtime. Ver CORRECOES_REALIZADAS.md.
import {
  AGRO_SYSTEM_INSTRUCTION,
  PET_SYSTEM_INSTRUCTION,
  TONE_MATRIX,
  OUTPUT_SCHEMA,
} from '../config/instructions.js';
import { analyzeAgroDescriptionServer } from '../services/analyzer.js';
import { generateHeuristicAgroContent } from '../services/heuristic.js';
// FONTE ÚNICA DE VERDADE MONETÁRIA:
// o servidor consome o MESMO parser/formatador que o cliente (src/lib).
// Antes existia uma cópia em server/utils/priceParser.ts com regex diferente,
// o que permitia que preview e geração por IA calculassem preços distintos
// para o mesmo texto. Ver CORRECOES_REALIZADAS.md (achado F).
import { extractPriceFromText, parsePriceToFloat } from '../../src/lib/priceParser.js';
import { formatBrlWithSymbol, formatBrlValue } from '../../src/lib/priceFormatter.js';
import { generateOptimizedPhotoPrompt, inferAgroBackground } from '../utils/prompts.js';

export const generateRouter = Router();

generateRouter.post('/api/generate-content', apiLimiter, async (req, res) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      prompt,
      format = 'feed',
      templateLayout,
      isManualTemplate = false,
      communicationMode,
      communicationSelection,
      targetFocus,
      priceInfo,
      isNewImage,
      appMode,
    } = req.body;

    // REGRA ESTRITA: Só é possível gerar a imagem depois que o usuário colocar a foto E a descrição!
    if (!imageBase64 || !prompt || !prompt.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Para gerar a arte, é obrigatório fornecer tanto a foto do produto quanto a descrição.',
      });
    }

    // Extrai inteligentemente preço e condições de pagamento do prompt (com isolamento de unidades e códigos)
    const detectedPrice = extractPriceFromText(prompt);
    let effectivePriceInfo = priceInfo;
    if ((!effectivePriceInfo || !effectivePriceInfo.ativo || !effectivePriceInfo.valor_por) && detectedPrice.hasPrice) {
      effectivePriceInfo = {
        ativo: true,
        valor_de: detectedPrice.valorDe || '',
        valor_por: detectedPrice.valorPor || '',
        condicoes_pagamento: detectedPrice.condicoes || '',
      };
    }

    // Análise prévia inteligente do produto (marca, modelo, subtítulo e layout recomendado)
    const hasTwoPrices = Boolean(effectivePriceInfo?.valor_de && effectivePriceInfo?.valor_por);
    const hasSinglePrice = Boolean(!effectivePriceInfo?.valor_de && effectivePriceInfo?.valor_por);
    const preAnalysis = analyzeAgroDescriptionServer(prompt, hasTwoPrices, hasSinglePrice);

    const parts: any[] = [];
    const requestedFormatName = format === 'story' ? 'Story' : 'Feed';

    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
    parts.push({
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: cleanBase64,
      },
    });

    let instruction = `DIRETRIZ MESTRE DE GERAÇÃO - COAGRO AGRO STUDIO (Formato: "${requestedFormatName}")

O usuário forneceu OBRIGATORIAMENTE duas fontes de dados conjuntas:
1. A FOTO REAL do produto/equipamento/insumo agrícola (imagem enviada).
2. A DESCRIÇÃO textual digitada pelo usuário: "${prompt}".

ETAPA 1: ANÁLISE OBRIGATÓRIA DA DESCRIÇÃO E DA IMAGEM
Você deve analisar minuciosamente o texto e a foto juntos para extrair com precisão.
ATENÇÃO: O usuário pode digitar nomes incorretos ou com erros ortográficos. CORRIJA silenciosamente os erros de digitação com base no seu conhecimento e na imagem. Se houver textos absurdos, ignore-os e foque no produto real.
- NOME DO PRODUTO: Identifique e corrija o nome comercial completo (ex: Triturador TR30, Pulverizador XP 16, Bravecto). Não inclua a marca no nome do produto.
- MARCA / FABRICANTE: Extraia a marca exata do fabricante (ex: Tramontina, Jacto, Bayer, MSD Saúde Animal, Premier Pet). ATENÇÃO: Se não informada, retorne null. Não invente marcas genéricas como 'Pet' ou 'Agro'. Não confunda linha (Golden, Bravecto) com fabricante (Premier Pet, MSD).
- FORNECEDOR / LINHA: Identifique o fornecedor ou divisão se citado no texto ou na embalagem.
- ANÁLISE SEMÂNTICA DE PREÇOS (TRATAMENTO DE AMBIGUIDADES):
  * Regra de vírgula e centavos (OBRIGATÓRIO):
    - Valores SEM VÍRGULA digitados pelo usuário (ex: 1992 ou 1575 ou 3890) devem ser tratados estritamente como INTEIROS com centavos ,00 no final ("1.992,00" e "1.575,00").
    - Valores COM VÍRGULA (ex: 3190,50 ou 45,90) mantêm os centavos exatos informados ("3.190,50" e "45,90").
  * Descrições com múltiplos valores:
    - Descarte totalmente grandezas técnicas (ex: 2HP, 220V, 50HZ, 30L, 50kg, 16 pol, 3500rpm, etc.), modelos (TR30, XP16), anos (2024) e quantidades (2 unidades).
    - Números de parcelas (ex: 10x de 180) devem ser capturados em "condicao" ("EM 10X DE R$ 180,00"), NUNCA como preço principal.
  * Resolução semântica de 'DE' vs 'POR' (mesmo se invertidos no texto):
    - A diferenciação entre "preço de" e "preço por" é feita por contexto semântico:
      - Marcadores de Preço Original ("DE"): palavras como "de", "era", "custava", "antes", "de tabela", "original".
      - Marcadores de Preço Promocional ("POR"): palavras como "por", "sai por", "agora", "apenas", "promoção", "à vista", "no pix".
    - Validação de Coerência Comercial: em qualquer promoção ("de/por"), o preço original ("valor_de") é inerentemente superior ao preço promocional ("valor_por"). Se o usuário tiver escrito "de 1575 por 1992" ou "por 1575 de 1992", o valor mais alto (1.992,00) é SEMPRE o "valor_de" e o valor mais baixo (1.575,00) é SEMPRE o "valor_por".
    - No JSON, preencha "modulo_preco" com:
      "ativo": true,
      "valor_de": "${effectivePriceInfo?.valor_de || ''}",
      "valor_por": "${effectivePriceInfo?.valor_por || ''}",
      "condicao": "${effectivePriceInfo?.condicoes_pagamento || ''}"
    - "tipo_postagem": "promocao"
  * Se existir apenas 1 preço:
    - "modulo_preco": { "ativo": true, "valor_de": "", "valor_por": "${effectivePriceInfo?.valor_por || ''}" }
    - "tipo_postagem": "preco-unico"
  * Se NÃO houver preço no texto ou imagem:
    - "modulo_preco": { "ativo": false, "valor_de": "", "valor_por": "" }
    - "tipo_postagem": "informativo"

ETAPA 2: GERAÇÃO DOS CAMPOS DA ARTE PARA O FORMATO "${requestedFormatName}"
SÓ APÓS A ANÁLISE COMPLETA ACIMA, gere todos os campos de renderização da arte estritamente para este produto identificado:
1. "nome_produto": Nome comercial identificado (ex: "${preAnalysis.baseProduct}").
2. "marca_fabricante": Marca identificada (ex: "${preAnalysis.brand || 'Coagro'}").
3. "titulo" / "titulo_impacto": Título comercial de impacto em CAIXA ALTA (máx. 4 palavras). 
   - SEJA INTELIGENTE: Adapte ao produto! Se a loja for Agro mas a imagem for de produto Pet (ex: Nexgard, Ração), crie um título voltado para Pet (ex: "OFERTA NEXGARD", "CUIDADO ANIMAL", "OFERTA PET").
   - Se for produto agrícola, use termos de campo ("PRODUTIVIDADE", "NO CAMPO").
   - Você DEVE incluir o nome da marca ou do produto aqui se for um produto forte (ex: "OFERTA BRAVECTO").
4. "subtitulo": OBRIGATORIAMENTE UMA LINHA DESCRITIVA DA APLICAÇÃO OU NOME TÉCNICO!
   - Se o "titulo" for muito genérico (ex: "OFERTA ESPECIAL"), o subtítulo DEVE CONTER O NOME DO PRODUTO (ex: "Tablete Mastigável Nexgard").
   - Se o "titulo" já identificou o produto, use uma descrição de benefício (ex: "Ação rápida contra pulgas").
5. "palavra_destaque_ouro" / "palavra_destaque": Palavra exata do título em cor ouro (#ffab00) (ex: "OFERTA", "NEXGARD", "ESPECIAL").
6. "template_layout":
   - "split-vertical": Produto formato alto, volumoso ou lista densa de benefícios.
   - "hero-central": Destaque visual centralizado e compacto (frascos, caixas de medicamento).
7. "bullets_tecnicos" / "diferenciais_tecnicos": Crie EXATAMENTE 3 diferenciais curtos (MÁXIMO DE 5 PALAVRAS CADA ITEM). Não crie frases longas.
8. "cta": Chamada para ação ("GARANTA JÁ", "COMPRE NA COAGRO", "GARANTA O SEU").
9. "modulo_preco": Preenchido com a análise da Etapa 1.
10. "fundo_imagem": Prompt fotográfico realista em português contextualizado ao habitat do produto (ex: galpão rústico para equipamentos; sala ou gramado para pet; lavoura para sementes).
11. "legenda_instagram": Legenda persuasiva (se pet, carinhosa; se agro, técnica).
`;

    if (targetFocus) {
      instruction += `Foco técnico específico: ${targetFocus}. `;
    }

    parts.push({ text: instruction });

    let dynamicSystemInstruction = (appMode === 'PET' ? PET_SYSTEM_INSTRUCTION : AGRO_SYSTEM_INSTRUCTION) + TONE_MATRIX + OUTPUT_SCHEMA;

    if (appMode === 'PET') {
      // Ajuste extra para a diretriz
      instruction = instruction.replace(
        'DIRETRIZ MESTRE DE GERAÇÃO - COAGRO AGRO STUDIO',
        'DIRETRIZ MESTRE DE GERAÇÃO - COAGRO PET STUDIO'
      ).replace(
        'produto agropecuário',
        'produto para PETS'
      );
    }

    let parsed: any;
    try {
      let response: any;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts },
          config: {
            systemInstruction: dynamicSystemInstruction,
            temperature: 0.15,
            responseMimeType: 'application/json',
          },
        });
      } catch (firstErr: any) {
        if (firstErr?.status === 503 || firstErr?.status === 429) {
          console.warn('Initial gemini-3.8-flash attempt failed (503/429), retrying gemini-3.8-flash in 1s...', firstErr);
          await new Promise(resolve => setTimeout(resolve, 1000));
          response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: { parts },
            config: {
              systemInstruction: dynamicSystemInstruction,
              temperature: 0.15,
              responseMimeType: 'application/json',
            },
          });
        } else {
          throw firstErr;
        }
      }

      let rawText = response.text?.trim() || '';
      rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

      try {
        parsed = JSON.parse(rawText);
      } catch (parseError) {
        console.warn('Failed to parse JSON directly, attempting recovery:', rawText);
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          parsed = generateHeuristicAgroContent({ prompt, format, priceInfo: effectivePriceInfo, templateLayout });
        }
      }
    } catch (apiError) {
      console.warn('Upstream Gemini API error or quota limitation, applying intelligent heuristic fallback:', apiError);
      parsed = generateHeuristicAgroContent({ prompt, format, priceInfo: effectivePriceInfo, templateLayout });
    }

    // Strip unwanted noise like "Divisão Agropecuária"
    const stripNoise = (str: string) =>
      typeof str === 'string'
        ? str.replace(/divis[ãa]o\s+agropecu[áa]ria/gi, '').replace(/\s{2,}/g, ' ').trim()
        : str;

    if (parsed.textos_da_arte) {
      parsed.textos_da_arte.titulo_impacto = stripNoise(parsed.textos_da_arte.titulo_impacto || '');
      parsed.textos_da_arte.subtitulo = stripNoise(parsed.textos_da_arte.subtitulo || '');
      if (Array.isArray(parsed.textos_da_arte.bullets_tecnicos)) {
        parsed.textos_da_arte.bullets_tecnicos = parsed.textos_da_arte.bullets_tecnicos.map(stripNoise);
      }
    }
    if (parsed.caixa_titulo) {
      parsed.caixa_titulo.texto = stripNoise(parsed.caixa_titulo.texto || '');
    }
    if (parsed.caixa_subtitulo) {
      parsed.caixa_subtitulo.texto = stripNoise(parsed.caixa_subtitulo.texto || '');
    }
    if (Array.isArray(parsed.beneficios_tecnicos)) {
      parsed.beneficios_tecnicos = parsed.beneficios_tecnicos.map(stripNoise);
    }

    // 1. Context text for fallback analysis
    const fullContext = `${prompt || ''} ${parsed.textos_hero?.titulo || parsed.textos_da_arte?.titulo_impacto || parsed.caixa_titulo?.texto || ''} ${parsed.textos_hero?.subtitulo || parsed.textos_da_arte?.subtitulo || parsed.caixa_subtitulo?.texto || ''} ${parsed.legenda_instagram || parsed.legenda_post || ''}`;

    // 2. Automated photographic prompt generation for 'prompt_fundo_ia' / 'fundo_imagem'
    let photoPrompt = (parsed.prompt_fundo_ia || parsed.fundo_imagem || '').trim();
    if (!photoPrompt || photoPrompt.length < 25 || photoPrompt.startsWith('http')) {
      photoPrompt = generateOptimizedPhotoPrompt(fullContext);
    }

    // 3. Resolve high-resolution agricultural backdrop image corresponding to the prompt
    const inferredBackground = inferAgroBackground(`${photoPrompt} ${fullContext}`);

    // 4. Infer & clean title and golden highlight word
    let rawTitle = (parsed.textos_hero?.titulo || parsed.textos_da_arte?.titulo_impacto || parsed.caixa_titulo?.texto || '').trim();

    // Se o título gerado colocou o nome do produto no título (ex: "TRITURADOR TR30"), substitui pelo título de impacto comercial
    const lowerTitle = rawTitle.toLowerCase();
    const agroWordsRegex = /campo|lavoura|produtividade|rural|safra|pasto/i;
    if (
      !rawTitle ||
      lowerTitle.length > 35 ||
      (preAnalysis.isPetProduct && agroWordsRegex.test(rawTitle))
    ) {
      rawTitle = preAnalysis.suggestedTitle;
    }

    // Regra Estrita: titulo_impacto tem no MÁXIMO 3 palavras em caixa alta
    let titleWords = rawTitle
      .trim()
      .split(/\s+/)
      .map((w: string) => w.replace(/[.,!?:;]/g, '').toUpperCase())
      .filter(Boolean);

    if (titleWords.length > 4) {
      titleWords = titleWords.slice(0, 4);
    }
    const titleText = titleWords.join(' ') || preAnalysis.suggestedTitle;

    let palavraOuro = (
      parsed.textos_hero?.palavra_destaque_ouro ||
      parsed.textos_da_arte?.palavra_destaque ||
      parsed.caixa_titulo?.palavra_ouro ||
      parsed.caixa_titulo?.palavra_ouro_destaque ||
      ''
    ).trim();

    const isWordInTitle = titleWords.some((w: string) => w === palavraOuro.toUpperCase());
    if (!palavraOuro || !isWordInTitle) {
      const highImpactWords = ['OFERTA', 'RELÂMPAGO', 'ESPECIAL', 'EFICIÊNCIA', 'OPORTUNIDADE', 'IMBATÍVEL', 'MÁXIMA', 'BLINDAGEM', 'FORTE', 'PRODUTIVIDADE'];
      const foundPriority = titleWords.find((w: string) => highImpactWords.includes(w));
      palavraOuro = foundPriority || preAnalysis.suggestedHighlight || titleWords[0] || 'OFERTA';
    }

    // 5. Clean subtitle: DEVE SER O NOME DO PRODUTO + MARCA/MODELO
    let rawSub = (parsed.textos_hero?.subtitulo || parsed.textos_da_arte?.subtitulo || parsed.caixa_subtitulo?.texto || '').trim();

    // Se o subtítulo estiver vazio ou for a frase genérica antiga, utiliza o subtítulo rico extraído do produto
    if (
      !rawSub ||
      rawSub.toLowerCase().includes('soluções de alta performance') ||
      rawSub.toLowerCase().includes('solucoes de alta performance') ||
      (preAnalysis.isPetProduct && agroWordsRegex.test(rawSub))
    ) {
      rawSub = preAnalysis.subtitle || rawSub;
    }
    const cleanSubtitulo = rawSub.length > 90 ? rawSub.slice(0, 90).trim() : rawSub;

    // 6. Clean technical benefits / diferenciais (estritamente 3 itens curtos)
    const incomingBenefits = parsed.diferenciais_tecnicos || parsed.textos_da_arte?.bullets_tecnicos || parsed.beneficios_tecnicos;
    let cleanBeneficios: string[] = [];
    if (Array.isArray(incomingBenefits) && incomingBenefits.length > 0) {
      cleanBeneficios = incomingBenefits
        .map((b: any) => String(b).trim())
        .filter(Boolean)
        .slice(0, 3)
        .map((b: string) => {
          const words = b.split(/\s+/).filter(Boolean);
          return words.length > 5 ? words.slice(0, 5).join(' ') : b;
        });
    }


    // 7. Modulo Preco com formatação BRL obrigatória e persistência do modo comercial
    let cleanModuloPreco = {
      ativo: false,
      valor_de: '',
      valor_por: '',
      condicao: '',
      condicoes_pagamento: '',
    };
    const incomingPreco = parsed.modulo_preco || parsed.textos_da_arte?.modulo_preco;
    let rawDe = '';
    let rawPor = '';
    let rawCond = '';

    if (effectivePriceInfo && effectivePriceInfo.ativo && effectivePriceInfo.valor_por) {
      rawDe = effectivePriceInfo.valor_de || '';
      rawPor = effectivePriceInfo.valor_por;
      rawCond = effectivePriceInfo.condicoes_pagamento || '';
    } else if (incomingPreco && incomingPreco.ativo && incomingPreco.valor_por) {
      rawDe = incomingPreco.valor_de || '';
      rawPor = incomingPreco.valor_por;
      rawCond = incomingPreco.condicao || incomingPreco.condicoes_pagamento || '';
    } else if (detectedPrice.hasPrice && detectedPrice.valorPor) {
      rawDe = detectedPrice.valorDe || '';
      rawPor = detectedPrice.valorPor;
      rawCond = detectedPrice.condicoes || '';
    }

    // GARANTIA MESTRE DE PREÇO: Se existirem 2 valores, o maior é SEMPRE "valor_de" e o menor é SEMPRE "valor_por"
    if (rawDe && rawPor) {
      const fDe = parsePriceToFloat(rawDe);
      const fPor = parsePriceToFloat(rawPor);
      if (fDe > 0 && fPor > 0 && fPor > fDe) {
        const tmp = rawDe;
        rawDe = rawPor;
        rawPor = tmp;
      }
    }

    if (rawPor) {
      if (!rawCond && prompt) {
        if (detectedPrice.condicoes) {
          rawCond = detectedPrice.condicoes;
        } else {
          const matchCond = prompt.match(/(em\s+at[ée]\s+\d+\s*x[^\n.,]*|[aà]\s*vista[^\n.,]*|no\s+cart[ãa]o[^\n.,]*)/i);
          if (matchCond) {
            rawCond = matchCond[1].toUpperCase().trim();
          }
        }
      }
    }

    // Determina o Modo Comercial
    let finalCommMode: 'PROMOTION' | 'SINGLE_PRICE' | 'INFORMATIVE';
    let finalTipoPostagem: string;

    if (communicationSelection && communicationSelection !== 'AUTO') {
      if (communicationSelection === 'PROMOTION' || communicationMode === 'PROMOTION') {
        finalCommMode = 'PROMOTION';
        finalTipoPostagem = 'promocao';
      } else if (communicationSelection === 'SINGLE_PRICE' || communicationMode === 'SINGLE_PRICE') {
        finalCommMode = 'SINGLE_PRICE';
        finalTipoPostagem = 'preco-unico';
        rawDe = '';
      } else {
        finalCommMode = 'INFORMATIVE';
        finalTipoPostagem = 'informativo';
        rawDe = '';
        rawPor = '';
      }
    } else {
      if (rawDe && rawPor) {
        finalCommMode = 'PROMOTION';
        finalTipoPostagem = 'promocao';
      } else if (rawPor) {
        finalCommMode = 'SINGLE_PRICE';
        finalTipoPostagem = 'preco-unico';
      } else {
        finalCommMode = 'INFORMATIVE';
        finalTipoPostagem = 'informativo';
      }
    }

    if (finalCommMode !== 'INFORMATIVE' && rawPor) {
      const condLimpa = rawCond ? rawCond.trim() : '';
      cleanModuloPreco = {
        ativo: true,
        valor_de: (finalCommMode === 'PROMOTION' && rawDe) ? formatBrlWithSymbol(rawDe) : '',
        valor_por: formatBrlValue(rawPor),
        condicao: condLimpa,
        condicoes_pagamento: condLimpa,
      };
    } else {
      cleanModuloPreco = {
        ativo: false,
        valor_de: '',
        valor_por: '',
        condicao: '',
        condicoes_pagamento: '',
      };
    }

    // 8. CTA text respeitando o modo comercial e a categoria
    let cleanCta = (parsed.textos_da_arte?.cta || '').trim();
    if (!cleanCta || cleanCta === 'GARANTA JÁ O SEU') {
      if (finalCommMode === 'PROMOTION') cleanCta = 'GARANTA JÁ O SEU';
      else if (finalCommMode === 'SINGLE_PRICE') cleanCta = 'CONSULTE DISPONIBILIDADE';
      else if (fullContext.toLowerCase().includes('vacina') || fullContext.toLowerCase().includes('veterin')) {
        cleanCta = 'FALE COM NOSSA EQUIPE';
      } else {
        cleanCta = 'SAIBA MAIS';
      }
    }

    // 9. Caption
    const cleanLegenda = (parsed.legenda_instagram || parsed.legenda_post || '').trim();

    // 10. Infer Theme and Template Layout
    // SELEÇÃO INTELIGENTE DE LAYOUT:
    // Trituradores, forrageiras, motobombas, equipamentos com specs ficam SEMPRE em 'split-vertical'!
    const validThemes = ['campo-agro', 'verde-coagro', 'azul-coagro', 'clean-branco'];
    const inferredTheme = validThemes.includes(parsed.tema) ? parsed.tema : 'campo-agro';

    const suggestedByAi = parsed.template_layout === 'hero-central' || parsed.template_layout === 'split-vertical' ? parsed.template_layout : null;
    
    // Se o usuário fez seleção manual explícita no painel, respeita; caso contrário, usa a recomendação inteligente da IA/Produto
    let inferredTemplate: string;
    if (isManualTemplate && templateLayout) {
      inferredTemplate = templateLayout;
    } else if (preAnalysis.recommendedLayout === 'split-vertical') {
      // Máquinas e equipamentos são obrigatoriamente split para não sobrepor o subtítulo
      inferredTemplate = 'split-vertical';
    } else {
      inferredTemplate = suggestedByAi || preAnalysis.recommendedLayout || 'hero-central';
    }

    const tipoPostagem = finalTipoPostagem;

    // 11. Final structured render object satisfying exact schema and backward compatibility
    const finalRenderObject = {
      // A linha de negócio do conteúdo reflete o escopo em que a arte foi gerada.
      // Correção: antes era `'AGRO'` fixo, mesmo em modo Pet.
      linha: appMode === 'PET' ? 'PET' : 'AGRO',
      tipo_postagem: tipoPostagem,
      formato_gerado: format === 'story' ? 'Story' : 'Feed',
      formato: format === 'story' ? 'story' : 'feed',
      template_layout: inferredTemplate,
      tema: inferredTheme,
      prompt_fundo_ia: photoPrompt,
      fundo_imagem: photoPrompt,
      fundo_imagem_url: inferredBackground,
      textos_hero: {
        titulo: titleText,
        palavra_destaque_ouro: palavraOuro,
        subtitulo: cleanSubtitulo,
      },
      diferenciais_tecnicos: cleanBeneficios,
      textos_da_arte: {
        titulo_impacto: titleText,
        palavra_destaque: palavraOuro,
        subtitulo: cleanSubtitulo,
        bullets_tecnicos: cleanBeneficios,
        cta: cleanCta,
        modulo_preco: cleanModuloPreco,
      },
      caixa_titulo: {
        texto: titleText,
        palavra_ouro: palavraOuro,
        palavra_ouro_destaque: palavraOuro,
      },
      caixa_subtitulo: {
        texto: cleanSubtitulo,
      },
      beneficios_tecnicos: cleanBeneficios,
      modulo_preco: cleanModuloPreco,
      legenda_instagram: cleanLegenda,
      legenda_post: cleanLegenda,
    };

    return res.json({ success: true, data: finalRenderObject });
  } catch (error: any) {
    console.error('[GEMINI API ERROR - generate-content]:', error);
    return res.status(502).json({
      success: false,
      error: 'Falha na geração de IA. Verifique sua quota/chave API ou tente novamente mais tarde.',
      code: error?.status || 502
    });
  }
});


generateRouter.post('/api/generate-image', apiLimiter, async (req, res) => {
  try {
    const { prompt, aspectRatio = '1:1', baseImage, mimeType = 'image/jpeg' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt é obrigatório.' });
    }

    const parts: any[] = [];

    if (baseImage) {
      const cleanBase64 = baseImage.replace(/^data:[^;]+;base64,/, '');
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType || 'image/jpeg',
        },
      });
    }

    parts.push({
      text: `Professional commercial agricultural photography, Brazilian agro farm: ${prompt}. Ultra-realistic, sharp lighting, clean background, 8k resolution.`,
    });

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        },
      });
    } catch (firstErr) {
      console.warn('Fallback to gemini-3.1-flash-lite-image', firstErr);
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        },
      });
    }

    let generatedImageUrl = '';
    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!generatedImageUrl) {
      throw new Error('Nenhuma imagem foi gerada pelo modelo.');
    }

    return res.json({ success: true, imageUrl: generatedImageUrl });
  } catch (error: any) {
    console.error('[GEMINI API ERROR - generate-image]:', error);
    return res.status(502).json({
      success: false,
      error: 'Falha na geração de imagem com IA. Verifique sua quota/chave API ou tente novamente.',
      code: error?.status || 502
    });
  }
});

// --- ROTA DE REMOÇÃO DE FUNDO VIA HUGGING FACE (RMBG 1.4) ---
// NOTA DE SEGURANÇA: o endpoint GET /api/hf-token foi REMOVIDO porque expunha
// o segredo do servidor (HF_TOKEN/FAL_KEY) ao navegador. A remoção de fundo
// continua 100% server-side via POST /api/remove-bg abaixo.
