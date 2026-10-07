/**
 * Utilitário de formatação rigorosa de valores monetários brasileiros (BRL).
 * Garante que valores fechados sempre tenham ",00" e valores com centavos
 * tenham a vírgula com 2 casas decimais (ex: 359 -> 359,00 | 1250 -> 1.250,00 | 359.9 -> 359,90).
 */

export function formatBrlValue(rawInput?: string | number | null): string {
  if (rawInput === undefined || rawInput === null) return '';
  const str = String(rawInput).trim();
  if (!str) return '';

  // Remove "R$", "r$", espaços e caracteres não numéricos exceto vírgula e ponto
  let cleaned = str.replace(/r\$\s*/gi, '').trim();

  // Se estiver vazio após limpeza
  if (!cleaned) return '';

  // Verifica se há vírgula ou ponto
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  let integerPart = '';
  let decimalPart = '';

  if (hasComma && hasDot) {
    // Caso padrão brasileiro: 1.250,00
    // Ou formato americano: 1,250.00
    const lastCommaIdx = cleaned.lastIndexOf(',');
    const lastDotIdx = cleaned.lastIndexOf('.');

    if (lastCommaIdx > lastDotIdx) {
      // 1.250,50 -> vírgula é o separador decimal
      integerPart = cleaned.slice(0, lastCommaIdx).replace(/\D/g, '');
      decimalPart = cleaned.slice(lastCommaIdx + 1).replace(/\D/g, '');
    } else {
      // 1,250.50 -> ponto é o separador decimal
      integerPart = cleaned.slice(0, lastDotIdx).replace(/\D/g, '');
      decimalPart = cleaned.slice(lastDotIdx + 1).replace(/\D/g, '');
    }
  } else if (hasComma) {
    // Apenas vírgula: ex: "359,90", "359,9", "359,"
    const parts = cleaned.split(',');
    integerPart = parts[0].replace(/\D/g, '');
    decimalPart = parts.slice(1).join('').replace(/\D/g, '');
  } else if (hasDot) {
    // Apenas ponto: ex: "359.90", "359.9", "1250.50" OU milhar "1.250"
    const parts = cleaned.split('.');
    if (parts.length === 2 && parts[1].length <= 2) {
      // É decimal: ex "359.9" ou "359.50"
      integerPart = parts[0].replace(/\D/g, '');
      decimalPart = parts[1].replace(/\D/g, '');
    } else {
      // É separador de milhar: ex "1.250" -> integer 1250, sem centavos
      integerPart = cleaned.replace(/\D/g, '');
      decimalPart = '';
    }
  } else {
    // Apenas números inteiros: ex "359", "1250"
    integerPart = cleaned.replace(/\D/g, '');
    decimalPart = '';
  }

  if (!integerPart && !decimalPart) return '';

  if (!integerPart) integerPart = '0';

  // Normaliza os centavos: se vazio -> "00", se 1 dígito -> "X0", se mais -> 2 primeiros dígitos
  if (!decimalPart) {
    decimalPart = '00';
  } else if (decimalPart.length === 1) {
    decimalPart = decimalPart + '0';
  } else {
    decimalPart = decimalPart.slice(0, 2);
  }

  // Formata o milhar no padrão brasileiro (1.250)
  const formattedInteger = Number(integerPart).toLocaleString('pt-BR');

  return `${formattedInteger},${decimalPart}`;
}

export function formatBrlWithSymbol(rawInput?: string | number | null): string {
  const formatted = formatBrlValue(rawInput);
  if (!formatted) return '';
  return `R$ ${formatted}`;
}

/**
 * Calcula a economia (savings) subtraindo o preço atual do preço antigo.
 * Retorna a diferença formatada em string no padrão BRL (sem o R$), ex: "700,00".
 * Retorna vazio caso os valores sejam inválidos ou o preço atual não seja menor que o antigo.
 */
export function calculateSavings(currentPrice?: string | number | null, oldPrice?: string | number | null): string {
  if (!currentPrice || !oldPrice) return '';

  const cpFormatted = formatBrlValue(currentPrice);
  const opFormatted = formatBrlValue(oldPrice);

  if (!cpFormatted || !opFormatted) return '';

  const cpValue = parseFloat(cpFormatted.replace(/\./g, '').replace(',', '.'));
  const opValue = parseFloat(opFormatted.replace(/\./g, '').replace(',', '.'));

  if (!isNaN(cpValue) && !isNaN(opValue) && opValue > cpValue) {
    const savings = (opValue - cpValue).toFixed(2);
    // Replace the decimal dot with a comma and format thousand separators if needed
    const integerPart = savings.split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimalPart = savings.split('.')[1];
    return `${integerPart},${decimalPart}`;
  }

  return '';
}
