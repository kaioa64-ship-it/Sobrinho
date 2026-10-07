import React from 'react';

interface ArtCtaProps {
  ctaText: string;
  fullWidth?: boolean;
  variant?: 'primary' | 'white' | 'pet';
}

export const ArtCta: React.FC<ArtCtaProps> = ({ 
  ctaText, 
  fullWidth = true,
  variant = 'primary'
}) => {
  if (!ctaText || !ctaText.trim()) return null;

  const bgClasses = variant === 'white' 
    ? 'bg-white text-[#004d40] border-transparent' 
    : variant === 'pet'
    ? 'bg-white text-[#4897D0] border-transparent'
    : 'bg-[#004d40] text-white border-white/20';

  const arrowColor = variant === 'pet' ? 'text-[#E96C2C]' : 'text-[#ffab00]';

  return (
    <div className={`${fullWidth ? 'w-full' : 'w-full max-w-sm'} min-h-11 px-4 rounded-2xl ${bgClasses} flex items-center justify-center gap-2 shadow-xl border select-none`}>
      <span className={`${arrowColor} font-black text-xs shrink-0`}>▶</span>
      <span className="font-exo2 font-black uppercase tracking-wider text-sm text-center">
        {ctaText}
      </span>
    </div>
  );
};
