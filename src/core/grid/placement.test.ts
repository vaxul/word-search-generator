import { describe, expect, it } from 'vitest';
import type { Direction, PlacedWord, PuzzleConfig } from '../model';
import { DIRECTION_VECTORS } from './directions';
import { mulberry32 } from './prng';
import { EMPTY_CELL, placeWords } from './placement';

// --- helpers ---------------------------------------------------------------

const ALL_DIRECTIONS: readonly Direction[] = [
  'E',
  'W',
  'N',
  'S',
  'NE',
  'NW',
  'SE',
  'SW',
];

function config(overrides: Partial<PuzzleConfig> = {}): PuzzleConfig {
  return {
    width: 12,
    height: 12,
    directions: ['E', 'S'],
    reverse: false,
    words: [],
    ...overrides,
  };
}

/** Read a placed word straight off the grid at its reported coords/direction. */
function readBack(
  cells: readonly string[],
  width: number,
  placed: PlacedWord,
): string {
  const { dRow, dCol } = DIRECTION_VECTORS[placed.direction];
  let out = '';
  for (let i = 0; i < placed.word.length; i += 1) {
    const row = placed.start.row + i * dRow;
    const col = placed.start.col + i * dCol;
    out += cells[row * width + col];
  }
  return out;
}

// --- all words placed + read-back ------------------------------------------

describe('placeWords — placement + read-back', () => {
  it('places every word of a well-sized config and reads back correctly', () => {
    const words = ['CAT', 'DOG', 'BIRD', 'FISH', 'HORSE'];
    const result = placeWords(
      config({ words, directions: [...ALL_DIRECTIONS], reverse: true }),
      mulberry32(1),
    );
    expect(result.unplaceable).toEqual([]);
    expect(result.placed).toHaveLength(words.length);
    for (const placed of result.placed) {
      expect(readBack(result.cells, result.width, placed)).toBe(placed.word);
    }
  });

  it('leaves non-word cells empty (fill is a later issue)', () => {
    const result = placeWords(config({ words: ['CAT'] }), mulberry32(3));
    const occupied = result.cells.filter((c) => c !== EMPTY_CELL).length;
    expect(occupied).toBe(3);
    expect(result.cells).toHaveLength(result.width * result.height);
  });
});

// --- determinism -----------------------------------------------------------

describe('placeWords — determinism', () => {
  const words = ['ALPHA', 'BETA', 'GAMMA', 'DELTA'];
  const cfg = config({ words, directions: [...ALL_DIRECTIONS], reverse: true });

  it('is byte-identical for the same (config, seed)', () => {
    const a = placeWords(cfg, mulberry32(42));
    const b = placeWords(cfg, mulberry32(42));
    expect(a.cells).toEqual(b.cells);
    expect(a.placed).toEqual(b.placed);
    expect(a.unplaceable).toEqual(b.unplaceable);
  });

  it('very likely differs for a different seed', () => {
    const a = placeWords(cfg, mulberry32(1));
    const b = placeWords(cfg, mulberry32(999));
    expect(a.cells).not.toEqual(b.cells);
  });
});

// --- per-direction enable/disable ------------------------------------------

describe('placeWords — direction control', () => {
  it('honors a single enabled direction for every placed word', () => {
    for (const only of ALL_DIRECTIONS) {
      const result = placeWords(
        config({ width: 10, height: 10, words: ['ABCDE'], directions: [only] }),
        mulberry32(7),
      );
      expect(result.unplaceable).toEqual([]);
      expect(result.placed[0]?.direction).toBe(only);
    }
  });

  it('never uses a disabled direction', () => {
    const result = placeWords(
      config({ words: ['AB', 'CD', 'EF'], directions: ['E'], reverse: false }),
      mulberry32(5),
    );
    for (const placed of result.placed) {
      expect(placed.direction).toBe('E');
    }
  });
});

// --- reverse ---------------------------------------------------------------

describe('placeWords — reverse', () => {
  // Scan several seeds and collect which directions the single placed word ran.
  function directionsSeen(reverse: boolean): Set<Direction> {
    const seen = new Set<Direction>();
    for (let seed = 0; seed < 30; seed += 1) {
      const result = placeWords(
        config({ words: ['ABCDE'], directions: ['E'], reverse }),
        mulberry32(seed),
      );
      for (const placed of result.placed) {
        expect(readBack(result.cells, result.width, placed)).toBe(placed.word);
        seen.add(placed.direction);
      }
    }
    return seen;
  }

  it('places words backward (W) when reverse is on for an E-only config', () => {
    const seen = directionsSeen(true);
    expect(seen.has('W')).toBe(true); // backward placement actually happens
    expect([...seen].every((d) => d === 'E' || d === 'W')).toBe(true);
  });

  it('never places backward when reverse is off', () => {
    const seen = directionsSeen(false);
    expect([...seen]).toEqual(['E']); // only the forward direction, never W
  });
});
