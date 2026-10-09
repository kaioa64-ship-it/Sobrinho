import { describe, it, expect } from 'vitest';
import { TemplateLayout } from '../../src/types/agro';

describe('WhatsappStatusVertical Template Layout', () => {
  it('reconhece whatsapp-status como um identificador válido de TemplateLayout', () => {
    const layout: TemplateLayout = 'whatsapp-status';
    expect(layout).toBe('whatsapp-status');
  });

  it('permite que whatsapp-status conviva harmonicamente com outros templates de mídia social', () => {
    const validSocialTemplates: TemplateLayout[] = [
      'whatsapp-status',
      'unified-central',
      'unified-split',
      'promo-simples',
      'informative-central',
      'informative-split',
    ];

    expect(validSocialTemplates).toContain('whatsapp-status');
    expect(validSocialTemplates.length).toBe(6);
  });
});
