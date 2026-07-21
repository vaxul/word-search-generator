// Domain model for the word-search grid engine.
//
// Pure TypeScript: only `type`/`interface` declarations — no logic, no runtime
// values, no React/DOM imports (enforced by the ESLint src/core guard). These
// shapes are consumed by src/core/grid (placement), src/core/pdf (layout) and
// the React feature layer. Source of truth for the shapes and the modeling
// decisions below: docs/specs/spec-grid-engine.md, docs/architecture.md.

/**
 * The eight compass directions a word may run in. Backward placement is NOT a
 * ninth…sixteenth direction — it is modeled as the `reverse` flag on
 * {@link PuzzleConfig} (spec Prior decisions), keeping this set the eight
 * user-facing directions and matching the difficulty presets.
 */
export type Direction = 'E' | 'W' | 'N' | 'S' | 'NE' | 'NW' | 'SE' | 'SW';

/**
 * Difficulty preset identifier. Each preset folds into a {@link PuzzleConfig}
 * (grid size + allowed direction set + reverse flag) in the engine — the
 * mapping is data, not part of this type. German UI labels live in
 * src/strings/, never here.
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * A zero-based cell coordinate. `row` is the vertical axis (top → bottom),
 * `col` the horizontal axis (left → right).
 */
export interface Coordinate {
  readonly row: number;
  readonly col: number;
}

/**
 * A generated letter grid. `cells` is row-major and single-dimension: the cell
 * at `(row, col)` is `cells[row * width + col]`, matching the engine's
 * grid-as-1D-array representation (spec Prior decisions). Each cell holds
 * exactly one uppercase glyph; umlauts/ß are preserved as single cells and
 * never transliterated (spec: German handling).
 */
export interface Grid {
  readonly width: number;
  readonly height: number;
  readonly cells: readonly string[];
}

/**
 * Configuration for one puzzle. `width`/`height` are the grid bounds (5–30 per
 * spec Prior decisions). `directions` is the allowed direction set; `reverse`
 * enables backward placement along those directions. `words` is the raw word
 * list as entered — normalization (case + umlaut/ß handling) is the engine's
 * job, not this type's.
 */
export interface PuzzleConfig {
  readonly width: number;
  readonly height: number;
  readonly directions: readonly Direction[];
  readonly reverse: boolean;
  readonly words: readonly string[];
}

/**
 * A word successfully placed in the grid — the structured data behind an
 * answer-key line such as `CAT NE @ (5,14)`: the placed `word`, its `start`
 * coordinate (the first letter), and the `direction` it runs in. Formatting to
 * the answer-key string is a rendering concern (Phase 4), not part of this
 * type.
 */
export interface PlacedWord {
  readonly word: string;
  readonly start: Coordinate;
  readonly direction: Direction;
}

/**
 * The outcome of one generation run: the filled `grid`, every `placed` word
 * with its coordinates and direction, and the `unplaceable` words that did not
 * fit — reported explicitly and never silently omitted (docs/vision.md success
 * criterion).
 */
export interface GenerationResult {
  readonly grid: Grid;
  readonly placed: readonly PlacedWord[];
  readonly unplaceable: readonly string[];
}
