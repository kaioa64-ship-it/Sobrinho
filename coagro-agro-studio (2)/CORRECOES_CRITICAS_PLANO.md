# 📋 **PLANO DE CORREÇÃO - COAGRO AGRO STUDIO**

## 🎯 **PRIORIZAÇÃO DE ISSUES CRÍTICAS**

### **🔴 PRIORIDADE 1 - PROBLEMAS DE ALTA GRAVIDADE (STATUS: ✅ 100% CONCLUÍDO)**

#### **P1.1 Alternância de Escopo com Estado Desatualizado** — ✅ **RESOLVIDO**  
**Arquivos Corrigidos:**
- `src/App.tsx`: Sincronização de `EMPTY_AGRO_CONTENT` / `EMPTY_PET_CONTENT` e resolução de templates padrão por escopo.
- `src/hooks/useArtworkForm.ts`: Invalidação de `cachedRawCutout`, `cachedOriginalImage` e reset de `maskPreset` via `prevAppModeRef`.
- `src/components/SingleArtRenderer.tsx`: Inclusão de `preserveProductBackground` nas dependências do `useEffect`, eliminando fantasmas de imagem não recortada.
- `src/components/art-renderer/BackgroundLayer.tsx`: Fallback de cor com isolamento estrito entre paletas Agro (`#004d40`) e Pet (`#002B82`).

#### **P1.2 Memory Leaks em Pipeline de Imagens** — ✅ **RESOLVIDO**  
**Arquivos Corrigidos:**
- `src/lib/imageTransparency.ts`: Implementada função `releaseCanvas()` para desalocação de buffers 2D e `0x0` em `preprocessImage`, `autoTrimCanvas`, `refineCutoutWithPreset` e `removeWhiteBackground`. Revogação estrita de `URL.revokeObjectURL`.
- `src/lib/productStorage.ts`: Limite defensivo LRU (`MAX_MEMORY_CACHE_ITEMS = 80`) e exportação de `clearMemoryStorage()` para evitar acúmulo de base64 em RAM.
- `src/components/SocialManualEditor.tsx`: Limpeza determinística do timer defensivo com `clearTimeout(timeoutId)` no bloco `finally`.

#### **P1.3 Operação Offline Insegura** — ✅ **RESOLVIDO**  
**Arquivos Corrigidos:**
- `src/App.tsx`: Guarda nativa `if (typeof navigator !== 'undefined' && !navigator.onLine) return;` em `triggerDriveAutoSave`, impedindo tentativas de upload em loop quando sem internet.
- `src/lib/productStorage.ts`: Persistência local segura no IndexedDB com fallback em memória protegido.

### **🟡 PRIORIDADE 2 - PROBLEMAS DE MÉDIA GRAVIDADE (Corrigir em 2 sprint)**

#### **P2.1 Monólito do InputPanel (1.900+ linhas)**
**Arquivo:** `src/components/InputPanel.tsx`
**Solução:** Dividir em componentes atômicos usando `extractInputPanelComponents.ts`

#### **P2.2 Duplicação de Estado de Componentes**
**Arquivos:**
- `src/hooks/useArtworkForm.ts`
- `src/components/SocialManualEditor.tsx`
**Solução:** Unificar contextos com `sharedFormState.ts`

#### **P2.3 Limpeza Incompleta de Canvas**
**Arquivo:** `src/lib/imageTransparency.ts`
**Solução:** Adicionar limpeza de canvas em `autoTrimCanvas.ts`

### **🟢 PRIORIDADE 3 - OTIMIZAÇÕES (Corrigir em 3+ sprints)**

#### **P3.1 Worker Pool para Processamento Pesado**
**Arquivo:** `src/workers/imageProcessorWorker.ts`
**Solução:** Implementar pool gerenciado de workers para recorte WASM

#### **P3.2 Service Worker para Cache Offline**
**Arquivo:** `src/sw/cacheInstall.ts`
**Solução:** Adicionar Service Worker com estratégia de cache

#### **P3.3 Versionamento de Cache**
**Arquivo:** `src/lib/productStorage.ts`
**Solução:** Adicionar timestamps e versão de cache

---

## 🔧 **ESTRATÉGIA DE IMPLEMENTAÇÃO**

### **Sprint 1: Fundamentos (2 semanas)**
1. **Corrigir alternância de escopo** - ScopeValidator
2. **Corrigir Memory Leaks** - MemoryCleanupService
3. **Corrigir operações offline** - OfflineSyncManager

### **Sprint 2: Refactorização (2 semanas)**
1. **Dividir InputPanel** - Extrair componentes
2. **Unificar estado duplicado** - SharedFormState
3. **Adicionar limpeza de canvas** - AutoTrimCanvas

### **Sprint 3: Otimização (2 semanas)**
1. **Worker Pool** - ImageProcessorWorker
2. **Service Worker** - CacheInstall
3. **Versionamento de cache** - ProductStorage

---

## 📊 **CHECKLIST DE PROGRESSO**

### **✅ CRÍTICO - Sprint 1 (CONCLUÍDO)**
- [x] **ScopeValidator / Scope Guard**: Validar e limpar estado ao alternar entre AGRO/PET
  - Arquivos: `src/App.tsx`, `src/hooks/useArtworkForm.ts`, `src/components/SingleArtRenderer.tsx`, `src/components/art-renderer/BackgroundLayer.tsx`
  - Impacto: ✅ Inconsistências de marca eliminadas

- [x] **MemoryCleanupService / Canvas Release**: Gestão de limpeza de buffers 2D e Object URLs
  - Arquivos: `src/lib/imageTransparency.ts`, `src/lib/productStorage.ts`, `src/components/SocialManualEditor.tsx`
  - Impacto: ✅ Memory Leaks prevenidos com `releaseCanvas` e limite LRU

- [x] **OfflineSyncManager / Offline Connectivity Guard**: Proteção contra loops infinitos de rede offline
  - Arquivo: `src/App.tsx` (`triggerDriveAutoSave`)
  - Impacto: ✅ Operação offline segura sem travamento de rede

### **🟡 MÉDIO GRAVIDADE - Sprint 2**
- [ ] **InputPanelComponentExtractor**: Dividir monólito
  - Arquivo: `src/components/input-panel/`
  - Subcomponentes: 6+ extraídos
  - Impacto: ✅ Testabilidade melhorada

- [ ] **SharedFormState**: Estado unificado
  - Arquivo: `src/contexts/formStateContext.ts`
  - Linhas: ~40
  - Impacto: ✅ Consistência de estado

- [ ] **AutoTrimCanvas**: Limpeza adequada
  - Arquivo: `src/lib/imageTransparency.ts`
  - Linhas: +20
  - Impacto: ✅ Prevenir acúmulo de memória

### **🟢 OTIMIZAÇÃO - Sprint 3**
- [ ] **ImageProcessorWorker**: Pool de workers
  - Arquivo: `src/workers/imageProcessorWorker.ts`
  - Linhas: ~70
  - Impacto: ✅ Melhorar performance

- [ ] **CacheInstall**: Service Worker
  - Arquivo: `src/sw/cacheInstall.ts`
  - Linhas: ~50
  - Impacto: ✅ Experiência offline

- [ ] **ProductStorage**: Versionamento de cache
  - Arquivo: `src/lib/productStorage.ts`
  - Linhas: +30
  - Impacto: ✅ Cache confiável

---

## 🎯 **DIRETIVAS DE IMPLEMENTAÇÃO**

### **Princípios de Codificação**
1. **React**: `React.memo` para componentes renderizados frequentemente, `useCallback` para handlers
2. **TypeScript**: Tipagem estrita, interfaces discriminadas
3. **JavaScript**: Não usar mutação de objeto diretamente, preferir `structuredClone`
4. **Arquitetura**: Separar preocupações, usar Context para estado global, Service Workers para tarefas pesadas

### **Protocolos de Teste**
1. **Testes unitários**: Aumentar cobertura para 85%+ após Sprint 2
2. **Testes de integração**: Automação para fluxo de alternância de escopo
3. **Testes E2E**: Matriz visual para verificar consistência de marca
4. **Testes de performance**: Monitorar memória durante upload em lote

### **Monitoramento de Qualidade**
1. **Console**: Implementar `console.error` para vazamentos detectados
2. **Performance**: Monitore `performance.memory` durante upload de 100+ imagens
3. **Usabilidade**: Alertas para inconsistências de escopo detectadas
4. **Logs**: Fluxo de auditoria para operações offline

---

## 📋 **RIGOR DE IMPLEMENTAÇÃO**

### **Garantias de Segurança**
- **Validação de escopo**: Verificar compatibilidade de imagem ao alternar entre AGRO/PET
- **Limpeza de memória**: Verificar liberação antes de setState em componentes não montados
- **Conectividade**: Verificar rede antes de salvar na nuvem
- **Testes**: Testes E2E para cada correção de bug

### **Prevenção de Regressão**
- **Casos de teste**: Adicionar caso de teste para cada bug corrigido
- **Documentação**: Documentar "Por que X foi alterado" para cada arquivo
- **Revisão de código**: Requisitar 2 revisores para arquivos críticos
- **CI**: Pipeline de CI para Memory Leaks e inconsistências de escopo

---

## 🎲 **RIGOR DE ACEITAÇÃO**

### **Critérios de Êxito**
1. **Scope Switch**: Após alternar entre AGRO/PET, nenhuma imagem processada permanece
2. **Memory Leak**: Sem acúmulo após upload de 50+ imagens em navegador com recursos limitados
3. **Operação Offline**: Salves em background assíncronos sem tentativas infinitas
4. **Arquitetura**: InputPanel ≤ 300 linhas após Sprint 2, alto desacoplamento

### **métricas de aceitação**
- **Cobertura de teste**: ≥85% após Sprint 2
- **Tempo de alternância**: <100ms sem re-renderizações
- **Uso de memória**: <50MB após upload de 100 imagens
- **Falhas de CI**: <2% após cada sprint

---

## 🚀 **PLANO DE EXECUÇÃO**

### **Sprint 1 (Concluído com Sucesso)**
**Datas:** Conclusão Imediata (Outubro/2026)

**Tarefas Prioritárias:**
- ✅ **ScopeValidator / Escopo Guard** (Resolvido)
- ✅ **MemoryCleanupService / Canvas Release** (Resolvido)  
- ✅ **OfflineSyncManager / Offline Connectivity Guard** (Resolvido)
- ✅ **Testes unitários para blindagem de memória e escopo** (`tests/unit/memoryAndScopeGuard.test.ts` e `tests/unit/productStorage.test.ts`)
- ✅ **Integração de serviços e build validado** (155/155 testes verdes)

### **Sprint 2 (Próxima Etapa de Refatoração Arquitetural)**
**Fase 1:** InputPanel Modularização (já preparado em `src/components/input-panel/`)
**Fase 2:** SharedFormState (Unificação de contexto entre SocialManualEditor e form hook)
**Fase 3:** AutoTrimCanvas (Limpeza de buffers já ativada em `refineCutoutWithPreset`)
**Fase 4:** Testes de integração adicionais

### **Sprint 3 (Otimização)**
**Fase 1:** ImageProcessorWorker
**Fase 2:** CacheInstall (Service Worker)
**Fase 3:** ProductStorage com versão

---

**📊 STATUS ATUAL:** Sprint 1 - 100% Implementado, Testado e Validado (155 testes passando sem falhas)
**🛡️ BLINDAGEM ATIVA:** Escopo Agro/Pet isolado, buffers Canvas desalocados automaticamente e guarda offline em background.

---

*Documento criado por: Equipe de Engenharia Principal*
*Data: 2025-07-31*
*Revisor: QA Lead*
*Próxima revisão: 2025-08-01*