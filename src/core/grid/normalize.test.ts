import { describe, expect, it } from 'vitest';
import { normalizeWord } from './normalize';

describe('normalizeWord', () => {
  it('upper-cases plain ASCII words', () => {
    expect(normalizeWord('katze')).toBe('KATZE');
  });

  it('maps umlauts to their single-cell uppercase form (ä/ö/ü → Ä/Ö/Ü)', () => {
    expect(normalizeWord('bär')).toBe('BÄR');
    expect(normalizeWord('öl')).toBe('ÖL');
    expect(normalizeWord('über')).toBe('ÜBER');
    // Each umlaut stays exactly one code point after normalization.
    expect([...normalizeWord('äöü')]).toEqual(['Ä', 'Ö', 'Ü']);
  });

  it('keeps ß as a SINGLE cell — never expands to SS', () => {
    const result = normalizeWord('straße');
    expect(result).toBe('STRAßE');
    expect([...result]).toHaveLength(6);
    expect(result).not.toContain('SS');
  });

  it('collapses the capital eszett (ẞ) to a single ß cell', () => {
    const result = normalizeWord('STRAẞE');
    expect(result).toBe('STRAßE');
    expect([...result]).toHaveLength(6);
  });

  it('preserves total code-point length (no transliteration growth)', () => {
    for (const word of ['fuß', 'grüße', 'mäßig', 'ß']) {
      expect([...normalizeWord(word)]).toHaveLength([...word].length);
    }
  });

  it('is idempotent on already-normalized input', () => {
    const once = normalizeWord('grüße');
    expect(normalizeWord(once)).toBe(once);
  });
});
