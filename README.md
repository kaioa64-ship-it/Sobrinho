# 🌱 Coagro Studio

**Coagro Studio** é o gerador oficial de peças visuais, cartazes de preço e ofertas de mídias sociais para as filiais do Grupo Coagro. A plataforma tem o objetivo de conceder autonomia aos vendedores e gerentes, reduzindo o fluxo de dependência do time de Marketing para peças padronizadas.

O sistema funciona em duas vertentes:
- **Redes Sociais (Feed/Story):** Geração de arte para plataformas digitais, com integração à Inteligência Artificial e heurísticas locais.
- **Cartazes de Loja (A4):** Geração e impressão individual ou em lote (via Excel) de cartazes para preços físicos nas gôndolas e frentes de loja.

> **Uso Interno:** Este projeto contém regras de negócios exclusivas, lógicas de precificação e identidade institucional do Grupo Coagro.

## Instalação e Execução (Desenvolvimento)

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Adicione suas chaves no `.env` (ex: `GEMINI_API_KEY`).
3. Rode o ambiente de desenvolvimento local:
   ```bash
   npm run dev
   ```

## Empacotamento Desktop (Windows)

Para empacotar a versão final para distribuição nas lojas (instalador offline):
```bash
npm run build:electron
```
Isso gerará o executável (`Coagro Studio Setup X.Y.Z.exe`) na pasta `dist_electron`.
