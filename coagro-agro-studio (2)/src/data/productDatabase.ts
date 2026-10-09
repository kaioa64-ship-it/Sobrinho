import { AgroPostContent, TemplateLayout } from '../types/agro';
import { PULVERIZADOR_XP16_SVG, RACAO_GOLDEN_SPECIAL_SVG } from '../assets/productPackshots';

export interface InternalProductData {
  codigo: string | number;
  nome: string;
  descricao?: string;
  imagemUrl?: string;
  imagemRecortada?: string;
  valorDe?: string;
  valorPor?: string;
  categoria?: 'AGRO' | 'PET';
  templateLayout?: TemplateLayout;
  jsonBase?: Partial<AgroPostContent>;
}

// Catálogo interno oficial com sementes de teste e produtos recorrentes
export const internalProductDatabase: Record<string, InternalProductData> = {
  // Código 00: Teste Rápido Pet (Golden Special 15kg sugerido pelo Kaio)
  '00': {
    codigo: '00',
    nome: 'RAÇÃO GOLDEN SPECIAL 15KG',
    descricao: 'Sabor Frango e Carne - Cães Adultos',
    imagemUrl: RACAO_GOLDEN_SPECIAL_SVG,
    imagemRecortada: RACAO_GOLDEN_SPECIAL_SVG,
    valorDe: '179,90',
    valorPor: '144,90',
    categoria: 'PET',
    templateLayout: 'whatsapp-status',
    jsonBase: {
      textos_da_arte: {
        titulo_impacto: 'RAÇÃO GOLDEN SPECIAL',
        palavra_destaque: '15KG',
        subtitulo: 'Sabor Frango e Carne - Cães Adultos',
        bullets_tecnicos: ['Sem corantes artificiais', 'Alta digestibilidade', 'Rica em ômegas 3 e 6'],
        cta: 'PEÇA NO WHATSAPP'
      }
    }
  },
  // Código 01: Teste Rápido Agro (Pulverizador XP 16L)
  '01': {
    codigo: '01',
    nome: 'PULVERIZADOR COSTAL MANUAL XP 16L',
    descricao: 'Alta resistência e conforto ergonômico no campo',
    imagemUrl: PULVERIZADOR_XP16_SVG,
    imagemRecortada: PULVERIZADOR_XP16_SVG,
    valorDe: '299,90',
    valorPor: '249,90',
    categoria: 'AGRO',
    templateLayout: 'whatsapp-status',
    jsonBase: {
      textos_da_arte: {
        titulo_impacto: 'PULVERIZADOR COSTAL',
        palavra_destaque: 'XP 16L',
        subtitulo: 'A força e pressão que o campo exige',
        bullets_tecnicos: ['Capacidade 16 Litros', 'Pressão constante', 'Alças almofadadas'],
        cta: 'FALE COM NOSSO CONSULTOR'
      }
    }
  },
  '12345': {
    codigo: '12345',
    nome: 'RAÇÃO TUTTICANIS SELECT 10.1 KG',
    descricao: 'Nutrição completa para cães adultos',
    imagemUrl: RACAO_GOLDEN_SPECIAL_SVG,
    imagemRecortada: RACAO_GOLDEN_SPECIAL_SVG,
    valorDe: '159,90',
    valorPor: '129,90',
    categoria: 'PET',
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
    imagemUrl: PULVERIZADOR_XP16_SVG,
    imagemRecortada: PULVERIZADOR_XP16_SVG,
    valorDe: '299,90',
    valorPor: '249,90',
    categoria: 'AGRO',
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
