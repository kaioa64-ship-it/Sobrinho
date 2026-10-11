import { describe, it, expect } from 'vitest';
import { releaseCanvas } from '../../src/lib/imageTransparency';
import { EMPTY_AGRO_CONTENT, EMPTY_PET_CONTENT } from '../../src/types/agro';

describe('memoryAndScopeGuard — Testes de Blindagem de Memória e Escopo', () => {
  describe('releaseCanvas — Desalocação de Buffers Gráficos', () => {
    it('zera dimensões de canvas para desalocar buffer de RAM/GPU', () => {
      let cleared = false;
      const canvas = {
        width: 800,
        height: 600,
        getContext: () => ({
          clearRect: () => {
            cleared = true;
          },
        }),
      } as unknown as HTMLCanvasElement;

      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);

      releaseCanvas(canvas);

      expect(canvas.width).toBe(0);
      expect(canvas.height).toBe(0);
      expect(cleared).toBe(true);
    });

    it('trata graciosamente valores null ou undefined sem lançar exceção', () => {
      expect(() => releaseCanvas(null)).not.toThrow();
      expect(() => releaseCanvas(undefined)).not.toThrow();
    });
  });

  describe('Isolamento de Escopo Agro vs Pet', () => {
    it('EMPTY_AGRO_CONTENT inicializa sem tema Pet', () => {
      expect(EMPTY_AGRO_CONTENT.tema).not.toBe('clean-branco');
      expect(EMPTY_AGRO_CONTENT.template_layout).toBe('hero-central');
    });

    it('EMPTY_PET_CONTENT inicializa com tema clean-branco e layout pet-central', () => {
      expect(EMPTY_PET_CONTENT.tema).toBe('clean-branco');
      expect(EMPTY_PET_CONTENT.template_layout).toBe('pet-central');
    });

    it('ambos os conteúdos iniciam com módulo de preço inativo e limpo', () => {
      expect(EMPTY_AGRO_CONTENT.modulo_preco?.ativo).toBe(false);
      expect(EMPTY_PET_CONTENT.modulo_preco?.ativo).toBe(false);
      expect(EMPTY_AGRO_CONTENT.modulo_preco?.valor_por).toBe('');
      expect(EMPTY_PET_CONTENT.modulo_preco?.valor_por).toBe('');
    });
  });
});
