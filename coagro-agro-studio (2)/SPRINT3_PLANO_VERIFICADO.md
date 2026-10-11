# 📋 PLANO DE IMPLEMENTAÇÃO VERIFICADO — SPRINT 3: OTIMIZAÇÃO & ESCALA

> **Status:** ✅ APROVADO COM AJUSTES OPERACIONAIS  
> **Auditoria:** Laudo de consistência contra codebase, suíte de testes (161 testes) e gates de build/lint.

---

## 🎯 Resumo Executivo & Decisões Arquiteturais

1. **Fila de Concorrência Neural (WASM @imgly):**
   * Limitar a concorrência a 1 job por vez (`concurrency: 1`) apenas para o pipeline neural pesado (`removeBackground`).
   * Chroma-key local (`removeWhiteBackground`, ~20ms em canvas) permanece síncrono/direto sem fila para preservar fluidez do render ao vivo no `SingleArtRenderer`.
   * Suporte a cancelamento real com `AbortController` (descarta e aborta workers órfãos quando há timeout ou troca rápida de foto).
   * Buffer de progresso: emitir callbacks de porcentagem apenas após o job sair da fila e iniciar o processamento real.

2. **Service Worker Offline (PWA Resiliente):**
   * Registro com caminho de origem absoluto (`/sw.js`) e envelopado defensivamente em `try/catch`.
   * Limpeza de caches obsoletos no evento `activate` (`caches.keys()` expurgando versões diferentes de `coagro-studio-v1`).
   * Modelo neural da CDN externa (`staticimgly.com`): não cacheado na v1 por volumetria de megabytes. Comportamento offline padrão esperado: fallback determinístico para chroma-key local.
   * `skipWaiting` + `clientsClaim` combinado com estratégia `NetworkFirst` no `index.html`.

3. **Versionamento e Ciclo de Vida de Cache (`productStorage.ts`):**
   * Manter `DB_VERSION = 1` no IndexedDB (sem triggers desnecessários de `onupgradeneeded`), adicionando `schemaVersion: 2` nos registros salvos.
   * TTL de 60 dias (`pruneExpiredProducts`) implementado e testado tanto no IndexedDB quanto no `memoryStore` em RAM (garantindo execução real dos testes em ambiente Node/Vitest).
   * Métricas diagnósticas via `getStorageStats()`.

---

## 📋 Trilha Cirúrgica de Execução

| Etapa | Ação | Status |
|---|---|:---:|
| **Etapa 0** | Corrigir os 7 erros TS pré-existentes (`App.tsx` e `sharedFormState.ts`) → `npm run lint` verde | ✅ Concluído |
| **Etapa 1** | Implementar `productStorage.ts` (schemaVersion: 2, TTL 60 dias, prune no IDB + memoryStore, stats) + testes unitários | ✅ Concluído |
| **Etapa 2** | Implementar `src/lib/imageQueue.ts` (concurrency 1, AbortController, buffering de progresso) + testes unitários | ✅ Concluído |
| **Etapa 3** | Implementar `public/sw.js` e `src/lib/swRegister.ts` (registro absoluto, try/catch, purge de caches antigos) | ✅ Concluído |
| **Etapa 4** | Gate Final: `npm run lint` + `npm run build` + `npm test` (169 testes verdes) + commit semântico na `main` | ✅ Concluído |
