import React from 'react';
import { CanvasTheme } from '../../types/agro';

interface BackgroundLayerProps {
  theme: CanvasTheme;
  activeBackground?: string;
  isPhoto: boolean;
  isBlue: boolean;
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
  theme,
  activeBackground,
  isPhoto,
  isBlue,
}) => {
  return (
    <>
      {isPhoto && activeBackground && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={activeBackground}
            alt="Cenário fotográfico agro"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-45 contrast-110 saturate-110 scale-105"
          />
          <div
            className="absolute inset-0"
            style={{
              background: isBlue
                ? 'radial-gradient(circle at 50% 40%, rgba(0,43,130,.65), rgba(0,28,113,.88) 80%)'
                : 'radial-gradient(circle at 50% 40%, rgba(0,107,89,.62), rgba(0,77,64,.85) 80%)',
            }}
          />
        </div>
      )}

      {/* Brilhos atmosféricos sutis de ambientação */}
      {theme !== 'clean-branco' && (
        <>
          <div className={`absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none z-0 ${isBlue ? 'bg-[#E96C2C]/10' : 'bg-[#ffab00]/10'}`} />
          <div className={`absolute -bottom-16 -left-16 w-56 h-56 rounded-full blur-3xl pointer-events-none z-0 ${isBlue ? 'bg-[#4897D0]/15' : 'bg-[#00796b]/15'}`} />
        </>
      )}
    </>
  );
};
