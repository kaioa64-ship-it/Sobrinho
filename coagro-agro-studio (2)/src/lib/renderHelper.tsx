import React from 'react';

/**
 * Splits the title text and highlights the specified word with Gold (#ffab00) color.
 */
export function renderTitleWithHighlight(
  title: string,
  highlightWord?: string,
  baseColor: string = 'text-white'
): React.ReactNode {
  if (!title) return null;
  if (!highlightWord || !highlightWord.trim()) {
    return <span className={baseColor}>{title}</span>;
  }

  const cleanHighlight = highlightWord.trim().toUpperCase();
  const words = title.split(/(\s+)/);

  return (
    <>
      {words.map((word, index) => {
        // Strip punctuation for matching
        const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '').toUpperCase();
        const isMatch = cleanWord === cleanHighlight || word.toUpperCase().includes(cleanHighlight);

        if (isMatch) {
          return (
            <span
              key={index}
              style={{ color: '#ffab00' }}
              className="font-black drop-shadow-[0_2px_8px_rgba(255,171,0,0.35)]"
            >
              {word}
            </span>
          );
        }

        return (
          <span key={index} className={baseColor}>
            {word}
          </span>
        );
      })}
    </>
  );
}
