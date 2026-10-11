# 📋 **PLANO DE CORREÇÃO - COAGRO AGRO STUDIO**

## 🎯 **PRIORIZAÇÃO DE ISSUES CRÍTICAS**

### **🔴 PRIORIDADE 1 - PROBLEMAS DE ALTA GRAVIDADE (Corrigir Imediatamente)**

#### **P1.1 Alternância de Escopo com Estado Desatualizado**  
**Arquivos:**
- `src/App.tsx` - state management
- `src/hooks/useArtworkForm.ts` - cached images
- `src/components/SingleArtRenderer.tsx` - useEffect
- `src/components/BackgroundLayer.tsx` - theme switching

**Problema:** Quando alterna entre AGRO ↔ PET, imagens processadas vazam, causando inconsistências de marca.

**Solução:** Implementar `scopeValidator.ts` com limpeza de estado robusta.

#### **P1.2 Memory Leaks em Pipeline de Imagens**  
**Arquivos:**
- `src/lib/imageTransparency.ts` - URLs de objeto
- `src/lib/productStorage.ts` - cache duplo
- `src/components/SocialManualEditor.tsx` - timeout e workers

**Problema:** URLs de objeto, canvas e workers ativos nunca são liberados.

**Solução:** Implementar `memoryCleanupService.ts` com gestão centralizada.

#### **P1.3 Operação Offline Insegura**  
**Arquivos:**
- `src/App.tsx` - triggerDriveAutoSave
- `src/lib/productStorage.ts` - cache de produtos

**Problema:** Salves em background sem verificação de conectividade, podendo causar tentativas infinitas.

**Solução:** Implementar `offlineSyncManager.ts` com filas de sync e retry.

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

### **✅ CRÍTICO - Sprint 1**
- [ ] **ScopeValidator**: Validar estado ao alternar entre AGRO/PET
  - Arquivo: `src/services/scopeValidator.ts`
  - Linhas: ~50
  - Impacto: ✅ Corrigir inconsistências de marca

- [ ] **MemoryCleanupService**: Gestão centralizada de limpeza
  - Arquivo: `src/services/memoryCleanupService.ts`
  - Linhas: ~80
  - Impacto: ✅ Prevenir Memory Leaks

- [ ] **OfflineSyncManager**: Fila de sync com retry
  - Arquivo: `src/services/offlineSyncManager.ts`
  - Linhas: ~60
  - Impacto: ✅ Operação offline segura

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

### **Sprint 1 (Iniciar Imediatamente)**
**Datas:** 2025-08-01 → 2025-08-14

**Tarefas Prioritárias:**
- ✅ **ScopeValidator.ts** (2025-08-01)
- ✅ **MemoryCleanupService.ts** (2025-08-02)  
- ✅ **OfflineSyncManager.ts** (2025-08-03)
- [ ] Testes unitários para três serviços
- [ ] Integração de serviços

### **Sprint 2 (2025-08-15 → 2025-08-28)**
**Fase 1:** InputPanelComponentExtractor (2025-08-15 → 2025-08-18)
**Fase 2:** SharedFormState (2025-08-19 → 2025-08-21)
**Fase 3:** AutoTrimCanvas (2025-08-22 → 2025-08-24)
**Fase 4:** Testes de integração (2025-08-25 → 2025-08-26)
**Fase 5:** Validação de aceitação (2025-08-27 → 2025-08-28)

### **Sprint 3 (2025-08-29 → 2025-09-11)**
**Fase 1:** ImageProcessorWorker (2025-08-29 → 2025-08-31)
**Fase 2:** CacheInstall (2025-09-01 → 2025-09-03)
**Fase 3:** ProductStorage com versão (2025-09-04 → 2025-09-06)
**Fase 4:** Otimização de performance (2025-09-07 → 2025-09-09)
**Fase 5:** Documentação final e entrega (2025-09-10 → 2025-09-11)

---

**📊 STATUS ATUAL:** Sprint 1 - Critérios de aceitação 0/5 implementados
**🚨 URGENTE:** Corrigir alternância de escopo imediatamente (aplicação atual instável)

**⚡ AÇÃO REQUERIDA:** Iniciar Sprint 1 hoje
**⏰ PRAZO:** Sprint 1 concluído até 2025-08-14

---

*Documento criado por: Equipe de Engenharia Principal*
*Data: 2025-07-31*
*Revisor: QA Lead*
*Próxima revisão: 2025-08-01*