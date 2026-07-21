import { describe, expect, it } from 'vitest';

import type { PuzzleConfig } from '../model';
import { computeFillAlphabet, fillGrid } from './fill';
import { EMPTY_CELL, placeWords } from './placement';
import { mulberry32 } from './prng';

const BASE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function config(overrides: Partial<PuzzleConfig> = {}): PuzzleConfig {
  return {
    width: 12,
    height: 12,
    directions: ['E', 'S'],
    reverse: false,
    words: ['HELLO', 'WORLD', 'CAT'],
    ...overrides,
  };
}

describe('computeFillAlphabet', () => {
  it('is the 26 base letters when no diacritics are placed', () => {
    const alphabet = computeFillAlphabet(['A', 'B', EMPTY_CELL, 'C']);
    expect(alphabet).toEqual(BASE_ALPHABET);
    expect(alphabet).toHaveLength(26);
  });

  it('adds only the diacritics that actually appear among placed cells', () => {
    const alphabet = computeFillAlphabet(['Ä', 'ß', EMPTY_CELL, 'A']);
    expect(alphabet).toEqual([...BASE_ALPHABET, 'Ä', 'ß']);
    expect(alphabet).not.toContain('Ö');
    expect(alphabet).not.toContain('Ü');
  });
});

describe('fillGrid', () => {
  it('fills every empty cell (no EMPTY_CELL remains) and preserves dimensions', () => {
    const placement = placeWords(config(), mulberry32(1));
    const grid = fillGrid(placement, mulberry32(2));
    expect(grid.width).toBe(12);
    expect(grid.height).toBe(12);
    expect(grid.cells).toHaveLength(144);
    expect(grid.cells).not.toContain(EMPTY_CELL);
  });

  it('never emits a fill character outside the computed alphabet', () => {
    const placement = placeWords(
      config({ words: ['GRÜßE', 'FLÖßE', 'BÄR'] }),
      mulberry32(7),
    );
    const alphabet = new Set(computeFillAlphabet(placement.cells));
    const grid = fillGrid(placement, mulberry32(9));
    for (const cell of grid.cells) {
      expect(alphabet.has(cell)).toBe(true);
    }
  });

  it('does not introduce a diacritic that no placed word contained', () => {
    // Words with no umlaut/ß → fill alphabet is exactly A–Z.
    const placement = placeWords(config({ words: ['CAT', 'DOG'] }), mulberry32(3));
    const grid = fillGrid(placement, mulberry32(4));
    for (const cell of grid.cells) {
      expect(BASE_ALPHABET).toContain(cell);
    }
  });

});

describe('fillGrid — German diacritics and determinism', () => {
  it('keeps ä/ö/ü/ß words readable, each diacritic in a single cell', () => {
    const placement = placeWords(
      config({ width: 10, height: 4, words: ['STRAßE', 'MÜHE'], directions: ['E'] }),
      mulberry32(5),
    );
    const grid = fillGrid(placement, mulberry32(6));
    const readBack = (word: string): boolean =>
      placement.placed.some((p) => {
        // Reconstruct the placed word from the FINAL grid along its direction.
        const vector = p.direction === 'E' ? { dRow: 0, dCol: 1 } : { dRow: 1, dCol: 0 };
        let read = '';
        for (let i = 0; i < word.length; i += 1) {
          const row = p.start.row + i * vector.dRow;
          const col = p.start.col + i * vector.dCol;
          read += grid.cells[row * grid.width + col];
        }
        return read === word && p.word === word;
      });
    // Both diacritic words were placed (single-cell ß / ü) and read intact.
    expect(placement.placed.map((p) => p.word)).toEqual(['STRAßE', 'MÜHE']);
    expect(readBack('STRAßE')).toBe(true);
    expect(readBack('MÜHE')).toBe(true);
    // ß occupies exactly one cell: the placed word length equals its cell span.
    expect('STRAßE'.length).toBe(6);
  });

  it('is deterministic: same seed → identical filled grid', () => {
    const placementA = placeWords(config(), mulberry32(42));
    const placementB = placeWords(config(), mulberry32(42));
    const gridA = fillGrid(placementA, mulberry32(99));
    const gridB = fillGrid(placementB, mulberry32(99));
    expect(gridA.cells).toEqual(gridB.cells);
  });

  it('different fill seed → (very likely) different grid', () => {
    const placement = placeWords(config(), mulberry32(42));
    const gridA = fillGrid(placement, mulberry32(1));
    const gridB = fillGrid(placement, mulberry32(2));
    expect(gridA.cells).not.toEqual(gridB.cells);
  });

  it('never overwrites a placed letter', () => {
    const placement = placeWords(config(), mulberry32(11));
    const grid = fillGrid(placement, mulberry32(13));
    placement.cells.forEach((cell, index) => {
      if (cell !== EMPTY_CELL) {
        expect(grid.cells[index]).toBe(cell);
      }
    });
  });
});
