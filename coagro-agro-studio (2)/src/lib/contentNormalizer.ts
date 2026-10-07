export const cleanNoise = (value?: any): string => {
  if (value === undefined || value === null) return '';
  const strValue = typeof value === 'string' ? value : String(value);
  return strValue
    .replace(/divis[ãa]o\s+agropecu[áa]ria/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const normalizeBenefit = (value?: string): string =>
  cleanNoise(value)
    .replace(/[.,;:]+$/, '')
    .trim();

export const normalizeBenefits = (values?: any): string[] => {
  if (!values) return [];
  if (typeof values === 'string') {
    // If AI returned a string by mistake, split it if possible
    return [normalizeBenefit(values)];
  }
  if (!Array.isArray(values)) return [];
  return values.map(normalizeBenefit).filter(Boolean).slice(0, 3);
};

export function resolveDefaultCta(
  mode: 'PROMOTION' | 'SINGLE_PRICE' | 'INFORMATIVE',
  category?: string
): string {
  if (mode === 'PROMOTION') return 'GARANTA JÁ O SEU';
  if (mode === 'SINGLE_PRICE') return 'CONSULTE DISPONIBILIDADE';

  const normalized = (category || '').toLowerCase();
  if (normalized.includes('vacina') || normalized.includes('veterin')) {
    return 'FALE COM NOSSA EQUIPE';
  }

  return 'SAIBA MAIS';
}
