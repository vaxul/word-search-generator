// Deterministic word placement — the heart of the grid engine (issue #11).
//
// Places each configured word into a grid-as-1D-array along the allowed
// directions (optionally reversed), overlapping earlier words ONLY where the
// existing cell already holds the same letter. Words that cannot be placed
// (including a word longer than any grid span) are reported explicitly, never
// silently dropped and never by throwing (docs/vision.md success criterion;
// spec-grid-engine.md Prior decisions).
//
// This module produces the PLACED grid: cells occupied by a word hold that
// letter, all other cells hold {@link EMPTY_CELL}. Random-filling the remaining
// cells from the German-aware alphabet is the next issue (#12), which consumes
// this {@link PlacementResult}.
//
// Determinism: every random choice flows through the injected seeded
// {@link RandomFn} (mulberry32, issue #10) — there is no `Math.random()` in
// src/core. The same `(config, seed)` therefore yields a byte-identical result,
// which the determinism unit test pins.
//
// Retry strategy (spec Prior decision: "retry-based placement with a bounded
// retry budget"): for each word we build the full candidate set of
// (direction, start-cell) options, shuffle it once with the seeded PRNG, then
// try each candidate at most once. This is the bounded budget — its size is
// `directions × width × height`, finite and fixed, so placement never loops
// forever. Trying every distinct candidate (rather than sampling random
// positions that may repeat or miss) guarantees we never falsely report a word
// un-placeable when a compatible slot exists in the current grid, while the
// PRNG-driven shuffle keeps WHICH valid slot is chosen random and seed-stable.

import type { Coordinate, Direction, PlacedWord, PuzzleConfig } from '../model';
import { DIRECTION_VECTORS, oppositeDirection } from './directions';
import { normalizeWord } from './normalize';
import type { RandomFn } from './prng';

/** Sentinel for a grid cell not yet holding a placed letter. */
export const EMPTY_CELL = '';

/**
 * The result of the placement pass: the working grid (row-major 1D, `''` for
 * empty cells), every {@link PlacedWord} with its start coordinate and the
 * compass direction it reads in, and the words that could not be placed.
 *
 * `unplaceable` reports the NORMALIZED word form (uppercase, umlaut/ß
 * preserved), matching `placed[i].word`, so the engine speaks one vocabulary.
 */
export interface PlacementResult {
  readonly width: number;
  readonly height: number;
  readonly cells: readonly string[];
  readonly placed: readonly PlacedWord[];
  readonly unplaceable: readonly string[];
}

/** One placement option: a start cell and the direction the word would run. */
interface Candidate {
  readonly direction: Direction;
  readonly start: Coordinate;
}

/**
 * Place every configured word into a fresh grid.
 *
 * Words are processed in `config.words` order (after normalization) so the run
 * is deterministic. Each word is either placed — appended to `placed` and
 * written into the returned `cells` — or reported in `unplaceable`. Empty words
 * (normalizing to nothing) are reported un-placeable rather than "placed" into
 * zero cells.
 *
 * @param config - Grid bounds, allowed directions, reverse flag, and raw words.
 * @param random - The seeded PRNG; the sole source of randomness.
 * @returns The placed grid plus the placed and un-placeable word lists.
 */
export function placeWords(
  config: PuzzleConfig,
  random: RandomFn,
): PlacementResult {
  const { width, height } = config;
  const cells: string[] = new Array<string>(width * height).fill(EMPTY_CELL);
  const directions = effectivePlacementDirections(config);
  const candidates = buildCandidates(width, height, directions);
  const placed: PlacedWord[] = [];
  const unplaceable: string[] = [];

  for (const raw of config.words) {
    const word = normalizeWord(raw);
    const placement =
      word.length > 0
        ? tryPlaceWord(cells, width, height, word, candidates, random)
        : null;
    if (placement) {
      placed.push(placement);
    } else {
      unplaceable.push(word);
    }
  }

  return { width, height, cells, placed, unplaceable };
}

/**
 * The compass directions a word may actually run in for this config.
 *
 * Backward placement is not a distinct direction: reversing along an allowed
 * direction is identical to placing forward along its opposite (spec Prior
 * decision — `reverse` is a config flag, not a 9th–16th direction). So when
 * `reverse` is on we add each allowed direction's opposite; a Set dedupes the
 * overlap (e.g. E's opposite W may already be allowed).
 */
function effectivePlacementDirections(
  config: PuzzleConfig,
): readonly Direction[] {
  const set = new Set<Direction>(config.directions);
  if (config.reverse) {
    for (const direction of config.directions) {
      set.add(oppositeDirection(direction));
    }
  }
  return [...set];
}

/** Build every (direction, start-cell) placement option — the bounded budget. */
function buildCandidates(
  width: number,
  height: number,
  directions: readonly Direction[],
): Candidate[] {
  const candidates: Candidate[] = [];
  for (const direction of directions) {
    for (let row = 0; row < height; row += 1) {
      for (let col = 0; col < width; col += 1) {
        candidates.push({ direction, start: { row, col } });
      }
    }
  }
  return candidates;
}

/**
 * Try to place one word: shuffle the candidate options with the PRNG, then take
 * the first candidate whose cells are all in-bounds and overlap-compatible.
 * Returns the {@link PlacedWord} (and mutates `cells`) or `null` if none fit.
 */
function tryPlaceWord(
  cells: string[],
  width: number,
  height: number,
  word: string,
  candidates: Candidate[],
  random: RandomFn,
): PlacedWord | null {
  shuffleInPlace(candidates, random);
  for (const candidate of candidates) {
    const indices = wordCellIndices(candidate, word.length, width, height);
    if (indices && cellsAccept(cells, indices, word)) {
      commitWord(cells, indices, word);
      return { word, start: candidate.start, direction: candidate.direction };
    }
  }
  return null;
}

/**
 * The 1D cell indices a word would occupy from `candidate`, or `null` if the
 * walk leaves the grid. A word longer than the available span always leaves the
 * grid from every start, so it collects no valid candidate and is reported
 * un-placeable — never a crash.
 */
function wordCellIndices(
  candidate: Candidate,
  length: number,
  width: number,
  height: number,
): number[] | null {
  const { dRow, dCol } = DIRECTION_VECTORS[candidate.direction];
  const indices: number[] = [];
  for (let i = 0; i < length; i += 1) {
    const row = candidate.start.row + i * dRow;
    const col = candidate.start.col + i * dCol;
    if (row < 0 || row >= height || col < 0 || col >= width) {
      return null;
    }
    indices.push(row * width + col);
  }
  return indices;
}

/**
 * Whether a word may occupy `indices`: each target cell must be empty or already
 * hold the SAME letter (overlap only at matching letters — spec Prior decision).
 * Any mismatch rejects the candidate. Indexing by code unit is safe: normalized
 * words contain only single-code-unit glyphs (A–Z, Ä/Ö/Ü, ß).
 */
function cellsAccept(
  cells: readonly string[],
  indices: readonly number[],
  word: string,
): boolean {
  for (let i = 0; i < indices.length; i += 1) {
    const existing = cells[indices[i]];
    if (existing !== EMPTY_CELL && existing !== word[i]) {
      return false;
    }
  }
  return true;
}

/** Write each letter of the word into its target cell (overlaps stay identical). */
function commitWord(
  cells: string[],
  indices: readonly number[],
  word: string,
): void {
  for (let i = 0; i < indices.length; i += 1) {
    cells[indices[i]] = word[i];
  }
}

/**
 * In-place Fisher–Yates shuffle driven by the seeded PRNG, so candidate order —
 * and therefore which valid slot a word takes — is random yet reproducible.
 */
function shuffleInPlace<T>(items: T[], random: RandomFn): void {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const temp = items[i];
    items[i] = items[j];
    items[j] = temp;
  }
}
