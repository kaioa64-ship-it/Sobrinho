import { AgroPostContent, TemplateLayout } from '../types/agro';

export interface InternalProductData {
  codigo: string | number;
  nome: string;
  descricao?: string;
  imagemUrl?: string;
  templateLayout?: TemplateLayout;
  jsonBase?: Partial<AgroPostContent>;
}

// Mock inicial do banco interno de produtos (código -> informações)
export const internalProductDatabase: Record<string, InternalProductData> = {
  '12345': {
    codigo: '12345',
    nome: 'RAÇÃO TUTTICANIS SELECT 10.1 KG',
    descricao: 'Nutrição completa para cães adultos',
    imagemUrl: '/assets/products/tutticanis.png', // Exemplo de path
    templateLayout: 'pet-central',
    jsonBase: {
      textos_da_arte: {
        titulo_impacto: 'TUTTICANIS SELECT',
        palavra_destaque: '10.1 KG',
        subtitulo: 'Nutrição completa',
        bullets_tecnicos: ['Sabor Frango', 'Pelagem Saudável', 'Alta Digestibilidade'],
        cta: 'Aproveite na Coagro'
      }
    }
  },
  '67890': {
    codigo: '67890',
    nome: 'PULVERIZADOR JACTO XP-16',
    descricao: 'Alta resistência e durabilidade para o campo',
    imagemUrl: '/assets/products/pulverizador-xp16.png',
    templateLayout: 'hero-central',
    jsonBase: {
      textos_da_arte: {
        titulo_impacto: 'PULVERIZADOR',
        palavra_destaque: 'XP-16',
        subtitulo: 'A força que o campo exige',
        bullets_tecnicos: ['Capacidade 16L', 'Resistente', 'Leve e Ergonômico'],
        cta: 'Garanta já o seu'
      }
    }
  }
};

export function getInternalProductByCode(codigo: string | number): InternalProductData | null {
  const codeStr = String(codigo).trim();
  return internalProductDatabase[codeStr] || null;
}
