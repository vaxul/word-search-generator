// Public surface of the grid primitives (Phase 2, issue #10): the seeded PRNG,
// the compass direction vectors + reverse transform, and German-aware word
// normalization. Placement/fill logic re-exports here as it lands.
export { mulberry32, seedFromString } from './prng';
export type { RandomFn } from './prng';
export {
  DIRECTIONS,
  DIRECTION_VECTORS,
  oppositeDirection,
  reverseVector,
} from './directions';
export type { DirectionVector } from './directions';
export { normalizeWord } from './normalize';
export { EMPTY_CELL, placeWords } from './placement';
export type { PlacementResult } from './placement';
export { computeFillAlphabet, fillGrid } from './fill';
export {
  clampGridSize,
  configFromDifficulty,
  DIFFICULTY_PRESETS,
  GRID_SIZE_MAX,
  GRID_SIZE_MIN,
} from './presets';
export type { DifficultyPreset } from './presets';
export { generate } from './generate';
