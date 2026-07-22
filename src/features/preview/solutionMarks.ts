import { DIRECTION_VECTORS } from '../../core';
import type { PlacedWord } from '../../core';

/**
 * The centre point of a grid cell, expressed in **cell units** (not pixels):
 * column `col + 0.5`, row `row + 0.5`. The preview overlay multiplies these by
 * the fixed cell pitch to get SVG coordinates, so the geometry stays pure and
 * pitch-independent (and unit-testable without a DOM).
 */
export interface CellPoint {
  readonly col: number;
  readonly row: number;
}

/**
 * One per-word solution marking: the word plus the centre of its first and last
 * cell (in cell units). The preview draws a rounded capsule (a thick,
 * round-capped line) from `start` to `end`, mirroring the PDF's per-word amber
 * stroke — so adjacent/overlapping words each show their own distinct mark
 * instead of blurring into one flat fill (issue #56).
 */
export interface SolutionMark {
  readonly word: string;
  readonly start: CellPoint;
  readonly end: CellPoint;
}

/**
 * Turns the placed words into one {@link SolutionMark} each. For every
 * {@link PlacedWord} we walk from its start cell along the engine's
 * {@link DIRECTION_VECTORS} step (row grows downward, col rightward) by
 * `length - 1` cells to reach the last cell, then take both cell centres.
 * Reverse placement needs no special handling: the engine bakes it into the
 * stored compass direction, so replaying that direction reproduces the exact
 * placed span. Unlike a de-duplicated cell set, one mark per word keeps
 * overlapping words individually readable.
 */
export function solutionMarks(placed: readonly PlacedWord[]): readonly SolutionMark[] {
  return placed.map(({ word, start, direction }) => {
    const { dRow, dCol } = DIRECTION_VECTORS[direction];
    const steps = Array.from(word).length - 1;
    return {
      word,
      start: { col: start.col + 0.5, row: start.row + 0.5 },
      end: {
        col: start.col + steps * dCol + 0.5,
        row: start.row + steps * dRow + 0.5,
      },
    };
  });
}
