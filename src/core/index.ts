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
  clampGridSize,
  configFromDifficulty,
  DIFFICULTY_PRESETS,
  DIRECTIONS,
  DIRECTION_VECTORS,
  EMPTY_CELL,
  generate,
  GRID_SIZE_MAX,
  GRID_SIZE_MIN,
  mulberry32,
  normalizeWord,
  oppositeDirection,
  placeWords,
  reverseVector,
  seedFromString,
} from './grid';
export type {
  DifficultyPreset,
  DirectionVector,
  PlacementResult,
  RandomFn,
} from './grid';

// PDF layer (issue #37): jsPDF Unicode-font embedding so German umlauts/ß render.
// A4 layout math + puzzle/solution rendering re-export here as they land.
export {
  PDF_FONTS,
  PDF_FONT_FOR_FAMILY,
  pdfFontForFamily,
  registerFont,
  registerFontAsset,
} from './pdf';
export type { PdfFontAsset, PdfFontFamily, PdfFontId } from './pdf';
