# 🔎 Análise Técnica & Plano de Ação Alinhado ao Roadmap — Coagro Studio

**Documento:** Análise de estado real + plano de correção orientado à visão white-label
**Base de comparação:** [`ROADMAP_COAGRO_STUDIO.md`](<coagro-agro-studio (2)/ROADMAP_COAGRO_STUDIO.md>) (v2.0.0 — Outubro/2026)
**Anterior:** [`RECOMENDACOES_CORRECOES.md`](RECOMENDACOES_CORRECOES.md) (08/10/2026)
**Escopo:** verificação do código atual, avaliação de quais correções servem ao caminho traçado no roadmap, e trilha de execução por fases.

---

## 0. Resumo executivo

Três conclusões práticas:

1. **A aplicação está funcional, mas sem rede de segurança.** O `vite build` passa (exit 0), porém o **gate de tipagem está inoperante**: o `tsc` atual (TypeScript 7 nativo) não resolve a própria *standard library* e falha com erros fantasmas. Sem tsc, qualquer refatoração é feita "no escuro".

2. **Os bugs de AGRO↔PET continuam reais, mas a causa raiz é arquitetural.** Não é só a logo: o `scope` é derivado de *tema*, recalculado inline em dois pontos, e ignorado nos fluxos de lote/impressão. Corrigir só o sintoma (a logo) deixa o problema de pé.

3. **Quase todas as correções anteriores continuam necessárias — mas precisam ser reorientadas.** Do jeito que estão descritas no documento antigo, algumas *cimentam* o binário `'AGRO' | 'PET'` no código (21 ocorrências em 15 arquivos). Isso é exatamente o que impede a Fase 4 (white-label / multi-marca / multi-filial). A recomendação é: **corrigir agora, mas já na assinatura extensível** (`scopeId: string` vindo do `tenant.config.json`), para que a Fase 4 seja acréscimo, não reescrita.

> **Sobre os mascotes:** confirmado que foram desabilitados. Nenhum dos 5 layouts expostos na UI é de mascote. A recomendação aqui **não** é "consertar" os grids para aceitar mascote — é **remover os branches mortos agora** e **preservar componentes + assets** para a Fase 3, onde nascerão templates desenhados para eles. Detalhes na §4.

---

## 1. Método e evidências

Tudo abaixo foi verificado por leitura direta do código e execução de comandos nesta máquina:

| Verificação | Comando / evidência | Resultado |
|---|---|---|
| Build de produção | `vite build` | ✅ **exit 0** em 18,35s / 1943 módulos |
| Gate de tipagem | `tsc --noEmit` (`npm run lint`) | ❌ **exit 1** — 5 erros de lib (não são erros do projeto) |
| Versão do compilador | `tsc --version` | `Version 7.0.2` (compilador **nativo**, tsgo) |
| Working tree | `git status --short` | ✅ Limpa (só 1 zip untracked fora do app) |
| Raiz do repositório | `git rev-parse --show-toplevel` | `.../subrinho` (o app é subpasta) |
| Segredos | `git ls-files .env` | ✅ `.env` **não** versionado |
| Assets multi-tenant | `Test-Path public/tenant-assets` | ❌ **Não existe** |
| Templates expostos na UI | [`SocialManualEditor.tsx:394`](<coagro-agro-studio (2)/src/components/SocialManualEditor.tsx#L394>) | 5 layouts, nenhum de mascote |

**Contagens de código (linhas reais):**

| Arquivo | Linhas |
|---|---|
| [`InputPanel.tsx`](<coagro-agro-studio (2)/src/components/InputPanel.tsx>) | **1915** |
| [`BatchReviewGrid.tsx`](<coagro-agro-studio (2)/src/components/BatchReviewGrid.tsx>) | 1125 |
| [`App.tsx`](<coagro-agro-studio (2)/src/App.tsx>) | 781 |
| [`SingleArtRenderer.tsx`](<coagro-agro-studio (2)/src/components/SingleArtRenderer.tsx>) | 497 |
| [`SocialManualEditor.tsx`](<coagro-agro-studio (2)/src/components/SocialManualEditor.tsx>) | 479 |

---

## 2. 🔴 Bloqueador nº 1 — O gate de tipagem (TypeScript 7) está quebrado

[`package.json:47`](<coagro-agro-studio (2)/package.json#L47>) declara `"typescript": "^7.0.2"`. O TS7 é o compilador **nativo** (binário), não o compilador JS de sempre. O pacote de plataforma instalado (`@typescript/typescript-win32-x64/lib/`) está **incompleto**: contém apenas `lib.d.ts`, `lib.dom.*`, `lib.decorators.*` e `lib.es2015.*`.

**Faltam `lib.es5.d.ts` e todas as libs ES2016+.** Sem `lib.es5.d.ts`, os globais fundamentais (`Object`, `Number`, `Boolean`, `CallableFunction`) não existem:

```
error TS2318: Cannot find global type 'CallableFunction'.
error TS2318: Cannot find global type 'Number'.
error TS2318: Cannot find global type 'Object'.
error TS2552: Cannot find name 'Boolean'. Did you mean 'GLboolean'?
```

**Não é** problema de caminho com espaços/parênteses: reproduzi em `C:\ts_clean_test` e o erro é idêntico. Também **não é** o `types: ["vite/client"]` do [`tsconfig.json`](<coagro-agro-studio (2)/tsconfig.json>): passar `--lib es2015,dom` explícito não corrige.

**Impacto direto no roadmap:** a Fase 1 do roadmap começa por "Refatoração dos componentes inflados". Refatorar `InputPanel.tsx` (1915 linhas) **sem type-check funcionando** é o cenário de maior risco de regressão do projeto. Este item é pré-requisito de tudo.

**Ação:** pinar `typescript` numa versão funcional (ex.: `~5.9.x`) ou reinstalar corretamente o pacote nativo do TS7; depois confirmar que `tsc --noEmit` volta a reportar os erros **reais** do projeto.

---

## 3. 🔴 Bugs confirmados (com arquivo e linha)

### 3.1 A logo ainda é escolhida pelo fundo, não pela marca (P1.1 — não resolvido na raiz)

[`SingleArtRenderer.tsx:134`](<coagro-agro-studio (2)/src/components/SingleArtRenderer.tsx#L134>)

```ts
const logo = logoVariant || (isLight ? 'h-azul' : 'h-mono-branca');   // ← decide por FUNDO
```

O roadmap (§2) descreve isso como "Contraste Inteligente de Logo … com base na luminância do fundo". Correto **para contraste**, mas é a fonte errada **para marca**. Hoje existe uma mitigação parcial: os templates repassam `scope` ao [`ArtHeader`](<coagro-agro-studio (2)/src/components/art-renderer/ArtHeader.tsx#L17>), que renderiza `<CoagroPetLogo>` quando `scope==='PET'`. Ou seja, o sintoma visual melhorou, mas a lógica continua com duas fontes de verdade competindo.

### 3.2 O `scope` é derivado de **tema** — heurística frágil

[`SingleArtRenderer.tsx:132`](<coagro-agro-studio (2)/src/components/SingleArtRenderer.tsx#L132>)

```ts
const scope = scopeOverride || (content.tema === 'clean-branco' || content.tema === 'azul-coagro' ? 'PET' : 'AGRO');
```

A marca passa a depender da **cor de fundo**. Isso colide frontalmente com o objetivo white-label: se amanhã existir "Coagro Agro Azul" ou "Coagro Pet Verde", a heurística quebra. Além disso, `azul-coagro` (azul institucional) está mapeado como PET, o que é uma decisão implícita e não documentada.

### 3.3 Dois templates mascote **ignoram** `scopeOverride` (recálculo inline)

[`SingleArtRenderer.tsx:296`](<coagro-agro-studio (2)/src/components/SingleArtRenderer.tsx#L296>) e [:335](<coagro-agro-studio (2)/src/components/SingleArtRenderer.tsx#L335>)

```ts
scope={content.tema === 'clean-branco' || content.tema === 'azul-coagro' ? 'PET' : 'AGRO'}
```

Recalculam o escopo **descartando** `scopeOverride`. Se o operador está em modo PET mas o `content.tema` é `campo-agro`, esses ramos renderizam **AGRO**. É uma inconsistência real entre o preview principal (que usa `scopeOverride` corretamente em [`App.tsx:612`](<coagro-agro-studio (2)/src/App.tsx#L612>)) e esses templates.

### 3.4 Bug de componente: `unified-central-mascot` renderiza o template errado

[`SingleArtRenderer.tsx:293`](<coagro-agro-studio (2)/src/components/SingleArtRenderer.tsx#L293>) — o branch `unified-central-mascot` renderiza `<UnifiedCentral>`, não `<UnifiedCentralWithMascot>`. Consequência: [`UnifiedCentralWithMascot.tsx`](<coagro-agro-studio (2)/src/components/art-renderer/templates/UnifiedCentralWithMascot.tsx>) é **importado e nunca usado** (import morto).

### 3.5 Lote / Impressão A4 ignora o escopo da linha (P1.5)

Os três pontos de render de cartaz passam `theme="azul-coagro"` **fixo** e **nenhum** `scopeOverride`:

| Arquivo | Linha | Problema |
|---|---|---|
| [`BatchRendererModal.tsx`](<coagro-agro-studio (2)/src/components/BatchRendererModal.tsx#L157>) | 157–176 | sem `scopeOverride`, tema fixo |
| [`BatchReviewGrid.tsx`](<coagro-agro-studio (2)/src/components/BatchReviewGrid.tsx#L876>) | 876–895 | sem `scopeOverride`, tema fixo |
| [`BatchReviewGrid.tsx`](<coagro-agro-studio (2)/src/components/BatchReviewGrid.tsx#L1089>) | 1089–1108 | sem `scopeOverride`, tema fixo |

Resultado: **cartazes de lote/impressão sempre saem com identidade AGRO**, mesmo para itens de linha Pet. Isso é uma dor operacional concreta (Fase 1/2 do roadmap).

### 3.6 `linha: 'AGRO'` hardcoded no servidor

[`server/routes/generate.ts:436`](<coagro-agro-studio (2)/server/routes/generate.ts#L436>) — a resposta da IA sempre retorna `linha: 'AGRO'`. O `appMode` recebido no corpo só influencia o *prompt do sistema* ([:129](<coagro-agro-studio (2)/server/routes/generate.ts#L129>)). Impacto atual é baixo (consumido no `JsonViewerModal`), mas é uma inconsistência que vira bug assim que algo passar a confiar em `linha`.

### 3.7 Assets de mascote com espaço na URL

`UnifiedCentralWithMascot.tsx:67` e `UnifiedSplitWithMascot.tsx:69` apontam para `/mascotes/GATA/GATA LARANJA.webp` e `/mascotes/charles/CHARLES P1.webp`. Espaços em URL não são codificados e podem falhar no `html-to-image`/Electron. Relevante apenas quando os mascotes voltarem (Fase 3) — mas anotar agora evita redescobrir depois.

---

## 4. 🎭 Mascotes — decisão alinhada ao roadmap

**Situação verificada:** a UI expõe apenas 5 layouts ([`SocialManualEditor.tsx:394-400`](<coagro-agro-studio (2)/src/components/SocialManualEditor.tsx#L394>)): `unified-central`, `unified-split`, `promo-simples`, `informative-central`, `informative-split`. **Nenhum de mascote.** Os branches existem no renderer, mas são inalcançáveis pela interface.

**Recomendação (não é "consertar o grid"):**

| Ação | Justificativa |
|---|---|
| ❌ **Não** tentar fazer os mascotes caberem nos grids genéricos | É exatamente o que o roadmap diz que não funcionou (deformação de proporção e conflito de hierarquia) |
| ✅ **Isolar/remover agora** os branches `unified-central-mascot` / `unified-split-mascot` do `SingleArtRenderer` e o import morto | Elimina código morto e o bug 3.4 sem custo; atende à "Regra Anti-Frankenstein" (§6.B do roadmap) |
| ✅ **Preservar** [`UnifiedCentralWithMascot.tsx`](<coagro-agro-studio (2)/src/components/art-renderer/templates/UnifiedCentralWithMascot.tsx>), [`UnifiedSplitWithMascot.tsx`](<coagro-agro-studio (2)/src/components/art-renderer/templates/UnifiedSplitWithMascot.tsx>) e `public/mascotes/` | São a base da Fase 3, não lixo |
| ✅ **Corrigir as URLs com espaço** ao reativar | Pré-requisito técnico dos templates de mascote |

Assim, nada é perdido e o código que sobra passa a ser honesto: *"mascotes existem como acervo para templates próprios (Fase 3)"*.

---

## 5. Reavaliação: as correções anteriores servem ao caminho do roadmap?

| Item (doc anterior) | Ainda necessário? | Como executar **para servir** o white-label |
|---|---|---|
| **P0.1** `/api/hf-token` removido | ✅ Feito | — |
| **P0.2** Firebase apiKey commitada / rotação | ✅ **Sim** | Aplicar *HTTP referrer restrictions*; rotacionar chaves. **Requisito de segurança para o SaaS da Fase 4** |
| **P0.3** Rate limit | ✅ Feito (15 req/min) | Revisar limite **por filial/tenant** na Fase 4 |
| **P1.1** logo por `scope` em vez de `isLight` | ✅ **Sim, mas reorientado** | Não apenas trocar a expressão: **eliminar a segunda fonte de verdade** e derivar de `scopeId` |
| **P1.2** roteamento Pet sem preço | ✅ **Sim** | Fazer o roteador receber `scopeId`, não tema |
| **P1.3/P1.4** paletas Pet em `HeroCentral`/`SplitVertical` | ✅ **Sim** | Implementar via `getPalette(scopeId)` lendo do tenant config — nunca hex literal |
| **P1.5** lote/impressão força azul | ✅ **Sim, prioritário** | Propagar `scopeId` **e** `brandId` da linha do Excel até o renderer |
| **P1.6** 404 JSON em `/api/*` | ✅ Feito | — |
| **P1.7** erro 500 sem vazar payload Google | ✅ Feito (502 + fallback) | Manter; alinhado à resiliência offline |
| **P2.1** zerar erros TS | ⚠️ **Bloqueado** | Antes é preciso corrigir o TS7 (§2). Sem isso não há como medir |
| **P2.2** pinar deps / lockfiles | ✅ **Sim, é o bloqueador nº 1** | Um package manager só; pinar `typescript`, `vite`, `esbuild` |
| **P2.3** quebrar `server.ts` | ✅ **Já feito** (backend modularizado) | Falta o front: `InputPanel.tsx` (1915 linhas) |
| **P2.4** Vitest + testes | ✅ **Sim** | Cobrir: parser BRL, `resolveDefaultTemplate`, `getPalette(scopeId)`, roteador por escopo |
| **P2.5** ESLint/Prettier | ✅ **Sim** | Pega código morto (ex.: imports de mascote) automaticamente |
| **P3.1** pastas com espaços/parênteses | ✅ **Sim** | `coagro-agro-studio (2)`, `IDEIAS DE MODELOS`, `SKILL (1).md` |
| **P3.2** README real | 🟡 Parcial | Atualizar após Fase 1 |
| **P3.3** unificar caminhos dev/Vercel/Electron | ✅ **Sim — crítico para online+offline** | Base da resiliência offline (Fase 1/2) |
| **P3.4** centralizar marca | ✅ **Sim, é a fundação da Fase 4** | `tenant.config.json` como fonte única (hoje **não é** — ver §6) |
| **P3.5** chunk grande / DPI de impressão | ✅ **Sim** | `index.js` 1,4 MB; WASM de 23,9 MB (§7) |

**Veredito:** nenhuma recomendação anterior *contradiz* o roadmap. Duas precisam de reorientação (P1.1 e P3.4) e uma está bloqueada (P2.1). O restante segue válido e, em vários casos, é pré-requisito das fases do roadmap.

---

## 6. 🧱 Lacunas de arquitetura para o white-label (preparar agora, implementar depois)

Esta é a parte que responde diretamente à pergunta *"as correções são necessárias para esse caminho que pode mudar ainda mais?"*. Sim — e há lacunas que, se ignoradas, transformam a Fase 4 em reescrita.

### 6.1 `tenant.config.json` não é a fonte da verdade (embora o roadmap diga que é)

O roadmap (§4) afirma que a arquitetura multi-tenant "garante que cores e marcas não se misturem". Na prática:

- [`tenant.config.json`](<coagro-agro-studio (2)/src/config/tenant.config.json#L17>) declara `assets.logoLight: "/tenant-assets/coagro/agro/logo-light.svg"` → **`public/tenant-assets/` não existe**.
- As **cores** do config (`primary`, `secondary`) **não são consumidas** pelos templates.
- [`brand.config.ts`](<coagro-agro-studio (2)/src/lib/brand.config.ts#L8>) (`getPalette`) **hardcoda hex**: `text-[#4897D0]`, `text-[#E96C2C]`, `text-[#004d40]`, `text-[#ffab00]`.
- Os templates repetem os mesmos hex em ~85 branches `isPet` / `=== 'PET'`.
- As logos são **componentes SVG fixos** ([`coagroLogos.tsx`](<coagro-agro-studio (2)/src/assets/coagroLogos.tsx>), 48,8 KB), não assets de tenant.

**Consequência:** trocar a cor da marca Pet hoje exige editar vários arquivos. No white-label, exige editar **todos** os templates.

### 6.2 O binário `'AGRO' | 'PET'` está espalhado (o maior bloqueio da Fase 4)

**21 ocorrências** da union `'AGRO' | 'PET'` em **15 arquivos**:

| Arquivo | Linha |
|---|---|
| [`App.tsx`](<coagro-agro-studio (2)/src/App.tsx#L47>) | 47 |
| [`brand.config.ts`](<coagro-agro-studio (2)/src/lib/brand.config.ts#L8>) | 8 |
| [`layoutRules.ts`](<coagro-agro-studio (2)/src/lib/layoutRules.ts#L30>) | 30 |
| [`ArtHeader.tsx`](<coagro-agro-studio (2)/src/components/art-renderer/ArtHeader.tsx#L8>) | 8 |
| [`CanvasEmptyState.tsx`](<coagro-agro-studio (2)/src/components/art-renderer/CanvasEmptyState.tsx#L9>) | 9 |
| [`ExportToolbar.tsx`](<coagro-agro-studio (2)/src/components/ExportToolbar.tsx#L38>) | 38 |
| [`InputPanel.tsx`](<coagro-agro-studio (2)/src/components/InputPanel.tsx#L45>) | 45, 46 |
| [`SingleArtRenderer.tsx`](<coagro-agro-studio (2)/src/components/SingleArtRenderer.tsx#L42>) | 42, 132 |
| [`SocialManualEditor.tsx`](<coagro-agro-studio (2)/src/components/SocialManualEditor.tsx#L23>) | 23, 24 |
| `templates/HeroCentral.tsx` | 15 |
| `templates/SplitVertical.tsx` | 14 |
| `templates/InformativeCentral.tsx` | 12 |
| `templates/InformativeSplit.tsx` | 12 |
| `templates/PromoSimples.tsx` | 12 |
| `templates/UnifiedCentral.tsx` · `UnifiedSplit.tsx` · `UnifiedCentralWithMascot.tsx` · `UnifiedSplitWithMascot.tsx` | 16 / 16 / 14 / 15 |

**Recomendação:** introduzir um tipo único `ScopeId = string` (ou `type ScopeId = 'agro' | 'pet' | (string & {})`) já **nas correções da Fase 1**, mantendo o comportamento idêntico. Assim, adicionar uma marca na Fase 4 é adicionar uma entrada no config — não tocar 15 arquivos.

### 6.3 Listas de tema e layout não são extensíveis

- Temas válidos estão hardcoded em [`generate.ts:416`](<coagro-agro-studio (2)/server/routes/generate.ts#L416>) (`['campo-agro','verde-coagro','azul-coagro','clean-branco']`) e nas opções de [`SocialManualEditor.tsx:429-431`](<coagro-agro-studio (2)/src/components/SocialManualEditor.tsx#L429>).
- O mapeamento *tema → escopo* (§3.2) é implícito.

**Recomendação:** temas e layouts viram listas derivadas do tenant config.

### 6.4 `resolveDefaultTemplate` está ligado ao binário

[`layoutRules.ts:30`](<coagro-agro-studio (2)/src/lib/layoutRules.ts#L30>) devolve `'hero-central' | 'split-vertical' | 'pet-central' | 'pet-split-vertical'` a partir de `appMode: 'AGRO' | 'PET'`. Isso significa que **existem templates duplicados por marca** (`HeroCentral` vs `PetCentral`, `SplitVertical` vs `PetSplitVertical`). No white-label, isso vira N cópias por marca.

**Recomendação estratégica:** migrar para **um template + paleta por tenant** (`UnifiedCentral` já é assim: recebe `scope` e se adapta). Os pares `Pet*` devem convergir para os `Unified*`, eliminando a duplicação.

### 6.5 Online/offline — o que ainda depende de rede

Para o objetivo "funcionar online e offline" (Fase 1/2 do roadmap):

| Dependência | Situação | Risco offline |
|---|---|---|
| Modo Manual (diagramação) | ✅ client-side | Nenhum (já funciona) |
| Recorte de imagem | ✅ `imageTransparency.ts` em canvas | Nenhum |
| `/api/remove-bg` (Hugging Face) | ❌ **depende de internet** | Falha silenciosa sem sinal |
| `/api/generate-*` (Gemini) | ❌ **depende de internet** | Mitigado por fallback heurístico no servidor |
| **Servidor Express** | ❌ `npm run dev` sobe `tsx server.ts` | **O Electron empacotado precisa do servidor local** — validar se o app funciona sem rede |
| Fontes / assets | ⚠️ a verificar | Roadmap §5 aponta como pendente |
| `onnxruntime-web` WASM (23,9 MB) | ⚠️ embutido no bundle | Peso e carregamento local |

**Ação prioritária:** mapear exatamente o que o executável Electron chama de rede no fluxo manual e garantir que o fluxo essencial (manual + lote + export) rode **100% offline**.

---

## 7. 🟡 Build, empacotamento e higiene

**Saída real do `vite build`:**

```
dist/assets/index-CKQ1qVBg.js                          1,435.07 kB │ gzip: 438.95 kB   ⚠️ > 500 kB
dist/assets/ort-wasm-simd-threaded.jsep-*.wasm        23,914.39 kB │ gzip: 5,743.61 kB  ⚠️ 23,9 MB
dist/assets/ort.bundle.min-*.js                          389.74 kB │ gzip: 104.78 kB
dist/assets/ort.webgpu.bundle.min-*.js                   389.75 kB │ gzip: 104.80 kB
✓ built in 18.35s
```

- **Chunk principal de 1,4 MB** → dividir com `manualChunks`/`codeSplitting` (react, firebase, xlsx separados).
- **WASM de 23,9 MB** do `onnxruntime-web` (remoção de fundo): pesa o instalador Electron e o carregamento local. Avaliar carregamento sob demanda (*lazy*) ou modelo mais leve.
- **Dupla lockfile**: `package-lock.json` **e** `bun.lock` → drift de dependências. Escolher um.
- **`npm run lint` = apenas `tsc --noEmit`** → sem ESLint/Prettier; nenhum detector de código morto (por isso o import de mascote passou despercebido).
- **`npm run build` não roda tsc** → build "verde" não significa tipagem válida.
- **Higiene de nomes**: `coagro-agro-studio (2)/`, `IDEIAS DE MODELOS/`, `SKILL (1).md`, e imagens em `public/mascotes/` com espaços (`GATA LARANJA.webp`, `Generated Image August 21....webp`, `ChatGPT Image Aug 21....webp`).

---

## 8. 🔐 Segurança

| Item | Situação | Ação |
|---|---|---|
| `apiKey` do Firebase commitada em [`firebase-applet-config.json:4`](<coagro-agro-studio (2)/firebase-applet-config.json#L4>) | ❌ Exposta, sem restrição de domínio | Aplicar *HTTP referrer restrictions* + rotacionar (**P0.2**) |
| `.env` local (GEMINI_API_KEY, HF_TOKEN, GROQ_API_KEY) | ✅ **Não versionado** ([`.gitignore:7`](<coagro-agro-studio (2)/.gitignore#L7>)) | Manter |
| `GROQ_API_KEY` | ⚠️ **Segredo órfão** — zero referências em `src/` e `server/` | Remover do `.env` |
| Rate limit | ✅ 15 req/min ([`rateLimit.ts`](<coagro-agro-studio (2)/server/middleware/rateLimit.ts>)) | Revisar por tenant na Fase 4 |
| Token HF / FAL | ✅ Server-side apenas (`/api/hf-token` removido) | Rotacionar por precaução |

---

## 9. Divergências entre o roadmap e o código (para o roadmap ficar preciso)

Como o roadmap é a bússola do projeto, vale corrigir estes pontos onde ele descreve o código de forma otimista:

1. **§4 "Arquitetura Multi-Tenant … garantindo que cores e marcas não se misturem"** — na prática as cores **não** vêm do tenant config (que ainda aponta para assets inexistentes). Estado real: multi-**scope** (agro/pet) funcional, multi-**tenant** (cores/assets/marcas) ainda não implementado.
2. **§2 "Contraste Inteligente de Logo … com base na luminância do fundo"** — hoje a decisão é pelo **nome do tema** (`clean-branco`), não por luminância real ([`App.tsx:91`](<coagro-agro-studio (2)/src/App.tsx#L91>)).
3. **§4 "matriz de tom em `server.ts`"** — `server.ts` tem 67 linhas; a lógica está em [`server/routes/generate.ts`](<coagro-agro-studio (2)/server/routes/generate.ts>) e `server/utils/prompts.ts`.
4. **§2 "Templates A4 … Tema Azul Pet (`promo-text-only`)"** — `promo-text-only` é um template genérico de texto, e o fluxo de lote passa `theme="azul-coagro"` fixo sem escopo (§3.5).
5. **§5 WIP "Alternância de Escopo sem Template … layout às vezes carrega vazio ou desalinhado"** — existe `resolveDefaultTemplate` **e** ele já é chamado na troca de escopo ([`App.tsx:76-86`](<coagro-agro-studio (2)/src/App.tsx#L76>)). A causa provável do sintoma remanescente é a heurística tema→escopo (§3.2) + `templateWasManuallySelected` que não é resetado.

---

## 10. 🚀 Plano de ação por fases (alinhado ao roadmap)

### 🔴 FASE 1 — Estabilização (imediato) — *habilita todo o resto*

| # | Ação | Arquivo-alvo | Critério de aceite |
|---|---|---|---|
| 1.1 | **Consertar o TypeScript** (pinar versão funcional / reinstalar TS7) | [`package.json:47`](<coagro-agro-studio (2)/package.json#L47>) | `tsc --noEmit` roda e lista os erros **reais** |
| 1.2 | Zerar os erros de tipo restantes | projeto | `tsc --noEmit` exit 0 |
| 1.3 | **Fonte única de escopo**: `scope` vem de `scopeOverride`/tenant — remover a heurística por tema e os recálculos inline | `SingleArtRenderer.tsx:132, 296, 335` | trocar AGRO↔PET muda a arte em **todos** os fluxos |
| 1.4 | **Logo derivada da marca** (não do fundo): manter `isLight` apenas para a variante claro/escuro **dentro** da marca | `SingleArtRenderer.tsx:134` | nenhum caminho ignora a marca |
| 1.5 | **Propagar escopo em lote/A4** | [`BatchRendererModal.tsx:157`](<coagro-agro-studio (2)/src/components/BatchRendererModal.tsx#L157>), [`BatchReviewGrid.tsx:876`](<coagro-agro-studio (2)/src/components/BatchReviewGrid.tsx#L876>), :1089 | planilha mista AGRO+PET → PDF/PNG alternam marca |
| 1.6 | **Remover branches mortos de mascote** (preservando componentes e assets) | `SingleArtRenderer.tsx:23, 293, 332` | nenhum import/DSL morto; §4 respeitada |
| 1.7 | **Introduzir `ScopeId` extensível** já aqui (comportamento idêntico) | 15 arquivos (§6.2) | adicionar escopo novo não exige editar template |
| 1.8 | `linha` reflete o escopo real | [`generate.ts:436`](<coagro-agro-studio (2)/server/routes/generate.ts#L436>) | resposta da IA marca PET quando em modo PET |
| 1.9 | **Validar build offline do Electron** | `electron/`, `vite.config.ts` | modo manual + lote + export funcionam sem rede |
| 1.10 | Segurança: restrição/rotação de chaves; remover `GROQ_API_KEY` | config externa, `.env` | 403 de outro domínio; sem segredo órfão |

### 🟡 FASE 2 — Autonomia em loja (curto prazo)

- Cache local de recortes por SKU (IndexedDB — já existe base em [`batchRepository.ts`](<coagro-agro-studio (2)/src/lib/batchRepository.ts>)).
- Dicionário de higienização de siglas de ERP.
- Unificar caminhos dev/Vercel/Electron (`src/lib/apiBase.ts`) — **pré-requisito da resiliência offline**.
- Modularizar `InputPanel.tsx` (1915 linhas) **depois** de 1.1/1.2 (gate de tipos ativo).
- Code-splitting do chunk de 1,4 MB e carregamento sob demanda do WASM de 23,9 MB.

### 🟢 FASE 3 — Mascotes com propósito (médio prazo)

- Criar 2–3 templates **desenhados para mascote** (balões de fala, selos comemorativos, proporção dedicada) — **não** reaproveitar os grids de produto.
- Corrigir as URLs com espaço (§3.7).
- Módulo de RH/endomarketing.

### 🔵 FASE 4 — White-label & SaaS (longo prazo)

- **`tenant.config.json` como fonte única da verdade**: cores, tipografias, logos (assets reais, não componentes fixos), temas, templates permitidos.
- Eliminar a duplicação `Pet*` vs `Unified*` (§6.4).
- Multi-filial: cotas, controle de acesso, limites por tenant.
- Vídeo programático / Remotion.

---

## 11. Riscos e decisões pendentes

| Risco | Impacto | Mitigação |
|---|---|---|
| Refatorar `InputPanel.tsx` sem tsc | Alto — regressão silenciosa | Fase 1.1/1.2 **antes** |
| Migrar `scope` para `ScopeId` só na Fase 4 | Alto — reescrever 15 arquivos + 85 branches | Fazer o *seam* já na Fase 1 (item 1.7) |
| Manter `tenant.config.json` desconectado do código | Alto — Fase 4 vira reescrita | Ligar `getPalette` ao config na Fase 1/2 |
| WASM de 23,9 MB no instalador | Médio — peso/download offline | Carregamento lazy ou modelo mais leve |
| `azul-coagro` ⇄ PET implícito (§3.2) | Médio — decisão não documentada | Definir e documentar o mapa tema→escopo (ou eliminá-lo) |

**Decisões que dependem do usuário:**
1. Pinar TypeScript em `~5.9.x` (estável, comprovado) **ou** insistir no TS7 corrigindo a instalação?
2. Unificar os templates `Pet*` nos `Unified*` (recomendado) ou manter pares por marca?
3. O modo IA (`AI_BETA`) deve voltar reaproveitando o backend Gemini atual ou evoluir para modelo local/offline?

---

*Documento gerado a partir de verificação direta do código e execução local.*
*Complementa (não substitui) o [`ROADMAP_COAGRO_STUDIO.md`](<coagro-agro-studio (2)/ROADMAP_COAGRO_STUDIO.md>).*
