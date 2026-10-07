export function getDynamicTitleSize(text: string): string {
  const len = text ? text.length : 0;
  if (len <= 25) return 'text-3xl sm:text-4xl';
  if (len <= 50) return 'text-2xl sm:text-3xl';
  return 'text-xl sm:text-2xl';
}
