import React from 'react';
import { CommunicationMode } from '../../lib/communicationMode';

interface PriceCardProps {
  mode: CommunicationMode;
  oldPrice?: string;
  currentPrice: string;
  condition?: string;
  variant?: 'agro' | 'pet';
}

export const PriceCard: React.FC<PriceCardProps> = ({
  mode,
  oldPrice,
  currentPrice,
  condition,
  variant = 'agro'
}) => {
  const isPromotion = mode === 'PROMOTION';
  const isPet = variant === 'pet';

  return (
    <div className={`min-w-[150px] px-4 py-3 rounded-2xl shadow-2xl flex flex-col items-center border-2 ${isPet ? 'bg-[#4897D0] text-white border-white' : 'bg-[#ffab00] text-[#001C71] border-white/80'}`}>
      {isPromotion && oldPrice && (
        <div className="text-[10px] font-bold opacity-75 line-through whitespace-nowrap">
          DE: {oldPrice}
        </div>
      )}

      <div className="flex items-baseline justify-center flex-nowrap whitespace-nowrap gap-1">
        {isPromotion && (
          <span className="text-[10px] font-black uppercase font-exo2">
            POR:
          </span>
        )}
        <span className="text-[11px] font-black font-exo2">R$</span>
        <span className="text-[25px] font-black font-exo2 tracking-tight">
          {currentPrice}
        </span>
      </div>

      {condition && (
        <span className="mt-0.5 text-[9px] font-extrabold uppercase tracking-wider whitespace-nowrap">
          {condition}
        </span>
      )}
    </div>
  );
};
