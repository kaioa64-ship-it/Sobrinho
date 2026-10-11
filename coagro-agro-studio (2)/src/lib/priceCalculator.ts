/**
 * Utilitário de cálculo de desconto e economia para o Coagro Studio
 */

export interface DiscountInfo {
  percent: number;
  savingsBrl: string;
  badgeText: string;
}

/**
 * Converte string de preço em formato brasileiro (ex: "58,00", "R$ 1.250,90") para número float.
 */
export function parseBrlToNumber(valStr?: string | null): number {
  if (!valStr) return 0;
  // Remove "R$", espaços, pontos de milhar e troca vírgula por ponto
  const clean = valStr
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

/**
 * Calcula percentual de desconto e valor economizado a partir dos valores DE e POR.
 */
export function calculateDiscount(valorDeStr?: string, valorPorStr?: string): DiscountInfo | null {
  const de = parseBrlToNumber(valorDeStr);
  const por = parseBrlToNumber(valorPorStr);

  if (de <= 0 || por <= 0 || de <= por) {
    return null;
  }

  const percent = Math.round(((de - por) / de) * 100);
  const diff = (de - por).toFixed(2).replace('.', ',');

  if (percent <= 0) return null;

  return {
    percent,
    savingsBrl: diff,
    badgeText: `${percent}% OFF`
  };
}
