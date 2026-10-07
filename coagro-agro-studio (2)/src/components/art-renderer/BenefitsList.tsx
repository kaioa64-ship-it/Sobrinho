import React from 'react';
import { CheckCircle } from 'lucide-react';

interface BenefitsListProps {
  benefits: string[];
  variant: 'badges-horizontal' | 'list-vertical';
  textColor?: string;
  className?: string;
}

export const BenefitsList: React.FC<BenefitsListProps> = ({
  benefits,
  variant,
  textColor = 'text-white',
  className = '',
}) => {
  if (benefits.length === 0) return null;

  if (variant === 'list-vertical') {
    return (
      <div className={`space-y-3 text-left ${className}`}>
        {benefits.map((benefit, index) => (
          <div key={`${index}-${benefit}`} className="flex items-start gap-2.5">
            <CheckCircle className="w-5 h-5 text-[#ffab00] shrink-0 mt-0.5" />
            <span className={`text-[12px] sm:text-[14px] font-bold leading-snug uppercase tracking-wide ${textColor}`}>
              {benefit}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Variant: badges-horizontal (Hero Central)
  const isLightText = textColor.includes('#004d40') || textColor.includes('gray') || textColor.includes('black');

  return (
    <div className="flex flex-col items-center justify-center gap-1.5 min-h-0 w-full">
      {benefits.map((benefit, index) => (
        <div
          key={`${index}-${benefit}`}
          className={`max-w-[94%] min-h-8 px-3 py-1.5 rounded-full flex items-center justify-center gap-2 text-[12px] sm:text-[14px] font-semibold ${
            isLightText
              ? 'bg-white/90 border border-gray-200 text-[#004d40] shadow-2xs'
              : 'bg-black/40 border border-white/20 text-white shadow-2xs'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-[#ffab00] shrink-0" />
          <span className="leading-tight text-center">{benefit}</span>
        </div>
      ))}
    </div>
  );
};
