// URLs fotográficas oficiais de alta resolução aprovadas para habitats agro
export const BACKGROUND_ASSETS = {
  MAQUINAS: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80',
  LAVOURA: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80',
  PULVERIZACAO: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
  PECUARIA: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1200&q=80',
  SOLO: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=80',
} as const;

export function resolveBackgroundFromPrompt(
  prompt?: string,
  explicitBg?: string,
  directUrl?: string
): string | undefined {
  const isValidSource = (value?: string) =>
    Boolean(value && (value.startsWith('http') || value.startsWith('data:')));

  if (isValidSource(explicitBg)) return explicitBg;
  if (isValidSource(directUrl)) return directUrl;
  if (isValidSource(prompt)) return prompt;

  const text = (prompt || '').toLowerCase();

  if (/galpão|galpao|feno|forrageira|ensiladeira|triturador|picadeira|máquina|maquina|maquinário|maquinario|trator|equipamento/.test(text)) {
    return BACKGROUND_ASSETS.MAQUINAS;
  }

  if (/silagem|capim|semente|brachiaria/.test(text)) {
    return BACKGROUND_ASSETS.LAVOURA;
  }

  if (/pulverizador|aplicação|aplicacao|costal|xp 16/.test(text)) {
    return BACKGROUND_ASSETS.PULVERIZACAO;
  }

  if (/gado|bovino|nelore|vacina|raiva|rebanho/.test(text)) {
    return BACKGROUND_ASSETS.PECUARIA;
  }

  if (/adubo|fertilizante|solo|nutrição|nutricao/.test(text)) {
    return BACKGROUND_ASSETS.SOLO;
  }

  return undefined;
}
