# ✅ Correções Realizadas — Coagro Studio (Fase 1, parcial)

**Data:** 08/10/2026
**Base:** [`ANALISE_COAGRO_STUDIO.md`](../ANALISE_COAGRO_STUDIO.md) (plano) + [`ROADMAP_COAGRO_STUDIO.md`](ROADMAP_COAGRO_STUDIO.md) (direção)
**Estado da verificação:** `npm run lint` **exit 0** (src + testes + servidor) · `npm test` **exit 0** (115 testes) · `vite build` **exit 0** · `npm install` **exit 0 sem flags**

> Este documento registra **exatamente** o que foi alterado, por quê, e o que ficou pendente. Nenhuma alteração foi feita no `ROADMAP_COAGRO_STUDIO.md` (a modificação dele é do próprio autor, v1 → v2.0.0).

---

## 📋 Resumo executivo

| # | Correção | Arquivos | Verificação |
|---|---|---|---|
| 1 | **Gate de tipos destravado** — TypeScript pinado em 5.9.3 | [`package.json`](package.json) | `tsc --noEmit` → **exit 0** |
| 2 | **`npm install` sem flags** — conflito esbuild ↔ vite@8 resolvido | [`package.json`](package.json) | `npm install` → **exit 0** |
| 3 | **`ScopeId` extensível** (seam white-label) | [`brand.config.ts`](src/lib/brand.config.ts) | type-check OK |
| 4 | **Fonte única de escopo** — fim da heurística por tema | [`SingleArtRenderer.tsx`](src/components/SingleArtRenderer.tsx) | type-check + build OK |
| 5 | **Logo derivada da marca**, não do fundo | [`SingleArtRenderer.tsx`](src/components/SingleArtRenderer.tsx) | type-check OK |
| 6 | **Código morto de mascote removido** (componentes preservados) | [`SingleArtRenderer.tsx`](src/components/SingleArtRenderer.tsx), [`agro.ts`](src/types/agro.ts) | type-check OK |
| 7 | **Escopo propagado** para lote/A4 | [`BatchRendererModal.tsx`](src/components/BatchRendererModal.tsx), [`BatchReviewGrid.tsx`](src/components/BatchReviewGrid.tsx), [`App.tsx`](src/App.tsx) | type-check OK |
| 8 | **`linha` reflete o escopo real** (era `'AGRO'` fixo) | [`generate.ts`](server/routes/generate.ts) | type-check OK |
| 9 | **Segredo órfão removido** + `.env.example` documentado | [`.env`](.env), [`.env.example`](.env.example) | chaves: GEMINI + HF |
| 10 | **Lockfile único** (`bun.lock` removido) | `bun.lock` | só `package-lock.json` |
| 11 | **Fontes auto-hospedadas** — Exo 2 + Inter (meta offline) | [`src/assets/fonts/`](src/assets/fonts), [`index.css`](src/index.css), [`index.html`](index.html) | 6 `.woff2` no bundle, paths **relativos** |
| 12 | **Rota órfã `/api/remove-bg` removida** + `server.ts` limpo de imports mortos | [`server.ts`](server.ts), [`server/routes/removeBg.ts`](server/routes/removeBg.ts) (removido), [`.env.example`](.env.example) | build OK; só `generateRouter` ativo |
| 13 | **Suíte de testes (Vitest 5)** + gate de tipos passa a cobrir os testes | [`vitest.config.ts`](vitest.config.ts), [`tsconfig.test.json`](tsconfig.test.json), [`tests/unit/`](tests/unit), [`package.json`](package.json) | `npm test` → **exit 0** (57 testes) |
| 14 | 🔴 **BUG CRÍTICO DE PREÇO corrigido** — valores de 4+ dígitos eram truncados | [`priceParser.ts`](src/lib/priceParser.ts) | 4 testes que falhavam agora passam |
| 15 | **Higienização**: parser morto, 4 scripts de HF e `HF_TOKEN` removidos | [`src/lib/extractPriceFromText.ts`](src/lib/) (removido), `tests/test-hf*.mjs`, `tests/test-api.mjs`, [`.env`](.env) | só `GEMINI_API_KEY` no `.env` |
| 16 | **Bug de parcela corrigido** — `"10x de 180"` virava preço `10,00` | [`priceParser.ts`](src/lib/priceParser.ts), [`price.test.ts`](tests/unit/price.test.ts) | 3 testes novos cobrindo o caso |
| 17 | **Parser de preço unificado** — fim da cópia divergente no servidor | [`generate.ts`](server/routes/generate.ts), [`heuristic.ts`](server/services/heuristic.ts), `server/utils/priceParser.ts` (removido) | cliente e servidor com a **mesma** regex |
| 18 | 🔴 **System prompts PERDIDOS na modularização restaurados** | [`server/config/instructions.ts`](server/config/instructions.ts) (novo) | carga em runtime provada |
| 19 | **`tsconfig.server.json` amarrado ao lint** + specs dos normalizadores | [`tsconfig.server.json`](tsconfig.server.json), [`package.json`](package.json), [`tests/unit/`](tests/unit) | `npm test` → **115 testes** |
| 20 | 🧩 **Decomposição do `InputPanel.tsx`** (passo 5, concluída) | [`src/components/input-panel/`](src/components/input-panel) (6 submódulos) | **1915 → 853 linhas** (−55%) |

### Fase 2 — execução do briefing do time

| # | Entrega | Arquivos | Verificação |
|---|---|---|---|
| 21 | 🧹 **Higienização**: 8 scripts órfãos removidos + `normalizeBenefits` corrigido | `tests/` (8 removidos), [`contentNormalizer.ts`](src/lib/contentNormalizer.ts), [`contentNormalizer.test.ts`](tests/unit/contentNormalizer.test.ts) | 117 testes (+2) |
| 22 | 🐾 **Template A4 Pet** (`PromoPetA4`) + tipo compartilhado `PosterTemplateLayout` | [`PromoPetA4.tsx`](src/components/art-renderer/templates/PromoPetA4.tsx) + 8 arquivos de registro | paleta Pet verificada; Pet vira padrão no escopo PET |
| 23 | 🧠 **Desacoplamento de Estado (`useArtworkForm`)** | [`src/hooks/useArtworkForm.ts`](src/hooks/useArtworkForm.ts), [`InputPanel.tsx`](src/components/InputPanel.tsx) | **853 → 221 linhas** (−74%); zero alteração em props/CSS |
| 24 | 🗄️ **Cache Local por SKU (IndexedDB)** + busca inteligente com ERP | [`src/lib/productStorage.ts`](src/lib/productStorage.ts), [`SocialManualEditor.tsx`](src/components/SocialManualEditor.tsx), [`PosterManualEditor.tsx`](src/components/PosterManualEditor.tsx), [`productStorage.test.ts`](tests/unit/productStorage.test.ts) | 123 testes (+6); recortes e dados persistidos localmente |
| 25 | 👁️ **Contraste no Empty State em Fundo Claro** (descoberto via E2E) | [`CanvasEmptyState.tsx`](src/components/art-renderer/CanvasEmptyState.tsx), [`SingleArtRenderer.tsx`](src/components/SingleArtRenderer.tsx) | `isLight` aplicado; fim de textos brancos em fundo claro |

---

## 🔬 Evidências (comandos executados)

```
# Gate de tipos — pelo comando do próprio projeto
$ npm run lint          # => tsc --noEmit
> coagro-agro-studio@1.0.0 lint
> tsc --noEmit
LINT_EXIT=0

# Gate de tipos — antes: 5 erros de lib (TS7 nativo quebrado)
#                    depois:
$ node node_modules/typescript/lib/tsc.js --noEmit
EXITCODE=0

# Instalação limpa (antes exigia --legacy-peer-deps)
$ npm install
added 35 packages, removed 4 packages, and changed 3 packages in 7s
EXITCODE=0

# Build de produção
$ node node_modules/vite/bin/vite.js build
✓ 1942 modules transformed.
✓ built in 2.21s
BUILD_EXIT=0
```

---

## 1️⃣ Gate de tipos destravado (bloqueador nº 1)

**Problema:** [`package.json`](package.json) usava `"typescript": "^7.0.2"` — o compilador **nativo** (tsgo). O pacote de plataforma instalado (`@typescript/typescript-win32-x64/lib/`) veio **incompleto**: apenas `lib.d.ts`, `lib.dom.*` e `lib.es2015.*`, **sem `lib.es5.d.ts`** nem as libs ES2016+.

Resultado: `tsc --noEmit` não reportava os erros do projeto, só erros fantasmas:
```
error TS2318: Cannot find global type 'Number'.
error TS2318: Cannot find global type 'Object'.
error TS2552: Cannot find name 'Boolean'. Did you mean 'GLboolean'?
```
Reproduzia inclusive em caminho limpo (`C:\ts_clean_test`), confirmando que **não** era efeito de espaços/parênteses na pasta.

**Alteração:**
```diff
-    "typescript": "^7.0.2"
+    "typescript": "5.9.3"
```
Versão **pinarada sem caret** (era outra queixa legítima: range aberto mudava comportamento a cada patch).

**Resultado:** `tsc --noEmit` → **exit 0, zero erros**. O projeto estava limpo em tipos; os "4 erros restantes" citados no documento anterior já haviam sido resolvidos nas refatorações intermediárias. Agora existe a rede de segurança que faltava.

---

## 2️⃣ `npm install` sem flags (P2.2)

**Problema:** `npm install` puro **falhava**:
```
npm error Conflicting peer dependency: esbuild@0.28.2
npm error   peerOptional esbuild@"^0.27.0 || ^0.28.0" from vite@8.3.2
```
A raiz tinha `esbuild: ^0.25.0`, incompatível com o peer do `vite@8`.

**Alteração:**
```diff
-    "esbuild": "^0.25.0",
+    "esbuild": "^0.28.0",
```

**Resultado:** `npm install` roda **sem `--legacy-peer-deps`** — critério de aceite do P2.2 atendido (parte de dependências).

---

## 3️⃣ `ScopeId` — o *seam* para white-label

Criado o alicerce que evita reescrever 15 arquivos na Fase 4. Em [`brand.config.ts`](src/lib/brand.config.ts):

```ts
/** Tipo ABERTO: aceita novas marcas sem fechar a união. */
export type ScopeId = 'AGRO' | 'PET' | (string & {});
export type BrandScope = 'AGRO' | 'PET';   // escopos com marca completa
export const DEFAULT_SCOPE: BrandScope = 'AGRO';

export function normalizeScopeId(scopeId?: ScopeId | null): BrandScope
export function isPetScope(scopeId?: ScopeId | null): boolean
export function brandHasOwnLogo(scopeId?: ScopeId | null): boolean
export function resolveLogoVariant(isLight: boolean, explicit?: LogoVariant): LogoVariant
export function resolveBackgroundStyle(scopeId, isLight, isBlue)
```

- `getPalette()` e `resolveDefaultTemplate()` ([`layoutRules.ts`](src/lib/layoutRules.ts)) passaram a aceitar `ScopeId` em vez do binário fechado.
- **Estratégia:** a fronteira aceita `ScopeId` (aberto); o núcleo normaliza para `BrandScope`. Assim, adicionar uma marca na Fase 4 é acrescentar uma entrada — não reescrever templates.

---

## 4️⃣ Fonte única de escopo (P1.1 / P1.2) — a correção principal

**Problema (antes), em [`SingleArtRenderer.tsx`](src/components/SingleArtRenderer.tsx):**
```ts
// ❌ o escopo era inferido da COR DE FUNDO
const scope = scopeOverride || (content.tema === 'clean-branco' || content.tema === 'azul-coagro' ? 'PET' : 'AGRO');
// ❌ a logo era escolhida pelo FUNDO, nunca pela marca
const logo = logoVariant || (isLight ? 'h-azul' : 'h-mono-branca');
```
Consequências reais: um AGRO com tema claro virava PET; uma marca não podia usar qualquer paleta; e havia **duas fontes de verdade** (`isLight` vinha de `effectiveTheme`, `scope` vinha de `content.tema` — campos diferentes, que podiam divergir).

**Depois** (comentado no código):
```ts
// FONTE ÚNICA DE ESCOPO. Precedência explícita:
//   1. scopeOverride  — modo do app / tenant ativo (fonte de verdade)
//   2. content.linha  — linha de negócio do próprio conteúdo
//   3. DEFAULT_SCOPE
const scope = normalizeScopeId(scopeOverride ?? content.linha);

// A logo segue a MARCA; isLight decide só a variante claro/escuro.
const logo = resolveLogoVariant(isLight, logoVariant);

const backgroundStyle = resolveBackgroundStyle(scope, isLight, isBlue);
```

---

## 5️⃣ Recálculos inline que ignoravam `scopeOverride` — eliminados

Havia dois ramos que **descartavam** o `scopeOverride` e recalculavam o escopo pelo tema:
```ts
scope={content.tema === 'clean-branco' || content.tema === 'azul-coagro' ? 'PET' : 'AGRO'}
```
Isso fazia o template contradizer o preview principal. Os dois ramos foram **removidos** junto com o item 6 (eram justamente os ramos de mascote).

---

## 6️⃣ Código morto de mascote removido (respeitando o roadmap §3)

**Situação verificada antes da mudança:** a UI expõe apenas 5 layouts ([`SocialManualEditor.tsx:394`](src/components/SocialManualEditor.tsx#L394)) — nenhum de mascote. Ou seja, os ramos eram inalcançáveis. Além disso havia um **bug**: o ramo `unified-central-mascot` renderizava `<UnifiedCentral>` em vez de `<UnifiedCentralWithMascot>`, deixando este importado e nunca usado.

**Alterações:**
- Removidos os 2 ramos (`unified-central-mascot`, `unified-split-mascot`) e os 2 imports mortos em [`SingleArtRenderer.tsx`](src/components/SingleArtRenderer.tsx).
- **Preservados** os componentes [`UnifiedCentralWithMascot.tsx`](src/components/art-renderer/templates/UnifiedCentralWithMascot.tsx) e [`UnifiedSplitWithMascot.tsx`](src/components/art-renderer/templates/UnifiedSplitWithMascot.tsx), e o acervo `public/mascotes/` — são a base da **Fase 3**.
- Comentário explícito no código e no tipo, em [`agro.ts`](src/types/agro.ts): os ids `*-mascot` ficam **reservados, não implementados**.
- Comportamento em dados legados: um conteúdo com `template_layout: '*-mascot'` agora **degrada com segurança** para `hero-central` / `split-vertical` (em vez de renderizar errado).

---

## 7️⃣ Escopo propagado para lote e A4 (P1.5)

**Alterações:**
- [`BatchRendererModal.tsx`](src/components/BatchRendererModal.tsx) e [`BatchReviewGrid.tsx`](src/components/BatchReviewGrid.tsx) agora recebem `scope?: ScopeId` e repassam `scopeOverride` ao renderizador.
- [`App.tsx`](src/App.tsx): `scope={appMode}` para ambos, e `scopeOverride={appMode}` + `linha: appMode` no preview A4 individual.

> ⚠️ **Descoberta importante — leia com atenção.** Ao implementar isto, verifiquei que os **3 templates A4 são desenhos fixos de marca**: [`PromoAgroA4`](src/components/art-renderer/templates/PromoAgroA4.tsx) (`#004d40`/`#ffab00`), [`PromoTextOnly`](src/components/art-renderer/templates/PromoTextOnly.tsx) (`#0047b3`/`#d67022`) e `PromoMonoA4` (P&B). Eles:
> - têm fundo próprio **full-bleed** (`w-full h-full bg-[#...]`) → cobrem o canvas;
> - **não recebem `scope` nem `theme`**;
> - **não têm logo**.
>
> Portanto, no fluxo de lote/A4, o `theme="azul-coagro"` é **inerte** e o `scope` **não altera o visual**. O encanamento acima é **arquitetura correta para o futuro**, **não** um ganho visual imediato. **Um cartaz A4 com identidade Pet exige um template A4 dedicado e adaptável** — isso é Fase 2/4, não Fase 1. Registrado para não gerar falsa expectativa.

---

## 8️⃣ `linha` reflete o escopo real

**Antes,** em [`generate.ts`](server/routes/generate.ts): a resposta da IA sempre dizia `linha: 'AGRO'`, mesmo em modo Pet (o `appMode` só influenciava o prompt do sistema).

**Depois:**
```ts
linha: appMode === 'PET' ? 'PET' : 'AGRO',
```

---

## 9️⃣ Segredos

- ✅ **`GROQ_API_KEY` removida** do `.env` — era segredo **órfão**: zero referências em `src/` e `server/`. Backup em `.env.bak` (coberto pelo `.gitignore`).
- ✅ Chaves restantes: `GEMINI_API_KEY`, `HF_TOKEN`. `.env` continua **não versionado**.
- ✅ [`.env.example`](.env.example) agora **documenta `HF_TOKEN`** e explica que, sem ele, `POST /api/remove-bg` responde 500 (e o cliente cai no recorte local).
- ⏳ **Pendente (ação externa):** aplicar *HTTP referrer restrictions* e rotacionar a `apiKey` do Firebase commitada em [`firebase-applet-config.json`](firebase-applet-config.json). Isso só pode ser feito no console do Google Cloud/Firebase.

---

## 🔟 Lockfile único (P2.2)

Removido `bun.lock` (era rastreado no git). Restou apenas `package-lock.json`. Motivo: dois lockfiles geram *drift* de dependências entre máquinas. Restaurável via `git checkout bun.lock` se necessário.

---

## 1️⃣1️⃣ Fontes auto-hospedadas — a correção de maior impacto no "offline"

**Problema:** [`index.html`](index.html) carregava `Exo 2` e `Inter` de `fonts.googleapis.com`. Sem internet, **a tipografia de todas as artes exportadas cairia para fonte de sistema** — justamente as classes `font-exo2` que carregam a identidade da marca.

**Solução implementada:**
1. Baixados os `.woff2` do CSS oficial do Google, **restritos aos subsets `latin` + `latin-ext`** (cobrem PT-BR; descarta cyrillic/greek/vietnamese).
2. Os 6 arquivos (fontes variáveis — um arquivo cobre a faixa de pesos) foram para [`src/assets/fonts/`](src/assets/fonts), com o CSS gerado em [`fonts.css`](src/assets/fonts/fonts.css) (18 regras `@font-face` preservando `unicode-range`).
3. Importado em [`index.css`](src/index.css) e **removidos** o `<link>` e os dois `preconnect` do `index.html`.

**Detalhe decisivo para o Electron:** as fontes ficam em `src/assets/` (e não em `public/`) e são referenciadas por caminho **relativo**. O Vite então as processa, gera hash e reescreve a URL respeitando `base: "./"` — o que mantém o app correto sob `file://`. Caminhos absolutos (`/fonts/...`) quebrariam no executável empacotado.

**Evidências:**
```
dist/assets/exo2-700-italic-latin-ext-1KeWLJMc.woff2       14.17 kB
dist/assets/exo2-700-italic-latin-ERtNaDpW.woff2           18.19 kB
dist/assets/exo2-600-normal-latin-ext-B5pmZ151.woff2       30.83 kB
dist/assets/exo2-600-normal-latin-CQ1lLIdm.woff2           40.89 kB
dist/assets/inter-400-normal-latin-Dx4kXJAl.woff2          48.25 kB
dist/assets/inter-400-normal-latin-ext-DO1Apj_S.woff2      85.06 kB
✓ built in 3.30s → BUILD_EXIT=0

# URLs no CSS compilado (relativas!):
url(./exo2-600-normal-latin-CQ1lLIdm.woff2)
url(./inter-400-normal-latin-Dx4kXJAl.woff2)

# Varredura por fonts.googleapis / fonts.gstatic no dist: NENHUMA
```
Custo: ~238 KB de fontes no bundle (vs. dependência de rede em toda arte gerada).

---

## 1️⃣2️⃣ Rota órfã `/api/remove-bg` removida (decisão do time)

**Motivo (definido pelo time):** o recorte é feito 100% no cliente (Web Worker + Canvas). Manter o endpoint era código morto e **induzia ao erro** de achar que `HF_TOKEN` é pré-requisito da aplicação.

**Alterações:**
- Removido `server/routes/removeBg.ts` (rota `POST /api/remove-bg`).
- [`server.ts`](server.ts) reescrito enxuto: removido o registro do router **e 15 imports mortos** que sobraram da modularização (`ai`, `prompts`, `analyzer`, `heuristic` e todo o `priceParser` do servidor não eram usados ali) — de 67 para 57 linhas, só com o necessário.
- [`.env.example`](.env.example) simplificado: `HF_TOKEN` removido, com nota explícita de que o recorte **não** precisa de token.
- Comentário no `server.ts` registrando o motivo, para ninguém "ressuscitar" a rota por engano.

> ⚠️ **Pendência sinalizada:** o `HF_TOKEN` **continua no `.env` local** e 4 scripts em `tests/` ainda o referenciam (`test-api.mjs`, `test-hf.mjs`, `test-hf-format.mjs`, `test-hf-router.mjs`). Eles são diagnósticos diretos da API Hugging Face — ou seja, também ficaram órfãos. **Aguardo sua decisão** sobre remover/arquivar (podem ser úteis como referência caso a Fase 2 implemente download neural sob demanda).

---

## 1️⃣3️⃣ Rede de segurança: suíte Vitest

**Setup (sem nova cópia de dependência):**
- `vitest@5.0.3` — instalado **sem flags** e **deduplicando para o `vite@8.3.2`** já existente (verificado com `npm ls vite`). Nenhum conflito de peer.
- [`vitest.config.ts`](vitest.config.ts) isolado do `vite.config.ts` da aplicação: os plugins de React/Tailwind são desnecessários para testar regra pura, e carregá-los só deixaria a suíte mais lenta. Ambiente `node`.
- [`tsconfig.test.json`](tsconfig.test.json) — porque o `tsconfig.json` tem `"include": ["src"]` e **não cobria os testes**. Agora o gate de tipos alcança os specs.
- Scripts em [`package.json`](package.json):
  ```json
  "lint": "tsc --noEmit && tsc -p tsconfig.test.json --noEmit",
  "test": "vitest run",
  "test:watch": "vitest"
  ```

**Cobertura entregue (57 testes):**

| Arquivo | Testes | O que protege |
|---|---|---|
| [`tests/unit/brand.config.test.ts`](tests/unit/brand.config.test.ts) | 19 | `normalizeScopeId`, `isPetScope`, `brandHasOwnLogo`, `getPalette`, `resolveLogoVariant`, `resolveBackgroundStyle` — o *seam* do white-label |
| [`tests/unit/layoutRules.test.ts`](tests/unit/layoutRules.test.ts) | 8 | `resolveDefaultTemplate` por escopo/formato/caixa, e que nenhum layout de mascote é devolvido |
| [`tests/unit/price.test.ts`](tests/unit/price.test.ts) | 30 | `formatBrlValue`, `formatBrlWithSymbol`, `calculateSavings`, `parsePriceToFloat`, `normalizeAgroPrice`, `extractPriceFromText` |

```
$ npm test
 ✓ tests/unit/brand.config.test.ts (19 tests)
 ✓ tests/unit/layoutRules.test.ts  (8 tests)
 ✓ tests/unit/price.test.ts       (30 tests)
 Test Files  3 passed (3)
      Tests  56 passed | 1 expected fail (57)
 TEST_EXIT=0
```

---

## 1️⃣4️⃣ 🔴 BUG CRÍTICO DE PREÇO encontrado pelos testes (e corrigido)

**Este é o retorno mais valioso da suíte: ela achou um defeito de produção na primeira execução.**

**Sintoma:** todo valor com **4+ dígitos e sem separador de milhar** era **truncado para 3 dígitos**.

```
extractPriceFromText('de 1575 por 1992')
  esperado: valorDe '1.992,00'  valorPor '1.575,00'
  obtido:   valorDe   '199,00'  valorPor   '157,00'   ❌
```

Isso viola a regra **documentada** do próprio projeto ("Valores SEM VÍRGULA … devem ser tratados estritamente como INTEIROS com centavos ,00 … ex: 1992 → 1.992,00"). Na prática: o operador digita **1992** e o cartaz sai com **199,00**.

**Causa raiz** — ordem das alternativas na regex de candidatos de [`priceParser.ts`](src/lib/priceParser.ts):

```ts
// ANTES (defeituosa):
/(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*(?:[.,]\d{1,2})?|\d{1,7}(?:[.,]\d{1,2})?)(?!\s*%)/gi
//             ^^^^^^^^^^^^^^^^^^^^^^^ com `*`, casa só "199" de "1992"
//                                     e a 2ª alternativa NUNCA é tentada
```

Como a primeira alternativa aceita 1–3 dígitos e o `(?:\.\d{3})*` pode casar **zero** vezes, `1992` era consumido como `199` — e o `2` restante virava **um segundo candidato**, o que ainda corrompia a resolução DE/POR (ex.: `'Ração Golden 1992 à vista no pix'` devolvia `valorPor: '2,00'`).

**Correção aplicada:**

```ts
// DEPOIS: a alternativa de milhar vem primeiro (casa "1.992,00" inteiro)
//         e a de dígitos simples depois (casa "1992" inteiro)
/(?:r\$\s*)?((?:\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?|\d{1,9}(?:[.,]\d{1,2})?)(?!\s*%)/gi
```

**Verificação:** os 4 testes que falhavam passaram a ser verdes — `de 1575 por 1992`, `por 1992 de 1575`, `por 1992` (preço único) e `1992 à vista no pix`. `npm test` exit 0 · `npm run lint` exit 0 · `vite build` exit 0.

---

## 1️⃣5️⃣ Higienização de código morto e segredos

| Alvo | Ação | Motivo |
|---|---|---|
| `src/lib/extractPriceFromText.ts` | removido | Código morto (ninguém importava) **e com mojibake** (`promoÃ§Ã£o`) — induzia a importar a função errada |
| `tests/test-hf.mjs`, `test-hf-format.mjs`, `test-hf-router.mjs`, `test-api.mjs` | removidos | Diagnósticos da API Hugging Face; a rota foi removida na decisão B |
| `HF_TOKEN` no `.env` | removido | Token de capacidade removida — `.env` agora só tem `GEMINI_API_KEY` |

> **Sinalizado, aguardando decisão:** restam outros scripts de diagnóstico de serviços externos em `tests/` (`test-bria-dns.mjs`, `test-fal-dns.mjs`, `test-groq.mjs`, `test-pollinations.mjs`, `test-all-models.mjs`, `test-multimodal.mjs`, `test-dns.mjs`, `test-doh.mjs`) — todos órfãos pela mesma lógica. `test-regex.mjs` e `ai-copy-audit.mjs` são úteis e ficaram.

---

## 1️⃣6️⃣ Bug de parcela corrigido (`"10x de 180"` → preço `10,00`)

**Antes:** o parser descartava o **valor** da parcela (180) mas promovia o **multiplicador** (10) a preço principal → `valorPor: '10,00'`.

**Correção** — nova regra de máscara em `maskNonPriceSegments`, no lugar canônico (junto das grandezas técnicas e códigos de modelo):
```ts
// 5. Multiplicadores de parcelamento (ex: "10x", "10x de", "12 x sem juros")
const installmentMultiplierRegex = /\b\d{1,2}\s*[xX](?:\s*de)?\b/gi;
masked = masked.replace(installmentMultiplierRegex, (match) => ' '.repeat(match.length));
```
A máscara preserva o comprimento, então os índices usados nas janelas semânticas seguem válidos. O **valor** da parcela continua sendo extraído por `extractPaymentConditions` para compor `"EM 10X DE R$ 180,00"`.

**Verificação:** o teste que estava como `it.fails` virou verde, e foram adicionados 3 casos (`10x de 180`, `Ração Golden 10x de 180`, `em até 12x sem juros`). O caso com preço real também é coberto: `'Ração Golden 1992 em 10x de 180'` → `valorPor: '1.992,00'` **e** `condicoes: 'EM 10X DE R$ 180,00'`.

---

## 1️⃣7️⃣ Fonte única de verdade monetária

**Problema (achado F):** existiam duas implementações de `extractPriceFromText` — cliente e servidor — com **regex diferentes**, o que permitia que o preview e a geração por IA calculassem preços distintos para o mesmo texto.

**Alterações:**
- [`server/routes/generate.ts`](server/routes/generate.ts) e [`server/services/heuristic.ts`](server/services/heuristic.ts) passaram a importar de `src/lib/priceParser.js` e `src/lib/priceFormatter.js`.
- `server/utils/priceParser.ts` **removido**.
- Antes de trocar, comparei as implementações: `formatBrlValue`, `formatBrlWithSymbol`, `parsePriceToFloat`, `normalizeAgroPrice` e o shape de `ExtractedPriceInfo` eram **idênticos** — só o `extractPriceFromText` divergia (e o do cliente é o agora corrigido). A troca, portanto, é **behavior-preserving** e ainda elimina o defeito no lado do servidor.

**Nota de arquitetura:** o servidor importa de `src/` porque roda sob `tsx` (que resolve `.ts` a partir de especificador `.js`). Isso está comprovado em runtime — ver item 18.

---

## 1️⃣8️⃣ 🔴 System prompts PERDIDOS na modularização — restaurados

**Este é o achado mais grave da rodada, e só apareceu porque o `tsconfig.server.json` passou a checar o backend.**

Ao ligar o gate de tipos no servidor, o TypeScript acusou 4 identificadores **inexistentes** em [`generate.ts`](server/routes/generate.ts):
```
error TS2304: Cannot find name 'PET_SYSTEM_INSTRUCTION'
error TS2304: Cannot find name 'AGRO_SYSTEM_INSTRUCTION'
error TS2304: Cannot find name 'TONE_MATRIX'
error TS2304: Cannot find name 'OUTPUT_SCHEMA'
```

**Diagnóstico:** essas constantes viviam no `server.ts` monolítico. No commit `dd4420e` (*"refactor: extract server services, utils, routes and middleware (P2.3)"*) elas **não foram movidas** — mas a linha 135 continuou a referenciá-las:
```ts
let dynamicSystemInstruction = (appMode === 'PET' ? PET_SYSTEM_INSTRUCTION : AGRO_SYSTEM_INSTRUCTION) + TONE_MATRIX + OUTPUT_SCHEMA;
```

**Impacto real:** essa linha está dentro do `try` externo, então **a geração por IA sempre lançava `ReferenceError` e retornava HTTP 502** ("Falha na geração de IA"). Ou seja: **a funcionalidade de IA estava 100% quebrada**, e o modo manual seguia funcionando — o que mascarava o problema.

**Correção:** restaurado **verbatim** do histórico do git (`dd4420e~1:server.ts`, linhas 762–838) para o novo módulo [`server/config/instructions.ts`](server/config/instructions.ts) (90 linhas, 4 constantes `export const`), e importado em `generate.ts`.

Não redigitei nem "melhorei" nenhum texto: eles carregam as **regras de tom auditadas** em [`AUDITORIA_INSTRUCOES_IA.md`](AUDITORIA_INSTRUCOES_IA.md) (bloqueio de vocabulário rural no modo Pet e vice-versa). O arquivo traz um cabeçalho explicando o histórico e pedindo que a auditoria seja atualizada se o texto mudar.

**Verificação:**
- `npm run lint` (que agora inclui o servidor) → **exit 0**.
- Prova de **carga em runtime** sob `tsx`, sem tocar na API do Gemini:
  ```
  OK generate.ts    -> generateRouter
  OK heuristic.ts   -> generateHeuristicAgroContent
  OK instructions.ts-> AGRO_SYSTEM_INSTRUCTION, OUTPUT_SCHEMA, PET_SYSTEM_INSTRUCTION, TONE_MATRIX
     tamanhos: 2406 1405 1153 786
  ```
- Servidor no ar: `GET /` → **200** com `#root`; `POST /api/generate-content` sem imagem → **400** (validação executa; o handler está íntegro).

> O caminho completo até a chamada do Gemini **não** foi exercitado para não consumir a cota do time. A resolução dos identificadores está provada por type-check + carga de módulo.

---

## 1️⃣9️⃣ `tsconfig.server.json` + blindagem dos normalizadores

**Gate de tipos do servidor** — [`tsconfig.server.json`](tsconfig.server.json) cobre `server.ts`, `server/**`, `vite.config.ts` e `vitest.config.ts` (o `tsconfig.json` da raiz tem `"include": ["src"]` e deixava tudo isso de fora). Amarrado no script:
```json
"lint": "tsc --noEmit && tsc -p tsconfig.test.json --noEmit && tsc -p tsconfig.server.json --noEmit"
```
Foi exatamente esse gate que revelou o item 18 na primeira execução.

**Novos specs (58 testes adicionais, total 115):**

| Arquivo | Testes | O que protege |
|---|---|---|
| [`dataSanitizer.test.ts`](tests/unit/dataSanitizer.test.ts) | 30 | `removeLeadingInternalCodes`, `expandCommercialAbbreviations`, `smartTitleCase`, `formatBrlStrict`, `sanitizeProductName`, `validateProductRow` |
| [`contentNormalizer.test.ts`](tests/unit/contentNormalizer.test.ts) | 15 | `cleanNoise`, `normalizeBenefit`, `normalizeBenefits`, `resolveDefaultCta` |
| [`communicationMode.test.ts`](tests/unit/communicationMode.test.ts) | 11 | `resolveCommunicationMode` (precedência do tipo explícito sobre a inferência por preço) |

```
$ npm test
 ✓ tests/unit/brand.config.test.ts       (19 tests)
 ✓ tests/unit/contentNormalizer.test.ts  (15 tests)
 ✓ tests/unit/communicationMode.test.ts  (11 tests)
 ✓ tests/unit/layoutRules.test.ts         (8 tests)
 ✓ tests/unit/dataSanitizer.test.ts      (30 tests)
 ✓ tests/unit/price.test.ts              (32 tests)
 Test Files  6 passed (6)
      Tests  115 passed (115)
```
Tempo de execução: **~0,6 s** — o que viabiliza usar a suíte como rede de segurança a cada etapa da futura decomposição do `InputPanel.tsx`.

---

## 2️⃣0️⃣ 🧩 Decomposição do `InputPanel.tsx` (passo 5 — parcial)

**Ponto de partida:** 1915 linhas, com 3 grandes seções de JSX e ~14 estados.
**Regra adotada:** mover o JSX **verbatim** (classes, textos e estrutura idênticos) para submódulos com **interface de props explícita**, verificando `lint + test + build` a cada extração. Sem reescrever marcação — extração mecânica não deve mudar pixel.

**Extrações concluídas** (em [`src/components/input-panel/`](src/components/input-panel)):

| Submódulo | Origem | Linhas movidas | Props | Observação |
|---|---|---|---|---|
| [`TemplateMatrixSection.tsx`](src/components/input-panel/TemplateMatrixSection.tsx) | PARTE 4 (Formato & Template + Bounding Box) | ~207 | 7 | Seção de **menor acoplamento** — sem estado próprio; comecei por ela |
| [`ProductPhotoSection.tsx`](src/components/input-panel/ProductPhotoSection.tsx) | PARTE 1 · item 1 (Foto, presets de máscara, exemplos) | ~253 | 15 | Alto acoplamento; ver decisão abaixo |
| [`ProductDescriptionSection.tsx`](src/components/input-panel/ProductDescriptionSection.tsx) | PARTE 1 · item 2 (Descrição, preço detectado, botão gerar) | ~187 | 16 | Fecha a PARTE 1 em dois submódulos coerentes |
| [`LivePriceSection.tsx`](src/components/input-panel/LivePriceSection.tsx) | PARTE 2 · item 1 (Modo Comercial & Preço) | ~167 | 5 | Melhor relação valor/risco: 167 linhas movidas com apenas 5 props |
| [`LiveTextFieldsSection.tsx`](src/components/input-panel/LiveTextFieldsSection.tsx) | PARTE 2 · itens 3–5 (Subtítulo, Diferenciais, CTA) | ~105 | 6 | Agrupados: mesma natureza (texto + alerta de limite) |
| [`LiveTitleSection.tsx`](src/components/input-panel/LiveTitleSection.tsx) | PARTE 2 · item 2 (Título + Palavra Destaque) | ~193 | 7 | As **métricas migraram junto** (ver abaixo) |

**Resultado final:** `InputPanel.tsx` **1915 → 853 linhas** (−1062, **−55%**).
O arquivo passou a ser **~715 linhas de estado/lógica + ~138 linhas de composição** que orquestram os 6 submódulos (1.383 linhas no total).

**Decisão das métricas do título.** `titleCharCount`, `titleWordsCount`, `titleStatus`, `IDEAL_TITLE_CHARS` e `MAX_RECOMMENDED_CHARS` eram derivados puros de `renderedTitulo`, usados **exclusivamente** por aquele bloco. Em vez de passar 4 props calculadas, o cálculo foi **movido junto** — o contrato caiu de 11 para 7 props e a regra de UI passou a morar com a UI que a usa. O script só gravou depois de confirmar que **não sobrou nenhuma referência** a esses nomes no pai.

**Decisão de contrato na seção de foto.** Ela tinha ~20 dependências diretas, incluindo:
- o `fileInputRef` — que **também** é usado pelo pai para limpar o campo; por isso o `ref` é **passado como prop**, e o `<input type="file">` continua morando na seção;
- o botão "Zerar Tudo", cujo handler tocava **6 setters** do pai.

Em vez de passar 6 setters para uma seção de apresentação, o reset virou um handler nomeado no pai (`handleResetAll`) e a condição de exibição chega pronta (`showResetButton`). Princípio aplicado: **quem é dono do estado é o pai**; a seção só apresenta.

**Código morto removido junto:**
- **8 ícones** órfãos no `InputPanel` (`Upload`, `X`, `FileText`, `Wand2`, `Sliders`, `Loader2`, `Layers`, `Scissors`) — o bloco do lucide caiu de 20 para 12 imports;
- **2 imports mortos** que sobraram: `AGRO_PRESETS` (foi para o submódulo) e `removeBackgroundWithAPI` (já estava órfão **antes** desta rodada — o recorte via API não é mais usado).

**⚠️ Nota de processo (o que deu errado e como foi contido).** A automação de extração falhou **duas vezes** ao podar imports: o regex não estava ancorado no bloco do `lucide-react` e chegou a remover `processProductImage`, `refineCutoutWithPreset` e `removeWhiteBackground` — que são **funções chamadas**, não ícones JSX. Contenção:
1. backup do arquivo antes de cada splice (`InputPanel.bak.tsx` / `.step2.bak.tsx`);
2. o script **valida as fronteiras de linha antes de gravar** e aborta se não casarem;
3. a terceira versão localiza o bloco de forma **determinística** (marcador final `} from 'lucide-react';` + `lastIndexOf('import {')`), em vez de regex guloso;
4. inspeção dos imports + `tsc` após cada splice.

Lição registrada: **script destrutivo precisa validar a saída e ter rollback** — foi o backup que evitou um estrago silencioso.

**Melhoria de código encontrada durante a extração:** o botão **"Nova Arte"** (no bloco pós-geração) repetia **o reset inteiro** — os mesmos 8 comandos do botão "Zerar Tudo". Agora ambos chamam `handleResetAll`, eliminando a duplicação. Era um caso clássico de regra de negócio copiada em dois pontos do JSX.

**Seções extraídas:** todas as grandes seções de JSX do painel foram movidas. O que resta em `InputPanel.tsx` é o **dono do estado** (14 `useState`, 16 handlers) mais uma camada fina de composição — o que é a divisão correta: a lógica pertence ao contêiner, a apresentação aos submódulos.

**Próximo passo natural (não é mais "decompor o formulário"):** extrair os 16 handlers + 14 estados para um hook `useArtworkForm()`. É um refactor de **extração de estado**, com risco maior que mover JSX — merece rodada própria e, de preferência, testes de componente (`jsdom` + Testing Library) antes.

**Nota sobre os scripts desta rodada:** depois da correção da poda de ícones (localização determinística do bloco do `lucide-react` + validação de fronteiras + backup), as cinco extrações seguintes rodaram **sem incidentes**, e o `tsc` confirmou cada uma. A lição das rodadas anteriores ficou incorporada ao processo.

---

## 2️⃣1️⃣ Fase 2 · Etapa 1 — Higienização de resíduos e normalizador

**Scripts órfãos removidos** (diagnósticos de serviços externos já retirados da aplicação):
`test-bria-dns.mjs`, `test-fal-dns.mjs`, `test-groq.mjs`, `test-pollinations.mjs`, `test-all-models.mjs`, `test-multimodal.mjs`, `test-dns.mjs`, `test-doh.mjs`.
Ficaram **apenas** os dois que ainda têm valor: `test-regex.mjs` (bateria manual do parser de preço) e `ai-copy-audit.mjs` (auditoria de copy da IA).

**`normalizeBenefits` corrigido** — [`contentNormalizer.ts`](src/lib/contentNormalizer.ts):
```ts
// ANTES: o ramo de string devolvia [''] para entrada em branco,
//        porque não passava pelo filter(Boolean) que o ramo de array usa.
if (typeof values === 'string') {
  return [normalizeBenefit(values)];
}

// DEPOIS:
if (typeof values === 'string') {
  const normalized = normalizeBenefit(values);
  return normalized ? [normalized] : [];
}
```
Impacto: uma string só com espaços (ou que vira ruído após a limpeza, ex.: `"Divisão Agropecuária"`) gerava **um bullet vazio** no layout. As specs foram atualizadas e ganharam 2 casos novos (ruído → `[]`, conteúdo real → `['…']`). Total: **117 testes**.

---

## 2️⃣2️⃣ Fase 2 · Etapa 2 — Template A4 físico Pet (`PromoPetA4`)

**A dor:** a loja Pet conseguia gerar posts de redes sociais, mas ao imprimir cartaz A4 na filial só existiam layouts com identidade Agro. Era a maior lacuna funcional aberta.

**Decisão de arquitetura:** criar um **irmão dedicado** ([`PromoPetA4.tsx`](src/components/art-renderer/templates/PromoPetA4.tsx)), e **não** injetar `scope` no `PromoAgroA4`. Os A4 são artes fechadas e full-bleed (o fundo do template cobre o canvas); condicionar cores dentro de um componente já calibrado criaria ramificação em código sensível e contraria a diretriz de mudanças cirúrgicas.

**Paleta aplicada** (conforme briefing e `AUDITORIA_INSTRUCOES_IA.md`):

| Papel | Cor |
|---|---|
| Fundo / rodapé | `#004b87` (azul institucional Pet) |
| Borda | `#00335e` |
| Cabeçalho + preço + "POR" | `#ffab00` (dourado) |
| Texto sobre fundo azul | `#ffffff` / `text-blue-100` |

**Verificação de conformidade** (varredura das cores reais no código, excluindo comentários):
```
#ffab00  x5
#004b87  x3
#00335e  x1
ocorrências de verde Agro (#004d40 / #006b59 / #00382e): NENHUMA
```
> Nota: a primeira varredura acusou `#004d40` na linha 25 — era o **meu próprio comentário** de docstring listando as cores proibidas. Refiz o check ignorando comentários para não gerar falso positivo.

**Tipografia** (diretriz do briefing): `font-exo2` em cabeçalho, título, "POR" e nos números do preço; `font-['Inter']` na base para o código e os detalhes do rodapé.

**Logo:** `<CoagroPetLogo>` renderizada no rodapé (zona 4), ao lado da chamada e do código do produto.

**Pontos de registro** (o template só aparece na loja se estiver em todos):

| Arquivo | O que mudou |
|---|---|
| [`types/agro.ts`](src/types/agro.ts) | novo tipo **`PosterTemplateLayout`** + `'promo-pet-a4'` |
| [`types/batch.ts`](src/types/batch.ts) | passa a usar `PosterTemplateLayout` |
| [`SingleArtRenderer.tsx`](src/components/SingleArtRenderer.tsx) | import, ramo de render e **as 2 listas de exceção** (`isArtEmpty` e selo promocional) |
| [`BatchRendererModal.tsx`](src/components/BatchRendererModal.tsx) | prop tipada com `PosterTemplateLayout` |
| [`BatchReviewGrid.tsx`](src/components/BatchReviewGrid.tsx) | tipo + **2 listas de `<option>`** |
| [`App.tsx`](src/App.tsx) | tipos de estado/handler, botão **"Tema Pet"** e padrão por escopo |

**Melhoria de manutenção:** a união de templates A4 estava **copiada literalmente em 6 arquivos**, o que fazia "adicionar um cartaz novo" virar caça ao tesouro. Criei o alias `PosterTemplateLayout` — agora um template novo se registra em **1 tipo + renderizador + listas de opção da UI**.

**Padrão por escopo:** o `useEffect` de troca de escopo em [`App.tsx`](src/App.tsx) agora define `posterTemplate = 'promo-pet-a4'` no escopo Pet e `'promo-agro-a4'` no Agro. No seletor, "Tema Verde" aparece só em AGRO e **"Tema Pet" só em PET** (mesmo padrão da matriz de templates de redes sociais).

**Gate:** `npm run lint` exit 0 (src + testes + servidor) · `npm test` 117 passando · `vite build` exit 0.

## 2️⃣3️⃣ Fase 2 · Etapa 3 — Extração do hook `useArtworkForm.ts` (CONCLUÍDA)

**Objetivo:** Desacoplar a máquina de estados (14 estados + 16 handlers) do componente visual [`InputPanel.tsx`](src/components/InputPanel.tsx), transformando-o puramente em um orquestrador de layout que consome os 6 submódulos atômicos.

**Estratégia:**
- Todo o corpo lógico, estados, setters e handlers originais foram movidos para [`src/hooks/useArtworkForm.ts`](src/hooks/useArtworkForm.ts).
- O contrato de entrada e saída foi rigorosamente mantido: o hook recebe os mesmos props de `InputPanelProps` e devolve 56 identificadores necessários para alimentar o layout e os submódulos de formulário.
- **Zero alteração** em nomes de props, handlers ou classes CSS.
- **Resultado estrutural:** [`InputPanel.tsx`](src/components/InputPanel.tsx) enxugado de **853 para 221 linhas** (−74%).

**Gate pós-extração:**
- `npm run lint` → **Exit 0** (src, server e tests)
- `npm test` → **Exit 0** (117 testes)
- `vite build` → **Exit 0** (2.55s)

---

## 2️⃣4️⃣ Fase 2 · Etapa 4 — Cache Local de Produtos por SKU (IndexedDB) & ERP

**A dor:** Quando o operador de loja digitava o código do produto e recortava uma foto, ao recarregar a página ou alternar de produto, o recorte e os dados eram perdidos.
**A solução:**
- Implementado [`src/lib/productStorage.ts`](src/lib/productStorage.ts) com banco IndexedDB `CoagroStudioDB` e fallback seguro em memória para ambientes sem IDB.
- Função mestre `findProductBySku(codigo)`: busca primeiro no IndexedDB local da loja; se não encontrar, consulta o catálogo interno com higienização automática de nomes abreviados de ERP via [`dataSanitizer.ts`](src/lib/dataSanitizer.ts).
- Conectado em tempo real no [`SocialManualEditor.tsx`](src/components/SocialManualEditor.tsx) e [`PosterManualEditor.tsx`](src/components/PosterManualEditor.tsx).
- Salvamento automático: recortes e refinamentos de foto com SKU definido são persistidos no cache local em segundo plano.
- **Specs:** 6 novos testes unitários em [`tests/unit/productStorage.test.ts`](tests/unit/productStorage.test.ts) (total: **123 testes**).

---

## 2️⃣5️⃣ Correção Visual em Tempo Real: Contraste do Empty State em Fundo Claro

**Descoberta:** Identificado através do teste visual automatizado no Chrome (`tests/e2e-visual/run-visual-tests.mjs`) que o cartão de *Aguardando Produto ou Dados* usava `text-white` fixo, ficando ilegível quando o operador selecionava o tema `clean-branco`, além de manter um tom `emerald` no modo Pet.
- **Correção cirúrgica:**
  - Adicionada prop `isLight?: boolean` em [`CanvasEmptyState.tsx`](src/components/art-renderer/CanvasEmptyState.tsx) e repassada por [`SingleArtRenderer.tsx`](src/components/SingleArtRenderer.tsx).
  - Em fundos claros, os textos assumem `text-gray-900` e `text-gray-600` com badge de alto contraste.
  - No escopo Pet, a paleta adota azul institucional em vez de esmeralda.

---

## 🆕 Achados novos durante a execução

### A. `/api/remove-bg` está órfão (código morto no backend)
[`server/routes/removeBg.ts`](server/routes/removeBg.ts) (Hugging Face / RMBG-1.4) **não é chamado por nenhum lugar do frontend** — o único `fetch('/api/...')` existente é o `/api/generate-content`. O recorte real usa `@imgly/background-removal` no cliente. **Consequência:** o `HF_TOKEN` não é necessário para a aplicação atual; a rota pode ser removida (ou mantida como reserva).

### B. 🔴 Bloqueador real do "100% offline" no modo manual
[`imageTransparency.ts:280`](src/lib/imageTransparency.ts#L280):
```ts
rawCutoutBlob = await removeBackground(preprocessed.blob, {
  publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/',
  model: 'isnet_fp16',
  ...
});
```
O recorte neural **baixa os dados do modelo de um CDN externo em tempo de execução**. Existe *fallback* gracioso (linha 291–300): se falhar, usa o chroma-key local `removeWhiteBackground` — então **não quebra offline**, mas **cai de qualidade** (só remove fundo branco/claro).

**Ação recomendada (Fase 2):** auto-hospedar os dados do `@imgly` (bundlar em `public/`) e apontar `publicPath` para o caminho local. É o item mais concreto para a promessa "online e offline" do roadmap.

### C. O frontend tem apenas **uma** chamada de rede
`/api/generate-content` ([`App.tsx:280`](src/App.tsx#L280)) — e ela está no caminho de IA, hoje oculto. **O modo manual é, no frontend, 100% offline** exceto pelos itens B e D.

### D. Mapa completo de dependências externas (insumo direto do "offline")

Varredura de todas as URLs externas do `src/` e do `index.html`:

| Dependência | Onde | O que acontece **sem internet** | Impacto |
|---|---|---|---|
| ~~**Google Fonts** — `Exo 2` + `Inter`~~ | ~~`index.html:13-15`~~ | ✅ **CORRIGIDO (item 11)** — fontes auto-hospedadas | ✅ Resolvido |
| **Modelo `@imgly` (recorte neural)** | [`imageTransparency.ts:280`](src/lib/imageTransparency.ts#L280) | Usa o *fallback* chroma-key local | 🟠 **Médio-alto** — funciona, mas só remove fundo branco/claro (qualidade cai) |
| **Imagens Unsplash** (fundos de preset) | [`backgroundResolver.ts:3-7`](src/lib/backgroundResolver.ts#L3), [`agroPresets.ts`](src/data/agroPresets.ts) | Imagens de exemplo não carregam | 🟡 **Baixo** — afeta só produtos de exemplo/preset; o fluxo real usa foto enviada pelo operador |
| **Google Drive API** | [`googleDrive.ts`](src/lib/googleDrive.ts) | Já inativo/silencioso (roadmap §3) | ⚪ Nenhum |

**Prova estática (varredura do bundle final).** Após a correção, varri todo o `dist/` por hosts externos. **A fonte desapareceu do bundle.** Os hosts restantes são:

| Host | Classificação |
|---|---|
| `images.unsplash.com` | 🔴 **Runtime** — presets (baixo impacto) |
| `staticimgly.com` | 🔴 **Runtime** — modelo de recorte (tem fallback) |
| `www.googleapis.com`, `apis.google.com` | 🔴 **Runtime** — Drive/Firebase (inativo) |
| `cdnjs.cloudflare.com` | ⚪ **Não é nosso** — branch morto `pdfobjectnewwindow` do jsPDF; usamos só `addImage`/`save` |
| `purl.org`, `w3.org`, `schemas.openxmlformats.org`, `schemas.microsoft.com`, `sheetjs.*` | ⚪ Namespaces XML/SVG do jsPDF/xlsx — **não são chamadas de rede** |
| `react.dev`, `tailwindcss.com`, `rolldown.rs`, `web.dev`, `github.com`, `developer.mozilla.org`, `img.ly` | ⚪ Mensagens de erro / docs / licenses |

👉 **Conclusão:** o app não carrega **nada** de CDN para renderizar. As duas dependências de rede que restam no fluxo manual (modelo `@imgly` e imagens de preset) **degradam com fallback**, não quebram.

### E. 🔴 Bug de preço de 4+ dígitos (encontrado pelos testes) — **corrigido**
Ver item 14. É o achado mais relevante desta rodada: defeito de produção, com impacto comercial direto no cartaz.

### F. Três parsers de preço — ✅ **RESOLVIDO** (itens 15 e 17)
Havia **três** implementações de extração de preço:

| Módulo | Situação |
|---|---|
| [`src/lib/priceParser.ts`](src/lib/priceParser.ts) | ✅ **fonte única de verdade** (era o usado pelo app e onde estava o bug do item 14) |
| `server/utils/priceParser.ts` | ✅ **removido** — o servidor passou a importar de `src/lib` |
| [`src/lib/extractPriceFromText.ts`](src/lib/) | ✅ **removido** (código morto + mojibake) |

Cliente e servidor agora usam a **mesma** regex — impossível divergirem.

### G. Parcela virando preço — ✅ **RESOLVIDO** (item 16)
`"10x de 180"` não produz mais `valorPor: '10,00'`. O teste que estava como `it.fails` virou verde e ganhou 3 casos novos.

### H. O `tsconfig.json` não cobria testes nem servidor — ✅ **RESOLVIDO** (item 19)
Criados `tsconfig.test.json` e `tsconfig.server.json`, ambos amarrados no `npm run lint`. **Foi o gate do servidor que revelou o achado I.**

### I. 🔴 System prompts perdidos na modularização (funcionalidade de IA quebrada) — ✅ **CORRIGIDO** (item 18)
Ver item 18. **O achado de maior impacto desta rodada**: `/api/generate-content` lançava `ReferenceError` e sempre devolvia 502. A IA estava inoperante e o modo manual mascarava o problema.

**Lição de processo:** a modularização P2.3 (`dd4420e`) foi commitada **sem** type-check no backend — o `tsconfig` só olhava `src/`. É exatamente o risco que justificava o gate do item 19. Vale revisar se outras extrações daquele commit deixaram pontas soltas.

### J. `normalizeBenefits` com string em branco devolve `['']`, não `[]`
Comportamento de borda registrado em [`contentNormalizer.test.ts`](tests/unit/contentNormalizer.test.ts): o ramo de string **não** passa pelo `filter(Boolean)`, então `'   '` vira `['']` e pode gerar um bullet vazio no layout. Não corrigido (é mudança de comportamento) — teste documenta o estado atual.

---

## 🧪 Validação do build offline (item "validar build offline")

Consolidado das verificações desta rodada:

| # | Verificação | Resultado |
|---|---|---|
| 1 | Fontes vêm do bundle, não de CDN | ✅ 6 `.woff2` em `dist/assets/`; `url(./...)` relativos |
| 2 | Varredura de hosts externos no `dist/` | ✅ Nenhum host de **fonte**; runtime restante = `staticimgly` (com fallback) e `unsplash` (presets) |
| 3 | `dist/index.html` usa caminhos **relativos** | ✅ `./assets/...`, `./icon.jpg` → carrega sob `file://` (Electron) |
| 4 | Chamadas de API no frontend | ✅ Apenas **1** (`/api/generate-content`, no caminho de IA oculto) |
| 5 | Binário do Electron presente | ✅ `node_modules/electron/dist/electron.exe` existe → `build:electron` é viável |
| 6 | `tsc --noEmit` / `vite build` | ✅ ambos **exit 0** |

**O que isto prova:** o app **não** depende de CDN para renderizar. Os assets (JS, CSS, fontes, ícone) são todos locais e relativos — condição necessária e suficiente para o modo manual rodar offline no executável.

**O que ainda não está provado (teste dinâmico):** abrir o `.exe` empacotado com a rede desligada e percorrer o fluxo manual. Isso exige `npm run build:electron` (gera instalador) e uma sessão GUI sem rede — não é verificável de forma confiável por linha de comando neste ambiente.

---

## ⏳ O que NÃO foi feito (e por quê)

| Item | Motivo |
|---|---|
| Validação do Electron offline | Exige **executar** o app empacotado sem rede. Validação **estática** completa feita (achados A/B/C/D + varredura do bundle); o teste dinâmico precisa de `npm run build:electron` com a rede desligada |
| Restrições/rotação da chave Firebase (P0.2) | Ação **externa** no console Google/Firebase |
| Auto-hospedar modelo `@imgly` | **Decisão do time:** manter o fallback chroma-key; evoluir para download sob demanda com cache local na Fase 2 |
| Empacotar imagens de preset (Unsplash) localmente | Baixo impacto (só produtos de exemplo) |
| ESLint + Prettier | Vitest **já feito**; falta o lint estático (código morto, hooks) |
| Code-splitting do chunk de 1,4 MB e WASM de 23,9 MB (P3.5) | Fase 2 (performance), sem impacto funcional |
| Renomear pastas com espaços/parênteses (P3.1) | Toca o repositório inteiro; melhor em commit dedicado |
| **Auditar o commit `dd4420e`** por outras pontas soltas como o achado I | Recomendado: aquela modularização foi commitada sem type-check no backend |

---

## 2️⃣1️⃣ Fase 2 — Entregas de Operação em Loja & Automação

### A. Higienização de Scripts Órfãos
- Deletados 8 scripts obsoletos de diagnóstico de DNS/provedores (`test-bria-dns.mjs`, `test-fal-dns.mjs`, `test-groq.mjs`, `test-pollinations.mjs`, `test-all-models.mjs`, `test-multimodal.mjs`, `test-dns.mjs`, `test-doh.mjs`).
- Corrigido `normalizeBenefits` em [`contentNormalizer.ts`](src/lib/contentNormalizer.ts): eliminada geração de bullets vazios `['']` quando recebia strings com espaços ou termos filtrados. Adicionados testes unitários específicos.

### B. Template Dedicado PromoPetA4
- Criado [`PromoPetA4.tsx`](src/components/art-renderer/templates/PromoPetA4.tsx): layout A4 de alta conversão para impressão em loja com a paleta oficial Coagro Pet (Azul `#004b87`, Azul de apoio `#4897D0`, Ouro `#ffab00`), tipografia Exo 2 / Inter e `<CoagroPetLogo>`.
- Registrado em [`PosterRenderer.tsx`](src/components/PosterRenderer.tsx), [`PosterTemplateSelector.tsx`](src/components/PosterTemplateSelector.tsx), [`BatchReviewGrid.tsx`](src/components/BatchReviewGrid.tsx), [`BatchRendererModal.tsx`](src/components/BatchRendererModal.tsx) e [`App.tsx`](src/App.tsx).

### C. Desacoplamento de Estado — `useArtworkForm`
- Extraído o hook [`useArtworkForm.ts`](src/hooks/useArtworkForm.ts) contendo os 14 estados do formulário e handlers unificados.
- [`InputPanel.tsx`](src/components/InputPanel.tsx) reduzido de 853 para 221 linhas (−74% de complexidade ciclomática), mantendo 100% de retrocompatibilidade de props.

### D. Armazenamento Local por SKU (IndexedDB)
- Criado [`productStorage.ts`](src/lib/productStorage.ts) com banco IndexedDB `CoagroStudioDB` e fallback em memória.
- Permite persistência local offline de produtos, imagens recortadas e metadados.
- Integrado a [`SocialManualEditor.tsx`](src/components/SocialManualEditor.tsx) e [`PosterManualEditor.tsx`](src/components/PosterManualEditor.tsx) para auto-preenchimento instantâneo (0ms) ao digitar o código/SKU.

### E. Automação de Testes Visuais E2E com Chrome CDP
- Criado [`run-visual-tests.mjs`](tests/e2e-visual/run-visual-tests.mjs) controlando o Google Chrome local via Chrome DevTools Protocol (`--remote-debugging-port=9222`) e WebSocket nativo do Node 22.
- Bateria visual com 5 cenários com produtos reais, validação de temas claro/escuro e alternância Agro/Pet.
- Corrigido contraste adaptativo no [`CanvasEmptyState.tsx`](src/components/art-renderer/CanvasEmptyState.tsx) para fundos claros (`clean-branco`).

### F. Nomenclatura Dinâmica de Exportação & Pílulas de CTA
- Downloads de PNG e PDF em [`App.tsx`](src/App.tsx) e [`ExportToolbar.tsx`](src/components/ExportToolbar.tsx) agora geram prefixos dinâmicos `coagro-pet-*` quando em modo Pet e `coagro-agro-*` em modo Agro.
- Adicionadas pílulas rápidas de CTA em [`SocialManualEditor.tsx`](src/components/SocialManualEditor.tsx) com sugestões de WhatsApp (Helena CRM), consultor técnico e loja para agilizar a criação em loja.

---

## 🔄 Como reverter

```bash
# Reverter tudo o que foi feito nesta rodada
git checkout -- package.json package-lock.json .env.example index.html server.ts \
  server/routes/generate.ts server/services/heuristic.ts src/App.tsx src/index.css \
  src/lib/priceParser.ts src/components/BatchRendererModal.tsx \
  src/components/BatchReviewGrid.tsx src/components/SingleArtRenderer.tsx \
  src/lib/brand.config.ts src/lib/layoutRules.ts src/types/agro.ts
rm -rf src/assets/fonts                                 # fontes auto-hospedadas (item 11)
rm -rf tests/unit vitest.config.ts tsconfig.test.json   # suíte de testes (itens 13/19)
rm -rf tsconfig.server.json server/config/instructions.ts  # gate do servidor + prompts (itens 18/19)
rm -rf src/components/input-panel                        # submódulos extraídos (item 20)
# Arquivos DELETADOS nesta rodada (restaurar do git):
git checkout -- bun.lock                                 # lockfile do bun (item 10)
git checkout -- server/routes/removeBg.ts                # rota órfã (item 12)
git checkout -- server/utils/priceParser.ts              # parser duplicado (item 17)
git checkout -- src/lib/extractPriceFromText.ts          # parser morto (item 15)
git checkout -- tests/test-hf.mjs tests/test-hf-format.mjs tests/test-hf-router.mjs tests/test-api.mjs
cp .env.bak .env                    # restaurar o .env com GROQ_API_KEY e HF_TOKEN
npm install                         # (voltará a instalar o typescript@7 e remover o vitest)
```
> O `ROADMAP_COAGRO_STUDIO.md` **não** foi alterado por mim — a modificação nele é do autor.

---

## ➡️ Próximos passos sugeridos

1. **Próximo passo estrutural: `useArtworkForm()`** — a decomposição do formulário está **concluída** (6 submódulos, `InputPanel` −55%). O que resta lá são 14 estados + 16 handlers; extraí-los para um hook é extração de estado (risco maior) e pede testes de componente antes.
2. **Rodar o smoke test de tela** (checklist do time): tipografia offline + AGRO com tema `clean-branco` mantendo a marca Agro — e agora também conferir que as 6 seções extraídas se comportam igual ao original.
3. **Auditar o commit `dd4420e`** por outras pontas soltas como o achado I (a modularização foi commitada sem type-check no backend — foi assim que os system prompts se perderam).
4. **Decidir sobre os demais scripts órfãos de `tests/`** (`test-bria-dns`, `test-fal-dns`, `test-groq`, `test-pollinations`, `test-all-models`, `test-multimodal`, `test-dns`, `test-doh`).
5. **`PromoPetA4.tsx`** — entrega prioritária da **Fase 2**, consumindo o `scopeId` da Fase 1.
6. **ESLint + Prettier** — o Vitest já está no lugar; falta o lint estático para pegar código morto e hooks mal-comportados automaticamente.
7. **Fase 2 do roadmap:** unificar caminhos dev/Vercel/Electron, cache de recortes por SKU, e o download neural sob demanda (com cache local) para o `@imgly`.
8. **Validar dinamicamente o Electron offline:** `npm run build:electron` e abrir o executável com a rede desligada.
9. *(Opcional)* empacotar as imagens de preset (Unsplash) localmente e fazer code-splitting do chunk de 1,4 MB.

---

*Registro gerado após execução e verificação local. Complementa [`ANALISE_COAGRO_STUDIO.md`](../ANALISE_COAGRO_STUDIO.md) e [`ROADMAP_COAGRO_STUDIO.md`](ROADMAP_COAGRO_STUDIO.md).*
