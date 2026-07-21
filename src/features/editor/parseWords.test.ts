import { describe, expect, it } from 'vitest';
import { parseWords } from './parseWords';

describe('parseWords', () => {
  it('splits on newlines and trims each word', () => {
    expect(parseWords('  KATZE \n HUND ')).toEqual(['KATZE', 'HUND']);
  });

  it('drops empty and whitespace-only lines', () => {
    expect(parseWords('KATZE\n\n   \nHUND\n')).toEqual(['KATZE', 'HUND']);
  });

  it('de-duplicates exact repeats, preserving first-seen order', () => {
    expect(parseWords('KATZE\nHUND\nKATZE\nMAUS')).toEqual([
      'KATZE',
      'HUND',
      'MAUS',
    ]);
  });

  it('does NOT case-fold or normalize (the engine owns that)', () => {
    // Different case is treated as distinct here — normalization is the engine's
    // job (spec Prior decision), so parseWords keeps both.
    expect(parseWords('Katze\nKATZE')).toEqual(['Katze', 'KATZE']);
  });

  it('returns an empty list for a blank input', () => {
    expect(parseWords('')).toEqual([]);
    expect(parseWords('   \n\n')).toEqual([]);
  });
});
