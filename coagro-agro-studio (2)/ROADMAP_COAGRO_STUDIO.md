# 🗺️ Roadmap & Arquitetura Oficial: Coagro Studio

> **Diretriz Mestre:** O Coagro Studio é uma ferramenta focada em **resolver os gargalos operacionais internos do Grupo Coagro**, entregando autonomia de criação para lojas e setores com máxima estabilidade e simplicidade. Este documento estabelece as fronteiras do sistema para evitar dispersão de escopo (*efeito Frankenstein*), mapeia o estado real da aplicação e traça a trilha de evolução.

---

## 🎯 1. Visão, Fronteiras & Filosofia do Projeto

* **Onde o projeto começa:** Na necessidade da loja de anunciar um produto — entrada manual rápida ou importação de planilha de preços do ERP.
* **Onde o projeto termina:** Na entrega de um arquivo final de alta qualidade visual, 100% no padrão da marca, pronto para postagem (PNG) ou impressão física imediata (PDF A4).
* **Onde o projeto quer chegar:** Em um motor visual padronizado, resiliente (funciona online e offline), modular e preparado para evoluir para uma engine *white-label* (multi-filiais e multi-marcas).
* **Regra Anti-Frankenstein:** Nenhuma funcionalidade complexa (IA generativa pesada, vídeo, integrações externas) será liberada para os operadores antes que o fluxo essencial (manual + lote de cartazes + exportação limpa) esteja 100% estável e à prova de falhas.

---

## 🧭 2. Raio-X da Aplicação Atual (Estado Real — v1.0.1)

A aplicação está dividida em dois grandes módulos operacionais com suporte nativo a dois escopos de negócio (**Coagro Agro** e **Coagro Pet**):

### 📱 Módulo A: Redes Sociais (Feed & Stories)
| Funcionalidade | Estado | Descrição Técnica |
|---|---|---|
| **Editor Manual (`SocialManualEditor`)** | ✅ Ativo (Padrão) | Permite preenchimento direto de título, subtítulo, preços (DE / POR), diferenciais em tópicos, pílulas de CTA e seletor de tema/selo. |
| **Recorte de Imagem Client-side** | ✅ Ativo | Algoritmo em canvas (`imageTransparency.ts`) com remoção de fundo branco e detecção de contraste sem depender de API externa. |
| **Template Status Zap 9:16 (`WhatsappStatusVertical`)** | ✅ Ativo (Destaque) | Template focado em WhatsApp/Helena CRM com ícone oficial SVG, DE/POR monumental, degradês oficiais (Agro, Verde-Azul e Pet) e selo condicional. |
| **Template Promo Simples (`PromoSimples`)** | ✅ Ativo | Varejo rápido com tipografia monumental de preço DE/POR e compatibilidade com fotos sem recorte. |
| **Formatos de Canvas** | ✅ Ativo | Feed Quadrado (1:1), Feed Retrato (4:5) e Stories/Status (9:16). |
| **Biblioteca de Templates** | ✅ Ativo | Templates unificados e dedicados: `UnifiedCentral`, `UnifiedSplit`, `WhatsappStatusVertical`, `PromoSimples`, `PromoAgroA4`, `PromoPetA4`. |
| **Alternância Agro / Pet** | ✅ Ativo | Gerido via Zustand e `brand.config.ts`. Troca a quente sem vazamento de cores ou logos. |
| **Contraste Inteligente & Regras de Marca** | ✅ Ativo | Fundo claro proíbe terminantemente logo branca. Pet proíbe verde Agro. |
| **Matriz de Testes E2E** | ✅ Ativo | 15 cenários reais auditados via Chrome Headless CDP (`run-matrix-visual-tests.mjs`). |

---

### 🏷️ Módulo B: Cartazes de Loja (Encartes Físicos A4)
| Funcionalidade | Estado | Descrição Técnica |
|---|---|---|
| **Criação Individual (`PosterManualEditor`)** | ✅ Ativo | Entrada de Código/SKU, Título em caixa alta, Preço DE / POR e seletor de cabeçalho de destaque. |
| **Cabeçalhos de Destaque** | ✅ Ativo | Seleção rápida: *OFERTA, LIQUIDAÇÃO, PROMOÇÃO, SUPER PREÇO, ESPECIAL, NOVIDADE, PREÇO BAIXO*. |
| **Templates A4 Físicos** | ✅ Ativo | 3 opções operacionais: **Econômico P&B** (`promo-mono-a4`), **Tema Verde Agro** (`promo-agro-a4`) e **Tema Azul Pet** (`promo-pet-a4`). |
| **Processamento em Lote (`ExcelBatchUploader`)** | ✅ Ativo | Leitura direta de planilhas Excel (`.xlsx`/`.xls`) ou `.csv`, com detecção inteligente de colunas de código, produto e preços. |
| **Higienização de ERP & NFe** | ✅ Ativo | Tradução automática de abreviações técnicas (`erpSanitizer.ts`). |
| **Cache Local IndexedDB por SKU** | ✅ Ativo | Busca instantânea em 0ms (`productStorage.ts`). |
| **Exportação A4 (PNG & PDF)** | ✅ Ativo | Download de cartazes individuais em PNG ou geração de PDF A4 exato (210x297mm) via `jsPDF`. |

---

## ⏸️ 3. O que Está Pausado / Oculto no MVP (Com Justificativa)

Para garantir estabilidade e focar no que agrega valor imediato à ponta, certos recursos foram conscientemente pausados ou ocultos no código:

1. **🤖 Geração Automática por IA na UI (`socialMode === 'AI_BETA'`):**
   * *Status:* **Congelado / Oculto no Frontend** (`false &&` em `src/App.tsx`).
   * *Diretriz Operacional do Kaio:* A IA é um diferencial futuro que só será reabilitado quando os templates estiverem 100% validados e integrados a um banco estruturado de packshots por código de produto. A interface não deve prometer IA prematuramente na rotina manual da loja.
   * *Solução futura (Fase 4):* Motor de auto-preenchimento por catálogo vinculado a ERP ou modelo multimodal local.

2. **🎭 Mascotes da Marca:**
   * *Status:* **Pausado / Desabilitado**.
   * *Motivo:* Os componentes `UnifiedCentralWithMascot` e `UnifiedSplitWithMascot` tentavam encaixar os personagens no mesmo grid genérico dos produtos. Isso gerava deformação de proporção e conflito de hierarquia visual.
   * *Solução futura:* Serão reativados apenas em **templates exclusivos**, desenhados especificamente para a narrativa do mascote.

3. **🔍 Tela de Conferência/Revisão em Grade (`posterMode === 'REVIEW'`):**
   * *Status:* **Oculto no Frontend** (`false &&` em `src/App.tsx`).
   * *Motivo:* O componente `BatchReviewGrid.tsx` acumulava muitas responsabilidades e complexidade visual. O fluxo direto de lote (importar planilha -> selecionar modelo -> baixar) atende a loja com maior rapidez.

4. **🌄 Fundo Fotográfico por Prompt IA:**
   * *Status:* **Oculto no Frontend** (`false &&` em `src/App.tsx`).
   * *Motivo:* Fundos gerados por IA frequentemente poluíam o cartaz e prejudicavam a legibilidade das especificações técnicas do produto.

5. **☁️ Auto-save no Google Drive / Firebase:**
   * *Status:* **Inativo / Silencioso** (`triggerDriveAutoSave`).
   * *Motivo:* Exige autenticação OAuth nas máquinas das filiais, o que cria fricção para o operador de loja. O fluxo deve ser 100% local e direto.

---

## 📦 4. O que Foi Incrementado Recentemente

* **Arquitetura Multi-Tenant com Zustand:** Separação limpa dos escopos Agro e Pet em `src/config/tenant.config.json` e `src/store/tenantStore.ts`, garantindo que cores e marcas não se misturem.
* **Auditoria de Diretrizes de IA & Vocabulário:** Criação da matriz de tom em `server.ts` e documentação em `AUDITORIA_INSTRUCOES_IA.md` (bloqueio estrito de termos rurais no modo Pet e vice-versa).
* **Motor de Fallback Heurístico:** Criação de `server/services/heuristic.ts` para permitir geração de copys e regras mesmo na ausência de resposta da API do Gemini.
* **Tratamento e Normalização Monetária:** Implementação de `priceParser.ts` e `priceFormatter.ts` para tratar formatos brasileiros de moeda (`R$ 1.250,00`).
* **Blindagem de Repositório:** Configuração do repositório como Privado no GitHub e padronização do `README.md`.

---

## 🔨 5. O que Está no Meio do Desenvolvimento (WIP)

1. **Operação Híbrida 100% Offline:**
   * O Modo Manual já funciona sem internet para diagramação, mas os fluxos de build e dependências de fontes/assets externos ainda precisam de blindagem total para rodar mesmo se o sinal da loja cair completamente.
2. **Correção de Bugs Críticos de Renderização (Prioridade Imediata):**
   * **Persistência do Fundo Recortado:** Ao trocar repetidamente de template ou tema de cor, o canvas por vezes reexibe o fundo original não recortado.
   * **Alternância de Escopo sem Template:** Ao alternar de Agro para Pet sem um template explicitamente marcado, o layout por vezes carrega vazio ou desalinhado.
3. **Calibração de Layouts de Impressão:**
   * Ajuste fino das margens dos cartazes A4 para garantir que impressoras comuns de loja não cortem o cabeçalho nem o rodapé promocional.

---

## 🧹 6. Plano de Limpeza e Organização Estrutural (Anti-Frankenstein)

A aplicação cresceu rápido e acumulou dívida técnica que precisa ser saneada antes da adição de novos recursos:

### A. Modularização de Componentes Gigantes
* `InputPanel.tsx` possui ~1.900 linhas contendo formulários, chamadas de API, seletores visuais e regras de recorte. **Ação:** Dividir em subcomponentes atômicos (`ProductForm`, `PricingForm`, `TemplateSelector`, `ImageUploader`).
* `BatchReviewGrid.tsx` possui ~1.000 linhas de código atualmente oculto. **Ação:** Limpar ou arquivar em módulo separado de auditoria.

### B. Limpeza de Código Morto e Resíduos
* Expurgo de bibliotecas e funções não utilizadas herdadas de templates genéricos do Google/Vite.
* Remoção de referências a estilos legados (ex: tema `'branco'` solto sem tipagem).

### C. Unificação e Tipagem Estrita
* Centralização dos tipos de templates, temas e layouts em `src/types/agro.ts`.
* Garantir que `tenant.config.json` seja a única fonte da verdade para variáveis de cor e marca.

---

## 🚀 7. Próximos Passos Sugeridos (Trilha por Fases)

```mermaid
graph TD
    A["Fase 1: Limpeza & Bugs (Imediato)"] --> B["Fase 2: Autonomia em Loja (Curto Prazo)"]
    B --> C["Fase 3: Mascotes com Propósito (Médio Prazo)"]
    C --> D["Fase 4: Core White-Label & SaaS (Longo Prazo)"]
```

### 🔴 FASE 1: Limpeza, Estabilização e Correção de Bugs (Imediato)
1. **Saneamento do Bug de Recorte:** Garantir que o estado `cutoutImage` não seja sobrescrito na troca de temas ou paletas.
2. **Tratamento na Troca Agro <-> Pet:** Forçar seleção defensiva de template padrão seguro (`resolveDefaultTemplate`) ao alternar de aba.
3. **Refatoração dos componentes inflados:** Quebrar `InputPanel.tsx` e `SocialManualEditor.tsx` em partes limpas e de fácil manutenção.
4. **Verificação de Build Offline:** Testar o executável Electron desconectado da internet para validar funcionamento 100% autônomo do modo manual.

### 🟡 FASE 2: Refinamento de Operação em Loja (Curto Prazo)
1. **Cache Local de Fotos por SKU (IndexedDB):** Permitir que o operador digite o código do produto e o sistema busque automaticamente o recorte já processado anteriormente.
2. **Higienização de Siglas de ERP:** Dicionário interno para traduzir códigos e nomes abreviados de notas/planilhas em nomes comerciais limpos para os cartazes.
3. **Templates Verticais de WhatsApp:** Criação de artes com leitura rápida e botões de chamada focados no atendimento via WhatsApp / Helena CRM.

### 🟢 FASE 3: Reintrodução dos Mascotes com Propósito (Médio Prazo)
1. **Templates Exclusivos para Mascotes:** Criar de 2 a 3 layouts desenhados em torno do mascote (com balões de fala de ofertas, selos comemorativos e proporção ajustada), sem forçá-los nos grids genéricos de produto.
2. **Módulo de RH e Endomarketing:** Aba independente para comunicados internos, aniversariantes do mês e boas-vindas da equipe Coagro.

### 🔵 FASE 4: Modularização White-Label & Expansão (Longo Prazo)
1. **Core Desacoplado ("Sobrinho Studio"):** Motor genérico alimentado por arquivos de configuração de marca, permitindo uso pela Coagro ou por novas operações e empresas.
2. **Plataforma Web SaaS:** Migração para modelo Web robusto com controle de filiais e cotas.
3. **Multimídia & Vídeo Programático:** Geração de cartazes animados e carrosséis para Instagram via React Remotion.

---

*Documento mantido pela equipe de Desenvolvimento & Operações do Grupo Coagro.*
*Versão do Roadmap: 2.0.0 — Outubro/2026*

