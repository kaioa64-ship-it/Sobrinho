/**
 * Registrador defensivo do Service Worker para o Coagro Studio
 * Garante resiliência offline e não quebra em ambientes Electron (file://), SSR ou sem suporte.
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Ignora se estiver rodando via file:// (Electron packaging local)
  if (window.location.protocol === 'file:') {
    return;
  }

  window.addEventListener('load', () => {
    try {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[SW] Registrado com sucesso:', registration.scope);
        })
        .catch((err) => {
          console.warn('[SW] Falha ao registrar Service Worker (tolerado):', err);
        });
    } catch (err) {
      console.warn('[SW] Exceção defensiva no registro do Service Worker:', err);
    }
  });
}
