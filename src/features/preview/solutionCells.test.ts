import { describe, expect, it } from 'vitest';
import type { GenerationResult } from '../../core';
import { solutionCellIndices } from './solutionCells';

const GRID: GenerationResult['grid'] = {
  width: 3,
  height: 3,
  cells: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
};

describe('solutionCellIndices', () => {
  it('collects the row-major indices a horizontal word occupies', () => {
    const cells = solutionCellIndices(
      [{ word: 'ABC', start: { row: 0, col: 0 }, direction: 'E' }],
      GRID,
    );
    expect([...cells].sort((a, b) => a - b)).toEqual([0, 1, 2]);
  });

  it('walks the engine step vector for a diagonal word', () => {
    // SE from (0,0): (0,0),(1,1),(2,2) -> indices 0, 4, 8.
    const cells = solutionCellIndices(
      [{ word: 'AEI', start: { row: 0, col: 0 }, direction: 'SE' }],
      GRID,
    );
    expect([...cells].sort((a, b) => a - b)).toEqual([0, 4, 8]);
  });

  it('handles a reverse placement (stored as the opposite direction)', () => {
    // Reverse of an eastward word is stored as W: from (0,2) walking W ->
    // (0,2),(0,1),(0,0) -> indices 2, 1, 0.
    const cells = solutionCellIndices(
      [{ word: 'CBA', start: { row: 0, col: 2 }, direction: 'W' }],
      GRID,
    );
    expect([...cells].sort((a, b) => a - b)).toEqual([0, 1, 2]);
  });

  it('dedupes cells shared by overlapping words', () => {
    const cells = solutionCellIndices(
      [
        { word: 'ABC', start: { row: 0, col: 0 }, direction: 'E' },
        { word: 'AD', start: { row: 0, col: 0 }, direction: 'S' },
      ],
      GRID,
    );
    // Shared cell 0 counted once: {0,1,2} ∪ {0,3} = {0,1,2,3}.
    expect([...cells].sort((a, b) => a - b)).toEqual([0, 1, 2, 3]);
  });

  it('returns an empty set when nothing was placed', () => {
    expect(solutionCellIndices([], GRID).size).toBe(0);
  });
});
