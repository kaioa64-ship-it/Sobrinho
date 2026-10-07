import { formatBrlValue } from './priceFormatter';

export interface ExtractedPriceInfo {
  hasPrice: boolean;
  valor_de: string;
  valor_por: string;
  condicao: string;
}

/**
 * Extrai automaticamente valores de promoção (De, Por) e condições de pagamento
 * de qualquer texto digitado pelo usuário (ex: "Arame Moto de R$ 399 por R$ 359 em até 6x").
 */
export function extractPriceFromText(rawText?: string): ExtractedPriceInfo {
  if (!rawText || !rawText.trim()) {
    return { hasPrice: false, valor_de: '', valor_por: '', condicao: '' };
  }

  const text = rawText.trim();

  let deRaw = '';
  let porRaw = '';
  let condicaoRaw = '';

  // 1. Extração de condições de pagamento (ex: "à vista", "em até 6x no cartão", "10x sem juros")
  const matchCond = text.match(
    /(em\s+at[ée]\s+\d+\s*x(?:\s+sem\s+juros|\s+no\s+cart[ãa]o|\s+fixas)?|[aà]\s*vista(?:\s+no\s+pix|\s+no\s+dinheiro)?|no\s+cart[ãa]o(?:\s+em\s+at[ée]\s+\d+\s*x)?|\d+\s*x\s+sem\s+juros)/i
  );
  if (matchCond) {
    condicaoRaw = matchCond[0].toUpperCase().trim();
  }

  // 2. Procura padrão "de [valor] por [valor]"
  const matchDePor = text.match(
    /(?:de\s*(?:r\$\s*)?([\d]+(?:[.,]\d+)*))\s*(?:,|e|\/|-)?\s*por\s*(?:r\$\s*)?([\d]+(?:[.,]\d+)*)/i
  );

  if (matchDePor) {
    deRaw = matchDePor[1];
    porRaw = matchDePor[2];
  } else {
    // 3. Procura apenas "por [valor]"
    const matchPor = text.match(/por\s*(?:r\$\s*)?([\d]+(?:[.,]\d+)*)/i);
    if (matchPor) {
      porRaw = matchPor[1];
      // Verifica se há um "de [valor]" antes
      const matchDe = text.match(/de\s*(?:r\$\s*)?([\d]+(?:[.,]\d+)*)/i);
      if (matchDe) {
        deRaw = matchDe[1];
      }
    } else {
      // 4. Procura ocorrências de "R$ [valor]"
      const matchesRS = [...text.matchAll(/r\$\s*([\d]+(?:[.,]\d+)*)/gi)];
      if (matchesRS.length >= 2) {
        deRaw = matchesRS[0][1];
        porRaw = matchesRS[1][1];
      } else if (matchesRS.length === 1) {
        porRaw = matchesRS[0][1];
      }
    }
  }

  const formattedPor = porRaw ? formatBrlValue(porRaw) : '';
  const formattedDe = deRaw ? formatBrlValue(deRaw) : '';

  const hasPrice = Boolean(formattedPor);

  return {
    hasPrice,
    valor_de: formattedDe,
    valor_por: formattedPor,
    condicao: condicaoRaw,
  };
}
