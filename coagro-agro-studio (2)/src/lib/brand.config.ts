export interface BrandPalette {
  titleColor: string;
  highlightColor: string;
  subtitleColor: string;
  titleFont: string;
}

export function getPalette(scope: 'AGRO' | 'PET', isLight: boolean = false): BrandPalette {
  if (scope === 'PET') {
    return {
      titleColor: 'text-[#4897D0]',
      highlightColor: 'text-[#E96C2C]',
      subtitleColor: 'text-gray-100',
      titleFont: 'font-exo2 font-black tracking-tight',
    };
  }
  
  return {
    titleColor: isLight ? 'text-[#004d40]' : 'text-white',
    highlightColor: 'text-[#ffab00]',
    subtitleColor: isLight ? 'text-gray-700' : 'text-[#E5E7EB]',
    titleFont: 'font-exo2 font-black uppercase tracking-tight',
  };
}
