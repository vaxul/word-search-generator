// Difficulty presets — the gate-resolved mapping from a {@link Difficulty} to a
// grid size + allowed direction set + reverse flag (issue #13).
//
// The presets are DATA, not branching logic (spec-grid-engine.md Prior
// decision): a single {@link DIFFICULTY_PRESETS} table drives everything, so the
// feel of Easy/Medium/Hard can be retuned later without touching the engine.
// The gate-resolved mapping (2026-07-20):
//   - Easy:   12×12, H+V (E, S),                reverse OFF
//   - Medium: 15×15, +diagonals (E, S, SE, NE), reverse OFF
//   - Hard:   18×18, all 8 directions,          reverse ON
//
// A difficulty only fixes the grid size, direction set and reverse flag; the
// word list is supplied per run. `configFromDifficulty` folds a preset plus a
// word list (and an optional square-size override, clamped to the 5–30 bound)
// into a {@link PuzzleConfig}. The seed is NOT part of the config — it is a
// generate-time parameter (spec Prior decision / model #9), see `generate`.

import type { Difficulty, Direction, PuzzleConfig } from '../model';

/** The inclusive grid-size bounds (spec Prior decision: 5×5 – 30×30). */
export const GRID_SIZE_MIN = 5;
export const GRID_SIZE_MAX = 30;

/**
 * The size + direction set + reverse flag a difficulty maps to — everything a
 * {@link PuzzleConfig} needs except the per-run word list. Grid sizes are square.
 */
export interface DifficultyPreset {
  readonly width: number;
  readonly height: number;
  readonly directions: readonly Direction[];
  readonly reverse: boolean;
}

/**
 * The gate-resolved difficulty → preset mapping, as pure data. Adjustable later
 * without engine changes (presets are data, not logic — spec Prior decision).
 */
export const DIFFICULTY_PRESETS: Record<Difficulty, DifficultyPreset> = {
  easy: { width: 12, height: 12, directions: ['E', 'S'], reverse: false },
  medium: {
    width: 15,
    height: 15,
    directions: ['E', 'S', 'SE', 'NE'],
    reverse: false,
  },
  hard: {
    width: 18,
    height: 18,
    directions: ['E', 'W', 'N', 'S', 'NE', 'NW', 'SE', 'SW'],
    reverse: true,
  },
};

/**
 * Clamp a grid dimension into the inclusive 5–30 bound (spec Prior decision).
 *
 * Clamping (rather than throwing) keeps the engine total — an out-of-range size
 * is corrected to the nearest legal value instead of crashing, matching the
 * placement engine's no-throw philosophy. A non-finite input falls back to the
 * minimum so the result is always a usable dimension.
 */
export function clampGridSize(size: number): number {
  if (!Number.isFinite(size)) {
    return GRID_SIZE_MIN;
  }
  return Math.min(GRID_SIZE_MAX, Math.max(GRID_SIZE_MIN, Math.trunc(size)));
}

/**
 * Fold a difficulty preset plus a word list into a {@link PuzzleConfig}.
 *
 * The preset fixes the direction set and reverse flag; the size comes from the
 * preset unless `sizeOverride` supplies a square override, which is clamped to
 * the 5–30 bound. The seed stays out of the config (generate-time parameter).
 *
 * @param difficulty - The preset to base the config on.
 * @param words - The raw word list as entered (normalization is the engine's job).
 * @param sizeOverride - Optional square grid size; clamped to 5–30 when given.
 * @returns A {@link PuzzleConfig} ready for {@link generate}.
 */
export function configFromDifficulty(
  difficulty: Difficulty,
  words: readonly string[],
  sizeOverride?: number,
): PuzzleConfig {
  const preset = DIFFICULTY_PRESETS[difficulty];
  const size =
    sizeOverride === undefined ? undefined : clampGridSize(sizeOverride);
  return {
    width: size ?? preset.width,
    height: size ?? preset.height,
    directions: preset.directions,
    reverse: preset.reverse,
    words,
  };
}
