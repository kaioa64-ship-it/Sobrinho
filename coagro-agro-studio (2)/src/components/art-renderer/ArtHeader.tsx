import React from 'react';
import { CoagroLogo, CoagroPetLogo, LogoVariant } from '../../assets/coagroLogos';

interface ArtHeaderProps {
  logoVariant?: LogoVariant;
  isStory: boolean;
  align?: 'center' | 'left';
  scope?: 'AGRO' | 'PET';
}

export const ArtHeader: React.FC<ArtHeaderProps> = ({
  logoVariant = 'h-azul',
  isStory,
  align = 'center',
  scope = 'AGRO',
}) => {
  const isPet = scope === 'PET';

  if (align === 'left') {
    return (
      <div className="flex items-center justify-start shrink-0">
        <div className={isPet ? "w-24 drop-shadow-sm" : "w-28 drop-shadow-sm"}>
          {isPet ? <CoagroPetLogo className="w-full h-auto" /> : <CoagroLogo variant={logoVariant} className="w-full h-auto" />}
        </div>
      </div>
    );
  }

  return (
    <header className="flex items-center justify-center min-h-0 w-full">
      <div className={`${isStory ? 'w-[34%]' : 'w-[31%]'} max-w-[150px] drop-shadow-sm`}>
        {isPet ? <CoagroPetLogo className="w-full h-auto mx-auto" /> : <CoagroLogo variant={logoVariant} className="w-full h-auto mx-auto" />}
      </div>
    </header>
  );
};
