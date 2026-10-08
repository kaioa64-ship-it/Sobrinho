# 🗺️ Roadmap e Backlog: Coagro Studio (Visão de Futuro)

Este documento centraliza todas as discussões, ideias e funcionalidades para consolidar o **Coagro Studio** como a ferramenta definitiva de autonomia das filiais e setores.

---

## 1. 🐞 Correções de Bugs (Prioridade Imediata - v1.0.1)
- **Bug de Fundo Transparente:** Ao trocar repetidamente de template ou cor, o fundo recortado da imagem às vezes falha e o fundo original reaparece. Corrigir a persistência do estado da imagem recortada.
- **Bug de Troca de Escopo (Agro <-> Pet):** Quando ocorre a troca do modo Agro para Pet sem nenhum template selecionado previamente, a tela renderiza um template "quebrado". Forçar a seleção de um template padrão seguro na troca de contexto.
- **Repositório GitHub:** Atualizar a descrição genérica e o `README` no GitHub (que ainda cita o projeto base do Google) para a descrição oficial do "Coagro Studio". (FEITO ✅)
- **Privacidade do Código:** Alterar o repositório de **Público para Privado**. O sistema carrega lógicas exclusivas do Grupo Coagro que não devem ficar expostas. (FEITO ✅)

## 2. 🧠 Visão Computacional Local & Modo Desenvolvedor
A API do Gemini em nuvem se provou financeiramente inviável para alto volume de testes.
- **Script Python Local (Visão Computacional):** Desenvolver um script Python embarcado que receba a imagem, analise via modelos locais ou técnicas de visão computacional leves, e retorne um JSON simples e barato, sem consumir tokens da nuvem.
- **Ambiente de Desenvolvimento (Dev Mode):** Criar uma estrutura de variáveis de ambiente (`.env` ou configuração JSON) para separar o que está em "Produção" (estável) do que está em "Desenvolvimento" (testes com botões de IA e ferramentas incompletas).

## 3. 🖼️ Banco de Imagens & Cache Inteligente
- **Cache Local de Recortes**: Sistema que vincula o Código do Produto (SKU) a um banco interno. Se o usuário digitar "12345", a ferramenta já busca o recorte previamente processado.
- **Upload e Vínculo via Planilha**: Na importação do Excel, cruzar os códigos com o banco interno para gerar encartes automáticos com foto.

## 4. 📱 Novos Módulos: "Agência de Bolso" (Vendedores)
- **Revisão de Formatos:** Polir todos os layouts de Feed para garantir encaixe perfeito nas proporções Quadrado (1:1) e Retrato (4:5).
- **Templates de WhatsApp:** Artes específicas para envio direto via WhatsApp, otimizadas para tela vertical e leitura dinâmica.
- **Helena CRM (Análise de Demanda):** Conectar a API do Helena CRM para cruzar os dados de atendimento e sugerir diariamente quais produtos devem entrar em oferta (Baseado em inteligência de demanda).

## 5. 🧹 Higienização de Planilhas e Dados
- **Normalizador de Nomes**: Serviço interno (Heurística/Dicionário) para traduzir o nome do sistema (`RAC GOLD SP FRNG 15KG`) para o nome legível (`Ração Golden Special Frango 15kg`) ao importar listas.

## 6. 👥 Módulo: RH & Endomarketing (DP)
Criação de uma aba totalmente separada com:
- 📧 **Assinaturas de E-mail.**
- 🎂 **Aniversariantes do Mês.**
- 👋 **Boas-vindas (Novo Colaborador).**
- 🏖️ **Avisos de Férias e Feriados.**
- ⚠️ **Comunicados Internos e Desligamentos.**

---

# 🚀 Visão Comercial de Longo Prazo (Transformação em Produto)

As etapas abaixo delineiam o plano para transformar a engine criada no "Coagro Studio" em um produto escalável e comercializável para outras empresas e agências.

## 7. 🏗️ Separação de Arquitetura: Core Engine (White-label)
O projeto deixará de ser *hardcoded* para a Coagro e se tornará um motor genérico de geração visual.
- **Parametrização de Marca:** Remoção de logos, paletas de cores e fontes fixas no código-fonte principal. Tudo será gerido através de um painel de "Tema" ou arquivo de configuração (`brand-config.json`).
- **Escalabilidade Multi-Empresa:** O núcleo se tornará o "Sobrinho Studio" (Engine). A aplicação da Coagro consumirá essa Engine com as cores verde/ouro. Se precisarmos aplicar para "Hotel Íbis" ou "Protege Alimentos", basta carregar o painel com as cores deles.

## 8. 💸 Modelo de Negócios (SaaS)
- **Plataforma 100% Online (Web App SaaS):** Avaliar a migração definitiva para Web (Vercel/AWS) em detrimento do executável `.exe`, o que facilita atualizações contínuas sem precisar re-instalar o programa nas máquinas das lojas.
- **Monetização e Planos:** Criação de um funil de aquisição de clientes com modelo de assinatura (ex: Trial de 5 a 7 dias, plano base de R$49,00/mês + acréscimo por filial extra).
- **Gestão de Cotas:** O uso da Visão Computacional ou IA será cobrado e barrado pelo plano do usuário para que o custo de servidor nunca ultrapasse o valor da assinatura.

## 9. 🎞️ Evolução Multimídia: Vídeos e Animações
O gerador evoluirá de imagens estáticas (PNG/PDF) para formatos ricos de publicidade:
- **Geração de Carrosséis:** Módulo para criação automática de sequências conectadas para Instagram, quebrando listas complexas de ofertas em múltiplas telas.
- **Exportação em Vídeo (React Remotion / HTML Animado):** Utilizar bibliotecas de animação programática baseadas em React (como o **Remotion** ou motores CSS puros) para dar vida aos cards. O usuário subirá a foto do produto, e o sistema renderizará e baixará um `.mp4` dinâmico do cartaz piscando o preço ou animando o selo promocional.

---
*Status Atual: v1.0 (MVP Produção)* | *Visão Estratégica Documentada.*
