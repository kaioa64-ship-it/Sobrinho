# 🗺️ Roadmap e Backlog: Coagro Studio (Visão de Futuro)

Este documento centraliza todas as discussões, ideias e funcionalidades para consolidar o **Coagro Studio** como a ferramenta definitiva de autonomia das filiais e setores.

---

## 1. 🐞 Correções de Bugs (Prioridade Imediata - v1.0.1)
- **Bug de Fundo Transparente:** Ao trocar repetidamente de template ou cor, o fundo recortado da imagem às vezes falha e o fundo original reaparece. Corrigir a persistência do estado da imagem recortada.
- **Bug de Troca de Escopo (Agro <-> Pet):** Quando ocorre a troca do modo Agro para Pet sem nenhum template selecionado previamente, a tela renderiza um template "quebrado". Forçar a seleção de um template padrão seguro na troca de contexto.
- **Repositório GitHub:** Atualizar a descrição genérica e o `README` no GitHub (que ainda cita o projeto base do Google) para a descrição oficial do "Coagro Studio".
- **Privacidade do Código:** Alterar o repositório de **Público para Privado** (Configurações do repositório no Github > Danger Zone > Change visibility). O sistema carrega lógicas de negócios, margens e identidades visuais exclusivas do Grupo Coagro que não devem ficar expostas na web.

## 2. 🧠 Visão Computacional Local & Modo Desenvolvedor
A API do Gemini em nuvem se provou financeiramente inviável para alto volume de testes (ex: quase R$ 3,00 em 20 requisições). O plano de contenção é:
- **Script Python Local (Visão Computacional):** Desenvolver um script Python local/embarcado que receba a imagem, analise via modelos locais ou técnicas de visão computacional leves, e retorne um JSON enxuto e barato com as informações necessárias da imagem, sem consumir tokens caros da nuvem.
- **Ambiente de Desenvolvimento (Dev Mode):** Criar uma estrutura de variáveis de ambiente (`.env` ou chave oculta na UI) para separar o que está em "Produção" do que está em "Desenvolvimento". As funções incompletas ou em teste só aparecerão ativas se o aplicativo for rodado em Modo Dev.

## 3. 🖼️ Banco de Imagens & Cache Inteligente
- **Cache Local de Recortes**: Sistema que vincula o Código do Produto (SKU) a um servidor interno. Se o usuário digitar "12345", a ferramenta já busca o recorte salvo, sem precisar processar o fundo novamente.
- **Upload e Vínculo via Planilha**: Na importação do Excel, cruzar os códigos com o banco interno para gerar encartes automáticos com foto.

## 4. 📱 Novos Módulos: "Agência de Bolso" (Vendedores)
- **Revisão de Formatos:** Polir e revisar todos os layouts de Feed para garantir encaixe perfeito nas proporções Quadrado (1:1) e Retrato (4:5).
- **Templates de WhatsApp:** Criar artes específicas para envio em massa e status do WhatsApp, otimizadas para leitura rápida pelo celular.
- **Helena CRM (Análise de Demanda):** Conectar a IA com a API do Helena CRM para analisar os logs de conversas diárias. O sistema vai cruzar os dados de atendimento e sugerir automaticamente quais produtos ou ofertas devem ser criados com base no que os clientes mais procuraram no dia.

## 5. 🧹 Higienização de Planilhas e Dados
- **Normalizador de Nomes**: Serviço interno (Dicionário ou heurística) para traduzir o "tecniquês" do caixa (`RAC GOLD SP FRNG 15KG`) para o nome limpo (`Ração Golden Special Frango 15kg`) ao importar listas de preços.

## 6. 👥 Módulo: RH & Endomarketing (DP)
O marketing não deve ser um gargalo para a comunicação interna. Criação de uma aba totalmente separada com:
- 📧 **Assinaturas de E-mail.**
- 🎂 **Aniversariantes do Mês.**
- 👋 **Boas-vindas (Novo Colaborador).**
- 🏖️ **Avisos de Férias, Feriados e Fechamentos.**
- ⚠️ **Comunicados Internos e Desligamentos.**

---
*Status Atual: v1.0 (Produção)* | *Próximo Ciclo: v1.1*
