import { DIRECTION_VECTORS } from '../../core';
import type { Grid, PlacedWord } from '../../core';

/**
 * The set of row-major cell indices covered by the placed words — the solution
 * highlight (issue #35). For each {@link PlacedWord} we walk its start cell by
 * the engine's {@link DIRECTION_VECTORS} step (row grows downward, col
 * rightward), one cell per letter, and collect `row * width + col`. Reverse
 * placement needs no special handling: the engine bakes it into the stored
 * compass direction (placement Prior decision), so replaying that direction
 * reproduces the exact placed cells. A `Set` dedupes cells shared by
 * overlapping words.
 */
export function solutionCellIndices(
  placed: readonly PlacedWord[],
  grid: Grid,
): ReadonlySet<number> {
  const indices = new Set<number>();
  for (const { word, start, direction } of placed) {
    const { dRow, dCol } = DIRECTION_VECTORS[direction];
    for (let i = 0; i < word.length; i += 1) {
      const row = start.row + i * dRow;
      const col = start.col + i * dCol;
      indices.add(row * grid.width + col);
    }
  }
  return indices;
}
