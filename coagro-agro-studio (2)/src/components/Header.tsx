import React from 'react';
import { useTenantStore } from '../store/tenantStore';
import { LogoHorizontalBranca, CoagroPetLogo } from '../assets/coagroLogos';
import { Leaf, Heart } from 'lucide-react';

export const Header: React.FC = () => {
  const { scopes, activeScopeId, setScope } = useTenantStore();
  const isPet = activeScopeId === 'pet';

  return (
    <header className="shadow-md border-b-4 border-brand-secondary py-3.5 px-4 sm:px-6 transition-colors duration-300 bg-brand-primary text-brand-background">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Toggle Scopes (only if more than 1 scope) */}
        <div className="w-auto flex items-center gap-1 sm:gap-2">
          {scopes.length > 1 && (
            <div className="flex items-center rounded-full p-1 border shadow-inner bg-black/20 border-black/30">
              {scopes.map(scope => (
                <button
                  key={scope.id}
                  onClick={() => setScope(scope.id)}
                  className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                    activeScopeId === scope.id 
                      ? 'bg-brand-background text-brand-primary shadow-md' 
                      : 'text-brand-background/70 hover:text-brand-background'
                  }`}
                >
                  {scope.id === 'agro' ? <Leaf className="w-3.5 h-3.5" /> : <Heart className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{scope.name.split(' ')[1] || scope.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Official Coagro Logo (Temporariamente usando os componentes React até a migração de assets) */}
        <div className="w-44 sm:w-56 py-0.5 flex justify-center">
          {isPet ? (
            <CoagroPetLogo className="h-10 sm:h-12 w-auto" />
          ) : (
            <LogoHorizontalBranca className="h-9 sm:h-11 w-auto" />
          )}
        </div>

        <div className="w-auto flex justify-end min-w-[80px]">
        </div>
      </div>
    </header>
  );
};

