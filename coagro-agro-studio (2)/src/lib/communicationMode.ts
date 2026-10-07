export type CommunicationMode =
  | 'PROMOTION'
  | 'SINGLE_PRICE'
  | 'INFORMATIVE';

interface PriceData {
  ativo?: boolean;
  valor_de?: string;
  valor_por?: string;
  condicoes_pagamento?: string;
}

const hasValue = (value?: string): boolean =>
  Boolean(value && value.trim());

export function resolveCommunicationMode(
  explicitType: string | undefined,
  price: PriceData | undefined
): CommunicationMode {
  const type = explicitType?.trim().toLowerCase();

  if (['promocao', 'promoção', 'promotion'].includes(type || '')) {
    return 'PROMOTION';
  }

  if (['preco-unico', 'preço-único', 'single-price'].includes(type || '')) {
    return 'SINGLE_PRICE';
  }

  if (['informativo', 'informative', 'informativo_novidade'].includes(type || '')) {
    return 'INFORMATIVE';
  }

  const hasOldPrice = hasValue(price?.valor_de);
  const hasCurrentPrice = hasValue(price?.valor_por);

  if (price?.ativo && hasOldPrice && hasCurrentPrice) {
    return 'PROMOTION';
  }

  if (price?.ativo && hasCurrentPrice) {
    return 'SINGLE_PRICE';
  }

  return 'INFORMATIVE';
}
