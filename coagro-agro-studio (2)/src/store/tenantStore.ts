import { create } from 'zustand';
import tenantConfig from '../config/tenant.config.json';

export interface TenantScope {
  id: string;
  name: string;
  colors: Record<string, string>;
  assets: Record<string, string>;
}

interface TenantState {
  tenantId: string;
  appName: string;
  scopes: TenantScope[];
  activeScopeId: string;
  activeScope: TenantScope;
  setScope: (scopeId: string) => void;
}

export const useTenantStore = create<TenantState>((set) => ({
  tenantId: tenantConfig.tenantId,
  appName: tenantConfig.appName,
  scopes: tenantConfig.scopes,
  activeScopeId: tenantConfig.scopes[0].id,
  activeScope: tenantConfig.scopes[0],
  
  setScope: (scopeId) => set((state) => {
    const newScope = state.scopes.find(s => s.id === scopeId);
    if (!newScope) return state;
    return { activeScopeId: scopeId, activeScope: newScope };
  }),
}));
