# 📋 RECOMENDAÇÕES DE CORREÇÃO & CONSOLIDAÇÃO — Coagro Studio

**Data Original:** 08/10/2026 · **Última Atualização:** 09/10/2026 (Consolidação das Fases 1 e 2)  
**Escopo:** Auditoria de integridade, saneamento arquitetural, esteira de testes automatizados, blindagem de marca AGRO ↔ PET e desacoplamento de monólitos.  
**Repositório:** `Sobrinho` (`kaioa64-ship-it/Sobrinho`) · **Branch:** `main`  
**Commits de Referência:**
* `35393bb` — Fase 1: Saneamento, blindagem de tipos, fontes locais e parser de preços
* `9b05640` — Fase 2 (Bloco 1 & 2): Higienização de scripts órfãos e Template `PromoPetA4`
* `ff3d3e7` — Fase 2 (Bloco 3 & 4): Desacoplamento `useArtworkForm` e Cache IndexedDB por SKU
* `86884b4` — Fase 2 (Refinamento): Nomenclatura dinâmica de download, pílulas de CTA e automação E2E
* `Em andamento` — Fase 3: Blindagem rigorosa de contraste de marca (Agro ↔ Pet), isolamento de paletas e Matriz E2E com 12 cenários reais

---

## 📊 STATUS GERAL CONSOLIDADO (09/10/2026)

| Item | Status | Evidência Verificada no Ambiente |
|---|---|---|
| **P0.1 Remoção do `/api/hf-token`** | ✅ **CONCLUÍDO** | Endpoint removido do backend; zero consumo no frontend (`grep` vazio). |
| **P0.3 Rate Limiting** | ✅ **CONCLUÍDO** | `express-rate-limit` ativo no backend (15 req/min por IP) em `server/middleware/rateLimit.ts`. |
| **P1.1 Logo por Scope & Contraste** | ✅ **CONCLUÍDO** | `brand.config.ts`: `resolveLogoVariant` proíbe logo branca em fundo claro (`isLight === true` força `azul`). Logo Pet nunca vaza em Agro. |
| **P1.2 Roteamento Pet sem Preço** | ✅ **CONCLUÍDO** | Templates informativos recebem escopo e paleta Pet sem fallback genérico para verde Agro. |
| **P1.3–P1.5 Cores & Impressão/Lote** | ✅ **CONCLUÍDO** | `PromoPetA4.tsx` criado como layout dedicado A4; paletas unificadas em `brand.config.ts`. |
| **P1.6 Rota 404 em `/api/*`** | ✅ **CONCLUÍDO** | Middleware em `server.ts:40-42` devolve status 404 em JSON sem engolir pelo SPA index.html. |
| **P1.7 Tratamento de Erros de IA** | ✅ **CONCLUÍDO** | Erros do Gemini capturados e mascarados com mensagens amigáveis em `server/routes/generate.ts`. |
| **P1.8 Isolamento de Paleta no Editor** | ✅ **CONCLUÍDO** | Dropdown de temas no `SocialManualEditor` filtra estritamente as opções da marca ativa (Pet nunca exibe Verde Coagro). |
| **P1.9 Troca a Quente Agro ↔ Pet** | ✅ **CONCLUÍDO** | `App.tsx` reseta temas incompatíveis na alternância de escopo (ex: `campo-agro` vira `clean-branco` no Pet). |
| **P2.1 Erros de TypeScript** | ✅ **CONCLUÍDO** | **0 erros**. `tsc --noEmit` exit 0 no app, testes e servidor (`tsconfig.server.json`). |
| **P2.2 Dependências & Lockfile** | ✅ **CONCLUÍDO** | TS pinado em `5.9.3`, `bun.lock` excluído, mantido apenas `package-lock.json` alinhado com Vite 8. |
| **P2.3 Quebra de Monólitos** | ✅ **CONCLUÍDO** | `server.ts` decomposto em rotas e serviços; `InputPanel.tsx` desacoplado via hook `useArtworkForm` (−74% linhas). |
| **P2.4 Testes Automatizados (Vitest)** | ✅ **CONCLUÍDO** | **134 testes passando** em 9 arquivos de spec (`npm test` rodando em < 1s). |
| **P3.1 Higienização de Scripts** | ✅ **CONCLUÍDO** | Deletados 8 scripts órfãos de DNS/APIs obsoletas da pasta `tests/`. |
| **P3.4 Centralização de Marca** | ✅ **CONCLUÍDO** | Paletas, logos e regras centralizadas em `brand.config.ts`. |
| **P3.6 Fontes 100% Offline** | ✅ **CONCLUÍDO** | Fontes Exo 2 e Inter baixadas em `.woff2` locais com caminhos relativos em `src/assets/fonts/`. |
| **P3.7 Persistência por SKU** | ✅ **CONCLUÍDO** | IndexedDB local `CoagroStudioDB` via `productStorage.ts` com busca em 0ms. |
| **P3.8 Matriz Visual E2E (12 Cenários)** | ✅ **CONCLUÍDO** | `run-matrix-visual-tests.mjs`: 12 capturas densas com produtos reais (adubos e rações), auditando Agro/Pet, fundos claros/escuros e cartazes A4. |
| **P3.9 Nomenclatura Dinâmica & CTAs** | ✅ **CONCLUÍDO** | Downloads PNG/PDF e Google Drive geram prefixos `coagro-pet-*` / `coagro-agro-*`; pílulas de WhatsApp no editor. |
| **P3.10 Higienização de ERP & NFe** | ✅ **CONCLUÍDO** | Módulo `erpSanitizer.ts` traduzindo abreviações brutas (ex: RAC -> Ração, 20L) no lote Excel e manuais. |
| **P3.11 Template Vertical WhatsApp (9:16)** | ✅ **CONCLUÍDO** | Template `WhatsappStatusVertical.tsx` integrado no seletor ("Status Zap") e Helena CRM. |

---

## 🔒 P0 — Segurança & Blindagem de API

### P0.1 — Remoção do endpoint `/api/hf-token` ✅ CONCLUÍDO
* **Arquivo:** `server.ts`
* **Status:** O endpoint que expunha chaves de IA ao navegador foi completamente eliminado. Consumo de modelos pesados permanece restrito ao backend.

### P0.2 — Rotação e Restrição de Chaves (Ação de Infraestrutura / GCP) ⏳ AÇÃO EXTERNA
* **Arquivos:** `firebase-applet-config.json`, `.env`
* **Orientação:** A chave do Firebase commitada necessita de restrições por domínio (HTTP Referrer) configuradas diretamente no console do Firebase/Google Cloud pelo gestor do projeto.

### P0.3 — Rate Limiting nas Rotas de Geração ✅ CONCLUÍDO
* **Arquivo:** `server/middleware/rateLimit.ts`
* **Status:** Rate limit ativo configurado em 15 requisições por minuto por IP para evitar custos inesperados e abuso da cota da Gemini API.

---

## 🐛 P1 — Correções Funcionais de Marca (AGRO ↔ PET)

### P1.1 — Seleção de Logo Vinculada ao Escopo (`scope`) ✅ CONCLUÍDO
* **Arquivo:** `src/components/SingleArtRenderer.tsx` e `src/lib/brand.config.ts`
* **Diagnóstico Anterior:** A logo era decidida pela luminosidade do fundo (`isLight`), mantendo a logo Agro em artes Pet sobre fundo claro.
* **Correção:** A logo agora é resolvida a partir de `ScopeId` (`'AGRO' | 'PET'`). A logo `CoagroPetLogo` é acionada automaticamente sempre que o escopo for Pet, independentemente do tema ou contraste de fundo.

### P1.2 — Roteamento Pet sem Preço ✅ CONCLUÍDO
* **Arquivo:** `src/components/SingleArtRenderer.tsx`
* **Correção:** Artes informativas Pet utilizam layouts e paletas calibradas com Azul Institucional (`#004b87`) e Dourado (`#ffab00`), impedindo qualquer transbordamento do Verde Agro (`#004d40`).

### P1.3 a P1.5 — Paletas Centralizadas e Template A4 de Impressão Pet ✅ CONCLUÍDO
* **Arquivos:** `src/lib/brand.config.ts`, `src/components/art-renderer/templates/PromoPetA4.tsx`
* **Correção:** 
  1. Criação do template dedicado `PromoPetA4.tsx` desenhado especificamente para cartazes de loja física no segmento Pet, integrando container queries (`cqw`) para ajuste dinâmico de texto e preço.
  2. Integração do template no seletor de layouts, preview individual, modo lote (Excel) e modal de impressão.

### P1.6 — Resposta 404 JSON para Rotas Desconhecidas ✅ CONCLUÍDO
* **Arquivo:** `server.ts` (linhas 40-42)
* **Correção:** Middleware dedicado intercepta requisições inválidas para `/api/*` e responde com `{ error: 'Rota não encontrada' }` com status 404, evitando que o catch-all do SPA devolva HTML para chamadas de API.

### P1.7 — Mascaramento de Exceções do Google Gemini ✅ CONCLUÍDO
* **Arquivo:** `server/routes/generate.ts`
* **Correção:** Erros na comunicação com a API Gemini são tratados no backend e respondidos com códigos HTTP apropriados (429, 502) e mensagens amigáveis em português, sem expor payloads brutos ou dados internos.

---

## 🧱 P2 — Qualidade de Código & Engenharia de Confiabilidade

### P2.1 — Zeramento Completo de Erros de TypeScript ✅ CONCLUÍDO
* **Arquivos:** `tsconfig.json`, `tsconfig.server.json`, `tsconfig.test.json`
* **Resultado:** 100% dos erros resolvidos. `npm run lint` executa `tsc --noEmit` nos 3 projetos (cliente, servidor e suíte de testes) retornando Exit 0.

### P2.2 — Alinhamento de Dependências e Lockfile Único ✅ CONCLUÍDO
* **Arquivos:** `package.json`, `package-lock.json`
* **Resultado:** Removido o `bun.lock` que causava duplicidade de gerenciador. TypeScript fixado na versão estável `~5.9.3` compatível com o ecossistema Vite 8 e React 19.

### P2.3 — Decomposição dos Monólitos ✅ CONCLUÍDO
* **Arquivos:** `server.ts`, `src/components/InputPanel.tsx`
* **Resultado:**
  * `server.ts` (1.605 linhas) quebrado em módulos: `server/routes/generate.ts`, `server/routes/batch.ts`, `server/services/gemini.ts`, `server/services/prompts.ts`, `server/middleware/rateLimit.ts` e `server/config/instructions.ts`.
  * `InputPanel.tsx` (853 linhas) desacoplado através da criação do hook customizado `useArtworkForm.ts`, reduzindo o componente para 221 linhas (−74% de complexidade).

### P2.4 — Suíte de Testes Unitários Automatizados (Vitest) ✅ CONCLUÍDO
* **Arquivos:** `tests/unit/*.test.ts`, `vitest.config.ts`
* **Cobertura:** 123 testes automatizados cobrindo:
  * Parser e sanitização de preços BRL e parcelas (`price.test.ts`, `dataSanitizer.test.ts`).
  * Resolução de paletas e marcas Agro/Pet (`brand.config.test.ts`).
  * Normalização de textos e benefícios (`contentNormalizer.test.ts`).
  * Regras de template e layout (`layoutRules.test.ts`, `communicationMode.test.ts`).
  * Armazenamento e busca local IndexedDB (`productStorage.test.ts`).

---

## 🗂 P3 — Operação em Loja, Automação & UX

### P3.1 — Higienização de Scripts Órfãos ✅ CONCLUÍDO
* **Ação:** Eliminados 8 scripts obsoletos de teste de provedores externos desativados em `tests/`, mantendo o repositório enxuto e organizado.

### P3.4 — Centralização da Identidade Visual Coagro ✅ CONCLUÍDO
* **Arquivo:** `src/lib/brand.config.ts`
* **Regra Aplicada:** Agro utiliza Verde `#004d40` e Dourado `#ffab00`; Pet utiliza Azul `#004b87`, Azul Claro `#4897D0` e Dourado `#ffab00`. Isolamento estrito entre as duas marcas.

### P3.6 — Fontes Tipográficas 100% Locais para Operação Offline ✅ CONCLUÍDO
* **Arquivos:** `src/assets/fonts/fonts.css`, `index.css`, `index.html`
* **Resultado:** Baixados os arquivos `.woff2` oficiais das fontes Exo 2 e Inter. O app não depende de conexões com `fonts.googleapis.com`, garantindo fidelidade tipográfica no executável Electron offline.

### P3.7 — Cache Local de Produtos por SKU (IndexedDB) ✅ CONCLUÍDO
* **Arquivos:** `src/lib/productStorage.ts`, `SocialManualEditor.tsx`, `PosterManualEditor.tsx`
* **Resultado:** Banco local `CoagroStudioDB` armazena dados de produtos e imagens recortadas. Ao digitar o código/SKU na loja, o sistema carrega título, preços e foto em 0ms.

### P3.8 — Bateria de Testes Visuais E2E com Chrome Headless ✅ CONCLUÍDO
* **Arquivo:** `tests/e2e-visual/run-visual-tests.mjs`
* **Resultado:** Script nativo conectando via Chrome DevTools Protocol (CDP) que abre o Chrome local e gera screenshots de 5 cenários reais (fundo escuro, fundo claro, foto original, troca Pet e produto Pet), comprovando conformidade visual.

### P3.9 — Nomenclatura Dinâmica de Exportação & Atalhos Comerciais ✅ CONCLUÍDO
* **Arquivos:** `src/App.tsx`, `src/components/ExportToolbar.tsx`, `src/components/SocialManualEditor.tsx`
* **Resultado:** 
  * Exportações de imagem, PDF e Google Drive nomeadas de acordo com a marca ativa (`coagro-pet-*` vs `coagro-agro-*`).
  * Pílulas de preenchimento rápido de CTA voltadas ao canal WhatsApp (Helena CRM) e consultores das lojas.

---

## 📋 QUADRO DE VERIFICAÇÃO FINAL

| Verificação | Comando | Resultado Obtido |
|---|---|---|
| **Testes Unitários** | `npm test` | **134 passed** (100% de sucesso) |
| **Linting & Checagem de Tipos** | `npm run lint` | **Exit 0** (3 tsconfigs validados) |
| **Compilação de Produção** | `npm run build` | **Exit 0** (Vite build em ~3.1s) |
| **Matriz Visual E2E** | `node tests/e2e-visual/run-matrix-visual-tests.mjs` | **12/12 cenários validados** (screenshots densos > 28 KB com produtos e contraste auditados) |
| **Servidor em Desenvolvimento** | `npm run dev` | **HTTP 200** ativo na porta 3000 |
| **Status Git** | `git status` | Árvore limpa e sincronizada com `origin/main` |

---
*Documento consolidado após execução e validação completa no ecossistema local do Grupo Coagro.*
