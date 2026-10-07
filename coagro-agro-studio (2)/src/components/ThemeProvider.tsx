import React, { useEffect } from 'react';
import { useTenantStore } from '../store/tenantStore';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const activeScope = useTenantStore((state) => state.activeScope);

  useEffect(() => {
    const root = document.documentElement;
    
    // Injeta as variáveis CSS no :root
    Object.entries(activeScope.colors).forEach(([key, value]) => {
      // camelCase -> kebab-case
      const cssVarName = `--color-${key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()}`;
      root.style.setProperty(cssVarName, value);
    });
  }, [activeScope]);

  return <>{children}</>;
};
