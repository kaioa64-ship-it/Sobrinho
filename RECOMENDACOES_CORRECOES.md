# 📋 RECOMENDAÇÕES DE CORREÇÃO — Coagro Agro Studio

**Data:** 08/10/2026 · **Atualizado:** 08/10/2026 (após rodada de correções aplicadas)
**Escopo:** Resultados da análise, testes locais e auditoria da lógica AGRO ↔ PET da aplicação.
**Como usar:** execute as correções na ordem abaixo (P0 → P4). Cada item indica o arquivo, a linha aproximada, o problema, a correção sugerida e como verificar se funcionou.

---

## 📊 STATUS DA RODADA ATUAL (08/10/2026)

| Item | Status | Evidência verificada |
|------|--------|----------------------|
| **Redução do Repositório** | ✅ **FEITO** | Removidas duplicações de `mascotes` na raiz; conversão de imagens de altíssima resolução (`public/mascotes` e `IDEIAS DE MODELOS`) de `.png`/`.jpg` para `.webp`. **Peso real do repositório (tracked git files) caiu de >115MB para 19.10 MB.** Referências no código TSX atualizadas com sucesso. |
| **P1.1 logo por scope** | ✅ **FEITO** | `ArtHeader` atualizado para receber a prop `scope`. Artes PET agora carregam diretamente a logo `CoagroPetLogo` ignorando variação por fundo (que mantinha o erro). |
| **P1.3–P1.5 paletas Pet / impressão-lote** | ✅ **FEITO** | Criado arquivo `src/lib/brand.config.ts` com função centralizada `getPalette(scope)`. `SingleArtRenderer` repassa as paletas e cores para *todos* os templates (inclusive os antigos `HeroCentral` e `SplitVertical`). O modo lote/A4 agora herda automaticamente a cor pelo scope da linha, resolvendo o bug da Impressão. |
| **P2.1 erros TypeScript** | ✅ **FEITO** | `npm run build` e tipagem passando sem erros. Todos os 27 erros de TS resolvidos; unions de `'primary'` adaptados. |
| **P0.1 endpoint `/api/hf-token`** | ✅ **FEITO** | Rota removida; zero consumo client-side. |
| **P0.2, P0.3, P1.2, P1.6, P1.7, P2.2–P2.5, P3.* ** | ⏳ **PRÓXIMAS ETAPAS** | Pendentes conforme cronograma abaixo. |

### 🚀 PRÓXIMAS ETAPAS IMEDIATAS (O que faremos a seguir)
1. **Fundo Padrão (Fallback) [P1.6]:** Garantir que o `BackgroundLayer` adicione um fundo cinza/padrão caso o usuário não envie imagem, resolvendo a transparência no canvas.
2. **Proteção de Rota e Rate Limiting [P0.3 / P1.7]:** Adicionar handler 404 e proteção contra sobrecarga na geração (evitar expor erro 500 do Google).
3. **Desacoplamento do Monólito [P2.3]:** Iniciar a quebra dos gigantes `server.ts` e `InputPanel.tsx` em serviços menores e componentizados.

---

## 🔒 P0 — CRÍTICO: Segurança (fazer antes de qualquer refatoração)

### P0.1 — Remover endpoint que vaza tokens ao navegador ✅ FEITO
- **Arquivo:** `server.ts` (linha ~1506)
- **Problema:** `GET /api/hf-token` retornava o `HF_TOKEN` (e chave FAL) diretamente ao cliente — quando há `.env` no deploy, o token real é exposto a qualquer visitante.
- **Correção aplicada:** rota excluída com nota de segurança no código; consumo Hugging Face/FAL permanece apenas server-side.
- **Verificação feita:** grep confirma zero referências a `hf-token` em `src/`, `api/`, `electron/`. Pendente apenas rotacionar o token caso ele tenha chegado a existir em algum deploy anterior (ver P0.2).

### P0.2 — Restringir e rotacionar chaves
- **Arquivos:** `firebase-applet-config.json`, `.env` do deploy (Vercel), `vite.config.ts`
- **Problema:** a `apiKey` do Firebase está commitada sem evidência de restrictions por domínio; `GEMINI_API_KEY` trafega por env sem rotação documentada.
- **Correção:**
  1. No console do Firebase/GCP, aplicar **HTTP referrer restrictions** à chave (somente domínios do projeto).
  2. Rotacionar `GEMINI_API_KEY` e `HF_TOKEN` após a limpeza do P0.1.
  3. Conferir que nenhuma chave nova foi commitada (adicionar `.env*` ao `.gitignore` se faltar).
- **Verificação:** acesso à API Gemini a partir de outro domínio deve falhar com 403.

### P0.3 — Rate limiting nas rotas de geração
- **Arquivo:** `server.ts` (rotas `/api/generate*`, proxy Gemini)
- **Problema:** qualquer visitante pode disparar gerações ilimitadas com a cota da sua chave Gemini.
- **Correção:** adicionar `express-rate-limit` (ex.: 10 req/min por IP) nas rotas de geração e upload.
- **Verificação:** 11ª requisição em 1 minuto retorna HTTP 429.

---

## 🐛 P1 — ALTO: Bugs funcionais confirmados na troca AGRO ↔ PET

> Testados nesta sessão. Estes são os bugs que o usuário relatou ("logos não mudam") e as causas raiz identificadas. Corrigir P1.1 é a prioridade funcional nº 1.

### P1.1 — Logo escolhida pelo tema de fundo, não pela categoria (BUG PRINCIPAL) ❌ PENDENTE
- **Arquivo (caminho correto verificado):** `src/components/SingleArtRenderer.tsx`, **linha 133**
- **Problema (confirmado no código atual):**
  ```ts
  // linha 131-133
  const scope: 'AGRO' | 'PET' =
    scopeOverride || (content.tema === 'clean-branco' || content.tema === 'azul-coagro' ? 'PET' : 'AGRO');
  const logo = logoVariant || (isLight ? 'h-azul' : 'h-mono-branca');   // ← usa isLight, ignora scope
  ```
  A variante da logo é selecionada por `isLight` (fundo claro/escuro), nunca por `scope`. Resultado: ao trocar AGRO → PET, a **logo permanece a mesma** na maioria dos templates — exatamente o bug reportado pelo usuário.
- **Correção proposta:** derivar a logo do `scope` (com `isLight` definindo apenas claro/escuro da variante dentro da marca correta):
  ```ts
  const brand = scope === 'PET' ? 'pet' : 'agro';
  const logo = logoVariant ?? (isLight ? `${brand}-azul` : `${brand}-mono-branca`);
  ```
  Ajustar conforme as variantes reais aceitas por `CoagroLogo` (`src/components/art-renderer/ArtHeader.tsx` repassa `logoVariant` direto ao componente). Verificar também as linhas 296 e 335, onde o `scope` é recalculado inline em vez de usar a variável `scope` já derivada — possível inconsistência entre preview e export.
- **Ordem obrigatória:** resolver primeiro os 4 erros TS restantes (P2.1), pois as unions `'primary'` nos templates Unified estão na mesma cadeia de props de `scope`/`logoVariant`.
- **Verificação:** alternar o switch AGRO/PET no InputPanel e conferir visualmente que a logo muda em **cada** template listado (preview + export PNG + impressão A4 + uma linha de lote Excel); nenhum caminho pode ignorar `scope`.

### P1.2 — Roteamento automático substitui templates Pet por informativos
- **Arquivo:** roteador de templates (em `SingleArtRenderer.tsx` / dispatcher usado pelo `InputPanel.tsx`)
- **Problema:** quando o item **não tem preço**, o roteador escolhe automaticamente um template "informativo" (layout pensado para AGRO), mesmo com `scope='pet'` — por isso parece que "nem cores nem logos mudam" em posts Pet sem preço.
- **Correção:** o roteamento deve considerar `scope` **além** da presença de preço: existir versão Pet dos templates informativos, ou aplicar a paleta/logo Pet independentemente do layout escolhido.
- **Verificação:** criar arte PET sem preço → deve sair com paleta e logo Pet.

### P1.3 — Templates que ignoram o escopo ao definir cores 🟡 PARCIAL (aguardando validação visual)
- **Arquivos (caminho correto verificado):** `src/components/art-renderer/templates/` — HeroCentral, SplitVertical, InformativeCentral, InformativeSplit, PetCentral, PetSplitVertical, PromoSimples foram tocados na rodada de correções desta sessão.
- **Problema:** templates com cores hardcoded por tema/`isLight` sem ler `scope`; nesses modelos, trocar AGRO → PET não altera fundo/acento.
- **Correção aplicada em parte:** ajustes de props/tipos feitos; falta ainda centralizar a resolução de paleta numa função única (ex.: `getPalette(scope, theme)` no `brand.config.ts`) e fazer **todos** os templates consumirem essa função — proibindo cores literais nos componentes de template.
- **Verificação:** busca por hex codes literais (`#[0-9a-f]{3,6}`) dentro de `src/components/art-renderer/templates/` deve retornar zero ocorrências (ou apenas via import do brand config); render manual AGRO×PET de cada template.

### P1.4 — `HeroCentral` e `SplitVertical` sem paleta Pet definida 🟡 PENDENTE VALIDAÇÃO
- **Arquivos (corrigido):** `src/components/art-renderer/templates/HeroCentral.tsx`, `src/components/art-renderer/templates/SplitVertical.tsx`
- **Problema:** esses templates só tinham paleta AGRO mapeada; com `scope='pet'` caíam em default azul/verde.
- **Status:** arquivos editados nesta rodada, mas a entrada `pet:` completa (fundos, textos, botões, faixas de preço) só é confirmada **renderizando ambos com `scope='pet'`** e comparando com PetCentral/PetSplitVertical, que já funcionam como referência.

### P1.5 — Fluxos de impressão (A4 e lote Excel) forçam tema azul
- **Arquivos:** caminho de export A4 e modo lote (`server.ts` + componente de batch/Excel)
- **Problema:** na geração de impressão/lote, o código fixa o tema azul (AGRO) independente do scope da linha/item — artes Pet saem impressas com cara de Agro.
- **Correção:** propagar `scope` de cada item do Excel/A4 até o renderer, igual ao fluxo de preview.
- **Verificação:** planilha mista (linhas AGRO + PET) → PDF/impressões devem alternar cores e logos corretamente.

### P1.6 — Rota desconhecida retorna 200 em vez de 404
- **Arquivo:** `server.ts` (fallback SPA catch-all)
- **Problema:** o catch-all do SPA intercepta `/api/*` inexistentes e devolve o HTML do index com status 200 — mascara erros de integração frontend↔backend (ex.: chamar `/api/hf-token` removido pareceria "OK").
- **Correção:** antes do fallback do index.html, responder 404 JSON para qualquer `/api/*` não roteado:
  ```ts
  app.use('/api', (req, res) => res.status(404).json({ error: 'Rota não encontrada' }));
  ```
- **Verificação:** `curl -i localhost:3000/api/nao-existe` → 404 JSON.

### P1.7 — Erro 500 vaza JSON cru do Google quando falta GEMINI_API_KEY
- **Arquivo:** `server.ts` (handler de geração)
- **Problema:** sem chave (ou com chave inválida/quota estourada), a rota explode com 500 e corpo contendo o payload interno da API Google.
- **Correção:** tratar erros da Gemini num wrapper: log completo no servidor, resposta ao cliente apenas com `{ error: 'Falha na geração. Tente novamente.', code }` e status adequado (401/429/502).
- **Verificação:** subir servidor sem `GEMINI_API_KEY` e chamar a rota de geração → mensagem amigável, sem JSON do Google.

---

## 🧱 P2 — MÉDIO: Qualidade de código e base de verificação

> ⚠️ Atualização: o `npm run lint` (tsc --noEmit) caiu de **27 → 4 erros** na rodada desta sessão, mas ainda **não passa**. Sem tsc zerado não há "rede de segurança" confiável para refatorações. Limpar os 4 tipos restantes vem antes de mexer nos monólitos e antes de aplicar o P1.1.

### P2.1 — Zerar os erros de TypeScript 🟡 PARCIAL (27 → 4)
- **Status atual (verificado):** `npx tsc --noEmit` reporta **4 erros** restantes, todos da mesma família — union `'pet' | 'primary'` atribuível a `'agro' | 'pet' | undefined`:
  - `templates/UnifiedCentral.tsx(109)` · `UnifiedCentralWithMascot.tsx(115)` · `UnifiedSplit.tsx(119)` · `UnifiedSplitWithMascot.tsx(126)`
- **Correção:** alargar o tipo de prop nos templates Unified para aceitar `'primary'` (ou mapear `'primary'` → `'agro'` na origem, no dispatcher do `SingleArtRenderer`). Definir interface única `TemplateProps { scope: 'AGRO' | 'PET'; ... }` e eliminar valores ad-hoc como `'primary'`.
- **Verificação:** `npx tsc --noEmit` sai com exit 0. **Este é o gate para iniciar P2.3 e para aplicar o P1.1 com segurança.**

### P2.2 — Pinar versões e resolver conflito esbuild ↔ vite@8
- **Arquivos:** `package.json`, `package-lock.json`, `bun.lock`
- **Problemas:**
  1. `npm install` puro **falha** por peer deps conflitantes entre `esbuild` e `vite@8`; só funciona com `--legacy-peer-deps` (mascarando o problema).
  2. `typescript@^7.0.2` (TS 7 nativo) instalado com range aberto — contagem de erros e comportamento podem mudar a cada patch.
  3. Dupla lockfile npm + bun gera drift de dependências entre desenvolvedores.
- **Correção:** alinhar versões de esbuild/vite (atualizar pacote que puxa esbuild antigo ou voltar para vite estável suportado), pinar `typescript` (ex.: `"typescript": "~5.9.x"` ou a versão TS7 exata desejada, sem caret), escolher **um** package manager (recomendado: npm) e apagar `bun.lock`.
- **Verificação:** `rm -rf node_modules package-lock.json && npm install` termina sem flags e sem erros; `npm run build` OK.

### P2.3 — Quebrar os monólitos `server.ts` e `InputPanel.tsx`
- **Arquivos:** `server.ts` (≈1.605 linhas), `src/components/InputPanel.tsx` (≈1.915 linhas)
- **Problema:** tudo junto = alto risco de regressão em qualquer mudança (inclusive nas correções P1 acima).
- **Correção (em etapas pequenas e reversíveis, uma por commit):**
  - `server.ts` → separar em `routes/generate.ts`, `routes/batch.ts`, `services/gemini.ts`, `services/prompts.ts`, `middleware/rateLimit.ts`.
  - `InputPanel.tsx` → extrair subcomponentes por seção (campos de produto, switch de categoria, grid de templates, ações de export) e um hook `useArtworkForm()`.
- **Verificação:** após **cada** etapa: `tsc --noEmit` + `npm run build` + smoke test manual (preview, troca AGRO/PET, export PNG). Fazer P2.1 primeiro para ter o tsc como guarda.

### P2.4 — Rede de segurança com testes automatizados
- **Arquivos:** pasta `tests/` existente (`test-regex.mjs`, `ai-copy-audit.mjs`)
- **Problema:** só existem scripts ad-hoc; `ai-copy-audit.mjs` aprovou apenas 3/20 casos — os prompts de IA estão regredindo sem alarme.
- **Correção:**
  1. Adotar Vitest (já é vizinho natural do Vite).
  2. Cobrir primeiro: parser BRL/parcelas (`test-regex` atual vira teste real), roteador de templates por `scope` (casos do P1), resolução de paleta `getPalette(scope)`.
  3. Tratar os 17 casos reprovados do `ai-copy-audit` como backlog de prompts (documentar critérios de aceite no `AUDITORIA_INSTRUCOES_IA.md`).
- **Verificação:** `npm test` verde no CI/local antes de cada release.

### P2.5 — ESLint + Prettier
- **Problema:** "lint" do projeto é só `tsc --noEmit`; nada pega código morto, imports não usados, hooks mal-comportados.
- **Correção:** instalar `eslint` (+ `eslint-plugin-react-hooks`) e `prettier`; script `npm run lint` passa a rodar eslint **e** tsc.
- **Verificação:** `npm run lint` falha intencionalmente ao introduzir variável não usada.

---

## 🗂 P3 — BAIXO: Higiene de projeto e DX

### P3.1 — Renomear pastas/arquivos com espaços e parênteses
- **Alvos:** `coagro-agro-studio (2)`, `IDEIAS DE MODELOS`, `SKILL (1).md`, `Troca_de_Precos_Onda2.xlsx`
- **Problema:** espaços/parênteses quebram scripts shell, URLs e CI.
- **Correção:** renomear para kebab-case (`coagro-agro-studio`, `ideias-de-modelos/`, `skill.md`); atualizar referências no código (buscar nome antigo antes de mover). **Fazer com todos os commits limpos — é facilmente reversível via git.**
- **Verificação:** `grep -r "IDEIAS DE MODELOS\|(2)" src server.ts electron api` sem resultados; build OK.

### P3.2 — README real
- **Problema:** `README.md` ainda contém texto genérico do AI Studio.
- **Correção:** documentar: o que é o produto, como rodar (incluindo `npm install` pós-P2.2, sem flags), variáveis de ambiente necessárias (`GEMINI_API_KEY`, `HF_TOKEN`), fluxo AGRO/PET e limitações conhecidas.
- **Verificação:** novo desenvolvedor consegue subir o app seguindo só o README.

### P3.3 — Unificar caminhos dev / Vercel / Electron
- **Arquivos:** `vite.config.ts` (proxy), `vercel.json`, `electron/`, chamadas `fetch('/api/...')` no `src/`
- **Problema:** três modos de descobrir a URL da API coexistem; mudanças de rota precisam ser feitas em 3 lugares.
- **Correção:** criar `src/lib/apiBase.ts` com resolução única (relativo no web, absoluto no Electron) e um contrato de rotas compartilhado com o servidor.
- **Verificação:** rodar os 3 modos (dev, preview+vercel.json local, Electron) e gerar uma arte em cada.

### P3.4 — Centralizar marca em `brand.config.ts`
- **Problema:** logos, fontes e cores estão espalhados pelos templates (causa direta dos P1.3/P1.4).
- **Correção:** `brand.config.ts` exporta `{ agro: { palette, logos, fontes }, pet: {...} }`; templates só consomem via `getPalette(scope)`/`getLogos(scope)` (mesma API criada no P1.3/P1.4).
- **Verificação:** trocar uma cor da marca Pet em **um único arquivo** reflete em todos os templates.

### P3.5 — Aviso de chunk grande + validação de export para impressão
- **Problemas:** build avisa chunk `index.js` 1,4 MB (gzip 439 kB); exports de impressão não validam DPI/sangria.
- **Correção:** `manualChunks` no vite (separar react/firebase/xlsx); validar/resample para 300 DPI com sangria de 3 mm nos exports A4.
- **Verificação:** aviso do build desaparece ou cai abaixo de 500 kB por chunk; abrir PNG exportado mostra dimensão correta em cm.

---

## ✅ ORDEM DE EXECUÇÃO RECOMENDADA (atualizada pós-rodada)

| # | Item | Status | Risco de quebrar | Gate de saída |
|---|------|--------|------------------|---------------|
| 1 | P0.1 (remover `/api/hf-token`) | ✅ Concluído | — | Zero referências a `hf-token` no cliente ✔ |
| 2 | P2.1 — zerar os **4 erros TS restantes** (unions `'primary'` nos Unified*) | 🟡 Próxima ação | Baixo (só tipos) | `tsc --noEmit` exit 0 ← **gate para P1.1 e P2.3** |
| 3 | P1.1 (logo derivada de `scope` na linha 133 do SingleArtRenderer) + P1.2 (roteamento Pet sem preço) | ❌ Pendente | Baixo-médio | Switch AGRO/PET troca logo em 100% dos templates, nos 4 fluxos (preview/export/A4/lote) |
| 4 | P1.3–P1.5 (centralizar `getPalette(scope)`; validar paletas Pet já editadas; impressão/lote) | 🟡 Parcial | Baixo | Todos os templates com cores Pet corretas; grep de hex literal vazio |
| 5 | P1.6–P1.7 (404 JSON de `/api/*`, erros amigáveis sem vazar payload Google) | ❌ Pendente | Baixo | curl testa os dois casos |
| 6 | P0.2–P0.3 (restrictions/rotação de chaves, rate limit) | ❌ Pendente | Baixo (config externa + middleware) | 11ª req/min → 429; chave restrita por domínio |
| 7 | P2.2 (deps/lockfiles: esbuild↔vite@8, pinar TS, um package manager) | ❌ Pendente | Médio (pode mudar build) | `npm install` sem flags + build OK |
| 8 | P2.4–P2.5 (Vitest + ESLint) | ❌ Pendente | Baixo | `npm test` e `npm run lint` verdes |
| 9 | P2.3 (quebrar monólitos server.ts / InputPanel.tsx) | ❌ Pendente | **Alto — só depois dos gates 2, 7 e 8** | Smoke test manual por etapa |
| 10 | P3.1–P3.5 (higiene/DX) | ❌ Pendente | Baixo-médio | Build + 3 modos de execução OK |

**Regras gerais de segurança para todas as etapas:**
- Um item por commit/branch; `git revert` como plano de rollback.
- Antes de cada commit: `tsc --noEmit` + `npm run build` + checklist manual rápido (preview, troca AGRO/PET, export PNG, uma linha de lote Excel).
- Nunca misturar P2.3 (refatoração estrutural) com correções P1 (comportamentais) no mesmo commit.
- ⚠️ A rodada atual deixou alterações **staged não commitadas** em 18 arquivos (server.ts, App.tsx, 9 templates, SingleArtRenderer-related, imageTransparency, tests/out). Antes de qualquer nova mudança, faça commit ou branch de proteção dessa base.

**Próximo passo sugerido:** corrigir os 4 erros TS da família `'primary'` (etapa 2), aplicar o P1.1 (linha 133) e então rodar a validação visual AGRO×PET template por template.
