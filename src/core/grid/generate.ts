// The public grid-engine entry point (issue #13): `generate` ties the primitives
// together into one deterministic call producing a {@link GenerationResult}.
//
// Orchestration (reusing the existing primitives — nothing reimplemented here):
//   1. clamp the config's grid size into the 5–30 bound (spec Prior decision),
//   2. build the seeded PRNG from the generate-time `seed` (mulberry32, #10),
//   3. place the words — `placeWords` (#11) normalizes each word (German-aware,
//      umlaut/ß preserved) and reports any it cannot fit as un-placeable,
//   4. random-fill the remaining cells — `fillGrid` (#12) draws from the German
//      alphabet plus any diacritics present,
//   5. assemble the {@link GenerationResult}: grid + placed words + un-placeable.
//
// Determinism: a single PRNG built from `seed` drives both placement and fill,
// so the same `(config, seed)` yields a byte-identical result; there is no
// `Math.random()` in src/core. The seed is a parameter here, never a
// PuzzleConfig field and never surfaced to the user (spec Prior decision /
// vision: user-facing reproducibility is out of scope).

import type { GenerationResult, PuzzleConfig } from '../model';
import { fillGrid } from './fill';
import { placeWords } from './placement';
import { clampGridSize } from './presets';
import { mulberry32 } from './prng';

/**
 * Generate one word-search puzzle from a config and a seed.
 *
 * Total (never throws): an out-of-bounds grid size is clamped to 5–30, and a
 * word too long for the grid flows to `unplaceable` via placement rather than
 * crashing — words are never silently dropped (docs/vision.md success criterion).
 *
 * @param config - Grid bounds, allowed directions, reverse flag, and raw words.
 * @param seed - The generate-time PRNG seed; the sole source of randomness.
 * @returns The filled grid, the placed words (coordinates + direction), and the
 *   un-placeable words.
 */
export function generate(config: PuzzleConfig, seed: number): GenerationResult {
  const bounded: PuzzleConfig = {
    ...config,
    width: clampGridSize(config.width),
    height: clampGridSize(config.height),
  };
  const random = mulberry32(seed);
  const placement = placeWords(bounded, random);
  const grid = fillGrid(placement, random);
  return {
    grid,
    placed: placement.placed,
    unplaceable: placement.unplaceable,
  };
}
