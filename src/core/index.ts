// Public entry point for the pure domain layer (Phase 2+): model, grid, pdf.
// This layer is pure TypeScript with no React/DOM imports (enforced by the
// ESLint core guard). See docs/architecture.md.
//
// Phase 2 landed the domain model; grid/pdf modules re-export here as they land.
export type {
  Coordinate,
  Difficulty,
  Direction,
  GenerationResult,
  Grid,
  PlacedWord,
  PuzzleConfig,
} from './model';

// Grid primitives (issue #10): seeded PRNG, direction vectors + reverse, and
// German-aware normalization.
export {
  DIRECTIONS,
  DIRECTION_VECTORS,
  mulberry32,
  normalizeWord,
  oppositeDirection,
  reverseVector,
  seedFromString,
} from './grid';
export type { DirectionVector, RandomFn } from './grid';
