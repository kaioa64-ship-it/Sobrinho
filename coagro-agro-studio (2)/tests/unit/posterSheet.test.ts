import { describe, it, expect } from 'vitest';
import React from 'react';
import { PosterSheetContainer, PosterSheetGrid } from '../../src/components/art-renderer/PosterSheetContainer';
import { PromoTextOnly } from '../../src/components/art-renderer/templates/PromoTextOnly';

describe('PosterSheetGrid & PosterSheetContainer', () => {
  it('suporta as 3 variações oficiais da Fase 3 de impressão', () => {
    const grids: PosterSheetGrid[] = ['1_PER_PAGE', '2_PER_PAGE', '4_PER_PAGE'];
    expect(grids).toHaveLength(3);
    expect(grids).toContain('1_PER_PAGE');
    expect(grids).toContain('2_PER_PAGE');
    expect(grids).toContain('4_PER_PAGE');
  });

  it('renderiza múltiplos itens sequenciais distintos em grade 4_PER_PAGE', () => {
    const item1 = React.createElement('div', { key: 'item-1', id: 'cartaz-1' }, 'Grampo');
    const item2 = React.createElement('div', { key: 'item-2', id: 'cartaz-2' }, 'Adubo');
    const item3 = React.createElement('div', { key: 'item-3', id: 'cartaz-3' }, 'Fertilizante');
    const item4 = React.createElement('div', { key: 'item-4', id: 'cartaz-4' }, 'Ração');

    const tree = PosterSheetContainer({
      grid: '4_PER_PAGE',
      children: [item1, item2, item3, item4]
    });

    expect(React.isValidElement(tree)).toBe(true);
    const el = tree as React.ReactElement<{ className: string }>;
    expect(el.props.className).toContain('grid-cols-2 grid-rows-2');
  });

  it('renderiza 2 itens distintos em meia-folha A5 2_PER_PAGE', () => {
    const item1 = React.createElement('div', { key: 'item-1' }, 'Item A');
    const item2 = React.createElement('div', { key: 'item-2' }, 'Item B');

    const tree = PosterSheetContainer({
      grid: '2_PER_PAGE',
      children: [item1, item2]
    });

    expect(React.isValidElement(tree)).toBe(true);
    const el = tree as React.ReactElement<{ className: string }>;
    expect(el.props.className).toContain('grid-cols-2');
  });

  it('PromoTextOnly aceita discountBadge e herda atributos oficiais', () => {
    const tree = PromoTextOnly({
      title: 'PRODUTO TESTE',
      currentPrice: '49,90',
      oldPrice: '69,90',
      codigo: '998877',
      discountBadge: '-28% OFF'
    });

    expect(React.isValidElement(tree)).toBe(true);
    const el = tree as React.ReactElement<{ className: string }>;
    expect(el.props.className).toContain('bg-[#0047b3]');
  });

  it('calcula pixelRatio correto para cada densidade gráfica (DPI)', async () => {
    const { getPixelRatioForDpi, getDefaultDpi } = await import('../../src/components/BatchRendererModal');
    
    // Base 96 DPI CSS
    expect(getPixelRatioForDpi(100)).toBeCloseTo(1.0417, 2);
    expect(getPixelRatioForDpi(120)).toBe(1.25);
    expect(getPixelRatioForDpi(150)).toBe(1.5625);
    expect(getPixelRatioForDpi(300)).toBe(3.125);

    // Auto-adaptação dinâmica por volume de folhas
    expect(getDefaultDpi(700)).toBe(120); // Lotes gigantes (teste do Kaio: 700 páginas)
    expect(getDefaultDpi(80)).toBe(120);  // Lotes grandes (> 50 páginas)
    expect(getDefaultDpi(30)).toBe(150);  // Lotes médios (16 a 50 páginas)
    expect(getDefaultDpi(5)).toBe(300);   // Lotes pequenos (<= 15 páginas)
  });
});
