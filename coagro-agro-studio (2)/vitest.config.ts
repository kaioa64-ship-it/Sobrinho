import { defineConfig } from 'vitest/config';

/**
 * Configuração da suíte de testes.
 *
 * Deliberadamente NÃO reutiliza o `vite.config.ts` da aplicação: aquele arquivo
 * carrega os plugins de React e Tailwind, desnecessários para testar regra pura
 * (e que só deixariam a suíte mais lenta). Aqui os specs rodam em Node.
 *
 * Escopo desta suíte: funções puras de negócio (marca/escopo, roteamento de
 * template e moeda). Testes de componente/React exigiriam `jsdom` e
 * `@testing-library/react` — ficam para uma etapa seguinte.
 *
 * Ver CORRECOES_REALIZADAS.md e ROADMAP_COAGRO_STUDIO.md (Fase 1/2).
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
  },
});
