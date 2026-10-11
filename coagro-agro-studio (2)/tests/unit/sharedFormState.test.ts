import { describe, it, expect } from 'vitest';
import {
  getDefaultSocialManualData,
  syncSocialManualDataToContent,
  syncContentToSocialManualData,
  SocialManualData,
} from '../../src/lib/sharedFormState';
import {
  ProductPhotoSection,
  ProductDescriptionSection,
  TemplateMatrixSection,
  LivePriceSection,
  LiveTitleSection,
  LiveTextFieldsSection,
} from '../../src/components/input-panel';

describe('sharedFormState — Unificação de Estado e Isolamento Agro vs Pet', () => {
  describe('getDefaultSocialManualData', () => {
    it('retorna dados padrão exclusivos para escopo AGRO', () => {
      const data = getDefaultSocialManualData('AGRO');
      expect(data.titulo).toBe('Pulverizador Costal 16L');
      expect(data.theme).toBe('campo-agro');
      expect(data.badge).toBe('Oferta Campo');
      expect(data.titulo).not.toContain('Ração');
    });

    it('retorna dados padrão exclusivos para escopo PET', () => {
      const data = getDefaultSocialManualData('PET');
      expect(data.titulo).toBe('Ração Golden Special 15kg');
      expect(data.theme).toBe('clean-branco');
      expect(data.badge).toBe('Oferta Pet');
      expect(data.titulo).not.toContain('Pulverizador');
    });
  });

  describe('syncSocialManualDataToContent', () => {
    it('converte SocialManualData para AgroPostContent preservando escopo AGRO', () => {
      const manual: SocialManualData = {
        titulo: 'Adubo NPK 10-10-10',
        subtitulo: 'Nutrição vegetal de alta performance',
        valorDe: '120,00',
        valorPor: '99,90',
        diferenciais: ['Liberação lenta', 'Solubilidade total'],
        cta: 'Garanta o seu!',
        theme: 'campo-agro',
      };

      const content = syncSocialManualDataToContent(manual, 'AGRO');

      expect(content.linha).toBe('AGRO');
      expect(content.textos_hero?.titulo).toBe('Adubo NPK 10-10-10');
      expect(content.textos_da_arte?.titulo_impacto).toBe('Adubo NPK 10-10-10');
      expect(content.textos_da_arte?.bullets_tecnicos).toEqual([
        'Liberação lenta',
        'Solubilidade total',
      ]);
      expect(content.modulo_preco?.ativo).toBe(true);
      expect(content.modulo_preco?.valor_de).toBe('120,00');
      expect(content.modulo_preco?.valor_por).toBe('99,90');
      expect(content.tipo_postagem).toBe('promocao');
    });

    it('converte SocialManualData para AgroPostContent respeitando escopo PET e tema clean-branco', () => {
      const manual: SocialManualData = {
        titulo: 'Shampoo Neutro Pet 500ml',
        subtitulo: 'Pelagem macia e brilhante',
        valorDe: '',
        valorPor: '',
        diferenciais: ['Hipoalergênico'],
        cta: 'Venha conferir!',
        theme: 'clean-branco',
      };

      const content = syncSocialManualDataToContent(manual, 'PET');

      expect(content.linha).toBe('PET');
      expect(content.tema).toBe('clean-branco');
      expect(content.template_layout).toBe('pet-central');
      expect(content.modulo_preco?.ativo).toBe(false);
      expect(content.tipo_postagem).toBe('informativo');
    });
  });

  describe('syncContentToSocialManualData', () => {
    it('extrai corretamente campos de AgroPostContent de volta para o formulário manual', () => {
      const manual = getDefaultSocialManualData('AGRO');
      const content = syncSocialManualDataToContent(manual, 'AGRO');

      const extracted = syncContentToSocialManualData(content);

      expect(extracted.titulo).toBe(manual.titulo);
      expect(extracted.subtitulo).toBe(manual.subtitulo);
      expect(extracted.valorPor).toBe(manual.valorPor);
      expect(extracted.valorDe).toBe(manual.valorDe);
      expect(extracted.diferenciais).toEqual(manual.diferenciais);
    });
  });

  describe('input-panel — Barrel Export dos Subcomponentes Desacoplados', () => {
    it('exporta todos os 6 submódulos da decomposição do InputPanel', () => {
      expect(ProductPhotoSection).toBeDefined();
      expect(ProductDescriptionSection).toBeDefined();
      expect(TemplateMatrixSection).toBeDefined();
      expect(LivePriceSection).toBeDefined();
      expect(LiveTitleSection).toBeDefined();
      expect(LiveTextFieldsSection).toBeDefined();
    });
  });
});
