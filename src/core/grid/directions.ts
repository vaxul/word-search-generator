// Direction vectors for word placement in the letter grid.
//
// Each of the eight compass {@link Direction}s maps to a `(dRow, dCol)` step
// vector (Jamis Buck prior art: grid-as-1D-array with per-step direction
// vectors). Stepping from a start coordinate by a direction's vector, one cell
// per letter, walks the cells a word occupies.
//
// Axis convention matches the domain model: `row` increases downward (N is
// -row, S is +row) and `col` increases rightward (E is +col, W is -col). So NE
// = up-and-right = (dRow: -1, dCol: +1).
//
// Backward placement (the `reverse` config flag) is NOT a ninth direction: it
// is the same walk with a negated vector, exposed here as {@link reverseVector}
// (negate the step) and {@link oppositeDirection} (the mirrored compass point).

import type { Direction } from '../model';

/** A single grid step: row/column deltas applied once per letter. */
export interface DirectionVector {
  readonly dRow: number;
  readonly dCol: number;
}

/** The eight compass directions, in a fixed order for deterministic iteration. */
export const DIRECTIONS: readonly Direction[] = [
  'E',
  'W',
  'N',
  'S',
  'NE',
  'NW',
  'SE',
  'SW',
];

/** Step vector for each compass direction (row grows downward, col rightward). */
export const DIRECTION_VECTORS: Record<Direction, DirectionVector> = {
  E: { dRow: 0, dCol: 1 },
  W: { dRow: 0, dCol: -1 },
  N: { dRow: -1, dCol: 0 },
  S: { dRow: 1, dCol: 0 },
  NE: { dRow: -1, dCol: 1 },
  NW: { dRow: -1, dCol: -1 },
  SE: { dRow: 1, dCol: 1 },
  SW: { dRow: 1, dCol: -1 },
};

/** The opposite compass direction — the reverse transform at the Direction level. */
const OPPOSITE: Record<Direction, Direction> = {
  E: 'W',
  W: 'E',
  N: 'S',
  S: 'N',
  NE: 'SW',
  SW: 'NE',
  NW: 'SE',
  SE: 'NW',
};

/**
 * Negate a step vector to walk backward along the same line.
 *
 * Used to place a word in reverse along an allowed direction without adding
 * reverse directions to {@link DIRECTIONS}.
 */
export function reverseVector(vector: DirectionVector): DirectionVector {
  // `0 - x` rather than `-x` so a zero axis stays `+0` (unary minus yields `-0`,
  // which would surface as `-0` in derived coordinates).
  return { dRow: 0 - vector.dRow, dCol: 0 - vector.dCol };
}

/**
 * The mirrored compass direction (E↔W, N↔S, NE↔SW, NW↔SE).
 *
 * `oppositeDirection` is involutive: applying it twice returns the original.
 */
export function oppositeDirection(direction: Direction): Direction {
  return OPPOSITE[direction];
}
