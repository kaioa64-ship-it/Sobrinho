# Auditoria de Instruções da IA — Coagro Studio

Gerado em 03/10/2026. Fonte única da verdade: `server.ts`.

## 1. Onde as diretrizes da IA vivem

Arquivo: `coagro-agro-studio (2)/server.ts`

| Componente | Função | Referência (buscar por) |
|---|---|---|
| `AGRO_SYSTEM_INSTRUCTION` | System prompt modo Agro (contexto PET vs AGRO, preço, layout, copy) | `const AGRO_SYSTEM_INSTRUCTION` |
| `PET_SYSTEM_INSTRUCTION` | System prompt modo Pet | `const PET_SYSTEM_INSTRUCTION` |
| `TONE_MATRIX` | Matriz de tom: Agro / Agro-Misto / Pet + palavras proibidas | `const TONE_MATRIX` |
| `OUTPUT_SCHEMA` | Schema JSON obrigatório de saída (sem ele a IA era ignorada) | `const OUTPUT_SCHEMA` |
| `instruction` (ETAPA 1 / ETAPA 2) | Prompt do usuário por requisição: análise de preço e geração de campos | `DIRETRIZ MESTRE DE GERAÇÃO` |
| `analyzeAgroDescriptionServer` | Pré-análise heurística: marca, modelo, categoria, layout, subtítulo/título de fallback | função homônima |
| `generateHeuristicAgroContent` | Fallback offline quando a API falha (402/429/404) | função homônima |
| Pós-processamento | Limpeza de título (≤4 palavras), subtítulo, 3 bullets ≤5 palavras, guarda anti-linguagem-de-campo em produto pet | após `stripNoise` |
| Config do modelo | `gemini-3.8-flash`, temperature 0.15, `responseMimeType: application/json`, retry 503/429 | `ai.models.generateContent` |

Chave da API: `.env` (`GEMINI_API_KEY`).

## 2. Regras vigentes

**Título:** CAIXA ALTA, máx. 4 palavras. Pode (e deve) citar marca/produto. Se pet: proibido `campo|lavoura|produtividade|rural|safra|pasto`.
**Subtítulo:** se título genérico → nome do produto + descrição; se título já nomeia o produto → benefício/aplicação.
**Diferenciais:** exatamente 3, ≤5 palavras, sem inventar.
**Preço:** maior = `valor_de`, menor = `valor_por`; specs (kg, HP, V) nunca são preço; sem vírgula = `,00`.
**Tom:** definido pela imagem + texto, nunca pelo modo do app (ver `TONE_MATRIX`).

## 3. Bugs raiz encontrados (corrigidos)

1. Categoria padrão `Equipamentos` → todo produto desconhecido (inclusive pet) recebia o subtítulo "Alta potência e eficiência no campo". Agora o padrão é `Outros` com subtítulo vazio, e existem categorias `Pet - *`.
2. Pós-processamento sobrescrevia o subtítulo da IA sempre que ele não continha o nome base do produto. Agora só substitui se vazio, genérico ou com linguagem de campo em produto pet.
3. Ao reescrever o prompt, o schema de saída foi removido e a IA devolvia chaves desconhecidas, caindo no fallback. `OUTPUT_SCHEMA` restaurado.
4. Chave Gemini sem crédito (402) acionava o fallback heurístico silenciosamente.

## 4. Método de teste (modelo)

Script: `tests/ai-copy-audit.mjs` — `node tests/ai-copy-audit.mjs` com o servidor em `localhost:3000`.
Saída: `tests/out/ai-copy-audit.md` e `.json`.

- 20 casos: 10 pet em loja Agro, 8 agro puro, 2 misto.
- Critérios por caso: título ≤4 palavras, subtítulo presente, 3 diferenciais ≤5 palavras, preço extraído, produto citado, **PET sem linguagem de campo**, **AGRO sem linguagem pet**.
- Para adicionar caso novo: incluir objeto em `CASES` (`id`, `dom`, `nome`, `txt`).
- Limitação: usa imagem 1x1; valida copy a partir do texto. Fotos reais seguem sendo validadas na UI.

## 5. Padrões por categoria

| Categoria | Tom | Título modelo | Subtítulo modelo |
|---|---|---|---|
| Máquinas / ferramentas | Agro | `OFERTA TRITURADOR TR30` | Corte e trituração de alta rotação |
| Sementes / fertilizantes | Agro | `OFERTA SEMENTE MARANDU` | Pastagem densa e vigorosa |
| Vacina / sanidade | Misto | `PROTEÇÃO PARA O REBANHO` | Vacina contra raiva dos herbívoros |
| Casa & Jardim | Misto | `OFERTA JARDIM` | Praticidade para casa e jardim |
| Antiparasitário / ração / acessório | Pet | `PROTEÇÃO COMPLETA NEXGARD` | Tablete mastigável para cães de 4 a 10kg |
