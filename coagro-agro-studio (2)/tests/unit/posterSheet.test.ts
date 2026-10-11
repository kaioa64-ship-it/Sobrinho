import { describe, it, expect } from 'vitest';
import { PosterSheetGrid } from '../../src/components/art-renderer/PosterSheetContainer';

describe('PosterSheetGrid', () => {
  it('suporta as 3 variações oficiais da Fase 3 de impressão', () => {
    const grids: PosterSheetGrid[] = ['1_PER_PAGE', '2_PER_PAGE', '4_PER_PAGE'];
    expect(grids).toHaveLength(3);
    expect(grids).toContain('1_PER_PAGE');
    expect(grids).toContain('2_PER_PAGE');
    expect(grids).toContain('4_PER_PAGE');
  });
});
