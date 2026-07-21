import { describe, expect, it } from 'vitest';

import type { Grid, PlacedWord, PuzzleConfig } from '../model';
import { DIRECTION_VECTORS } from './directions';
import { generate } from './generate';
import { configFromDifficulty, GRID_SIZE_MAX, GRID_SIZE_MIN } from './presets';

/** Read a placed word back off the FINAL (filled) grid along its direction. */
function readBack(grid: Grid, placed: PlacedWord): string {
  const { dRow, dCol } = DIRECTION_VECTORS[placed.direction];
  let read = '';
  for (let i = 0; i < placed.word.length; i += 1) {
    const row = placed.start.row + i * dRow;
    const col = placed.start.col + i * dCol;
    read += grid.cells[row * grid.width + col];
  }
  return read;
}

describe('generate — happy path', () => {
  it('places every word in a well-sized config; each reads back off the grid', () => {
    const config = configFromDifficulty('medium', [
      'HELLO',
      'WORLD',
      'CAT',
      'DOG',
      'GRÜßE',
    ]);
    const result = generate(config, 12345);

    expect(result.unplaceable).toEqual([]);
    expect(result.placed).toHaveLength(5);
    expect(result.grid.width).toBe(15);
    expect(result.grid.height).toBe(15);
    expect(result.grid.cells).toHaveLength(225);
    // No empty cell survives the fill.
    expect(result.grid.cells).not.toContain('');
    // Every placed word is legible on the final, filled grid.
    for (const placed of result.placed) {
      expect(readBack(result.grid, placed)).toBe(placed.word);
    }
  });
});

describe('generate — determinism', () => {
  const config = configFromDifficulty('hard', ['PLANET', 'STAR', 'MOON', 'SUN']);

  it('same (config, seed) → byte-identical GenerationResult', () => {
    const a = generate(config, 777);
    const b = generate(config, 777);
    expect(a).toEqual(b);
    expect(a.grid.cells).toEqual(b.grid.cells);
    expect(a.placed).toEqual(b.placed);
    expect(a.unplaceable).toEqual(b.unplaceable);
  });

  it('different seed → (very likely) different grid', () => {
    const a = generate(config, 1);
    const b = generate(config, 2);
    expect(a.grid.cells).not.toEqual(b.grid.cells);
  });
});

describe('generate — un-placeable reporting (never crash, never silent)', () => {
  it('reports a word longer than every grid span as un-placeable', () => {
    const config: PuzzleConfig = {
      width: 6,
      height: 6,
      directions: ['E', 'S'],
      reverse: false,
      words: ['CAT', 'ELEPHANTINE'], // 11 letters > 6-cell span
    };
    const result = generate(config, 42);

    expect(result.placed.map((p) => p.word)).toEqual(['CAT']);
    expect(result.unplaceable).toEqual(['ELEPHANTINE']);
    // Still a fully filled, valid grid despite the un-placeable word.
    expect(result.grid.cells).toHaveLength(36);
    expect(result.grid.cells).not.toContain('');
  });

  it('does not crash on an over-full word list; the surplus is reported', () => {
    // A 5×5 grid with only E/S: far more (and long) words than can fit.
    const words = Array.from({ length: 30 }, (_, i) => `WORDNUMBER${i}`);
    const result = generate(
      { width: 5, height: 5, directions: ['E', 'S'], reverse: false, words },
      9,
    );
    // Nothing silently vanished: placed + un-placeable accounts for every word.
    expect(result.placed.length + result.unplaceable.length).toBe(words.length);
    expect(result.unplaceable.length).toBeGreaterThan(0);
  });
});

describe('generate — grid-size bound is enforced (clamped, not thrown)', () => {
  it('clamps an oversized config down to the 30×30 maximum', () => {
    const result = generate(
      { width: 99, height: 99, directions: ['E'], reverse: false, words: ['HI'] },
      3,
    );
    expect(result.grid.width).toBe(GRID_SIZE_MAX);
    expect(result.grid.height).toBe(GRID_SIZE_MAX);
  });

  it('clamps an undersized config up to the 5×5 minimum', () => {
    const result = generate(
      { width: 1, height: 1, directions: ['E'], reverse: false, words: ['HI'] },
      3,
    );
    expect(result.grid.width).toBe(GRID_SIZE_MIN);
    expect(result.grid.height).toBe(GRID_SIZE_MIN);
    expect(result.grid.cells).toHaveLength(25);
  });
});
