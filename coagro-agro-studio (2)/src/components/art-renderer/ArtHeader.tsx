import React from 'react';
import { CoagroLogo, LogoVariant } from '../../assets/coagroLogos';

interface ArtHeaderProps {
  logoVariant: LogoVariant;
  isStory: boolean;
  align?: 'center' | 'left';
}

export const ArtHeader: React.FC<ArtHeaderProps> = ({
  logoVariant,
  isStory,
  align = 'center',
}) => {
  if (align === 'left') {
    return (
      <div className="flex items-center justify-start shrink-0">
        <div className="w-28 drop-shadow-sm">
          <CoagroLogo variant={logoVariant} className="w-full h-auto" />
        </div>
      </div>
    );
  }

  return (
    <header className="flex items-center justify-center min-h-0 w-full">
      <div className={`${isStory ? 'w-[34%]' : 'w-[31%]'} max-w-[150px] drop-shadow-sm`}>
        <CoagroLogo variant={logoVariant} className="w-full h-auto mx-auto" />
      </div>
    </header>
  );
};
