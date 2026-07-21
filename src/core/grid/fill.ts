// Random fill of the empty cells — the final grid-assembly step (issue #12).
//
// `placeWords` (issue #11) produces the PLACED grid: occupied cells hold a
// normalized glyph, every other cell is `EMPTY_CELL` (`''`). This module fills
// those empty cells with random letters and returns the finished {@link Grid}.
//
// Fill alphabet (spec-grid-engine.md Prior decision, gate-resolved 2026-07-20):
// the FULL German alphabet A–Z (in the engine's UPPERCASE normalized form)
// PLUS any of ä/ö/ü/ß that ACTUALLY appear among the placed letters — in their
// normalized single-cell forms Ä/Ö/Ü and lowercase `ß`. No fill character is
// ever drawn from outside this alphabet, so a word containing a diacritic does
// not stand out as the only cell bearing that glyph (prior-art diacritics
// requirement). A diacritic that appears in NO placed word is likewise never
// introduced by the fill, keeping the difficulty honest.
//
// Determinism: every random draw flows through the injected seeded
// {@link RandomFn} (mulberry32, issue #10) — there is no `Math.random()` in
// src/core. The same `(placement, seed)` therefore yields a byte-identical
// filled grid, which the determinism unit test pins. Placed letters are copied
// through untouched; only `EMPTY_CELL` cells are replaced.

import type { Grid } from '../model';
import { EMPTY_CELL } from './placement';
import type { PlacementResult } from './placement';
import type { RandomFn } from './prng';

/** The 26 letters of the base alphabet in the engine's UPPERCASE form. */
const BASE_ALPHABET: readonly string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/**
 * The German diacritic glyphs the fill may add — in the exact normalized,
 * single-cell forms produced by {@link normalizeWord}: Ä/Ö/Ü uppercase and the
 * lowercase eszett `ß`. Only the glyphs that actually appear among the placed
 * letters are added to the fill alphabet.
 */
const DIACRITIC_GLYPHS: readonly string[] = ['Ä', 'Ö', 'Ü', 'ß'];

/**
 * Compute the fill alphabet for a placed grid: the 26 base letters A–Z plus any
 * of Ä/Ö/Ü/ß that occur among the placed cells (scanning the non-empty cells).
 *
 * The base 26 are always present; a diacritic is included only if a placed word
 * put it on the grid, so a fill glyph never reveals which cells belong to a word.
 *
 * @param cells - The placed grid cells (row-major 1D; `''` for empty).
 * @returns The fill alphabet as a stable-ordered array (A–Z then present Ä/Ö/Ü/ß).
 */
export function computeFillAlphabet(
  cells: readonly string[],
): readonly string[] {
  const present = new Set(cells);
  const diacritics = DIACRITIC_GLYPHS.filter((glyph) => present.has(glyph));
  return [...BASE_ALPHABET, ...diacritics];
}

/**
 * Assemble the finished grid: copy through every placed letter and replace each
 * {@link EMPTY_CELL} with a PRNG-drawn character from the computed fill alphabet.
 *
 * Deterministic given the injected seeded PRNG: the same placement and PRNG
 * state produce a byte-identical `cells` array. Placed letters are never
 * overwritten. The returned {@link Grid} carries the placement's `width`/`height`.
 *
 * @param placement - The result of {@link placeWords} (placed grid + metadata).
 * @param random - The seeded PRNG; the sole source of randomness.
 * @returns The finished {@link Grid} with no empty cells.
 */
export function fillGrid(placement: PlacementResult, random: RandomFn): Grid {
  const alphabet = computeFillAlphabet(placement.cells);
  const cells = placement.cells.map((cell) =>
    cell === EMPTY_CELL ? drawLetter(alphabet, random) : cell,
  );
  return { width: placement.width, height: placement.height, cells };
}

/** Draw one letter from the alphabet using the seeded PRNG. */
function drawLetter(alphabet: readonly string[], random: RandomFn): string {
  const index = Math.floor(random() * alphabet.length);
  return alphabet[index];
}
