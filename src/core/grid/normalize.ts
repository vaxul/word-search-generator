// German-aware word normalization for the grid engine.
//
// Words are normalized to a single, consistent UPPERCASE form so placement and
// overlap comparison work on a stable alphabet, while German diacritics are
// PRESERVED (never transliterated to ae/oe/ue/ss — that would change the word
// the child searches for). See spec-grid-engine.md Prior decisions + docs/vision.md.
//
// The one hazard is `ß`: bare `String.prototype.toUpperCase()` maps `ß` → `SS`,
// two code points, which would silently lengthen the word and break length-based
// placement. This module therefore case-folds every character EXCEPT `ß`, which
// is kept as a single cell.
//
// Decision (ß glyph): keep the lowercase `ß` (U+00DF) rather than capital `ẞ`
// (U+1E9E). Both are a single code point, but `ß` is present in effectively
// every font — including the dyslexia-friendly print font of the later PDF phase
// — whereas the capital `ẞ` glyph is frequently missing. Documented here and in
// the spec Decision log.

const ESZETT = 'ß'; // 'ß'
const CAPITAL_ESZETT = 'ẞ'; // 'ẞ'

/**
 * Normalize a word to the engine's canonical grid form.
 *
 * Upper-cases each character via a German-aware mapping (ä/ö/ü → Ä/Ö/Ü, handled
 * natively by per-character `toUpperCase`, which yields a single code point for
 * those), while collapsing any eszett form to a single lowercase `ß` cell.
 * Iterates by code point (`for…of`) so astral characters are not split.
 *
 * @param word - A raw word as entered by the user.
 * @returns The upper-cased word with umlauts/ß preserved as single cells.
 */
export function normalizeWord(word: string): string {
  let result = '';
  for (const char of word) {
    if (char === ESZETT || char === CAPITAL_ESZETT) {
      result += ESZETT;
    } else {
      result += char.toUpperCase();
    }
  }
  return result;
}
