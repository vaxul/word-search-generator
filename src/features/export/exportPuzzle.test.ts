// Unit tests for the pure filename-stem sanitizer (issue #41). The download
// side effects are covered in ExportAction.test.tsx; here we pin the stem rules:
// diacritics fold, the sz-ligature maps to `ss`, non-word runs collapse to a
// single hyphen, and an empty result falls back. Umlaut inputs are built with
// `String.fromCharCode` so no non-ASCII literal appears in this feature file
// (the ESLint German-literal backstop rejects those outside src/strings/).
import { describe, expect, it } from 'vitest';
import { sanitizeFilenameStem } from './exportPuzzle';

// Ä Ö Ü ß — built from code points to avoid a non-ASCII source literal.
const UMLAUTS = String.fromCharCode(0xc4, 0xd6, 0xdc, 0xdf);

describe('sanitizeFilenameStem', () => {
  it('lowercases and hyphenates a normal title', () => {
    expect(sanitizeFilenameStem('Tiere im Wald', 'wortsuche')).toBe(
      'tiere-im-wald',
    );
  });

  it('collapses punctuation and whitespace runs into single hyphens', () => {
    expect(sanitizeFilenameStem('  Klasse 3b: Woche #2!  ', 'wortsuche')).toBe(
      'klasse-3b-woche-2',
    );
  });

  it('folds German diacritics and maps the sz-ligature to ss', () => {
    expect(sanitizeFilenameStem(UMLAUTS, 'wortsuche')).toBe('aouss');
  });

  it('falls back when the title is empty', () => {
    expect(sanitizeFilenameStem('', 'wortsuche')).toBe('wortsuche');
  });

  it('falls back when the title has no usable characters', () => {
    expect(sanitizeFilenameStem('   ---  ', 'wortsuche')).toBe('wortsuche');
  });
});
