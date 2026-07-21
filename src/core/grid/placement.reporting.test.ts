import { describe, expect, it } from 'vitest';
import type { Direction, PlacedWord, PuzzleConfig } from '../model';
import { DIRECTION_VECTORS } from './directions';
import { mulberry32 } from './prng';
import { placeWords } from './placement';

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

function readBack(
  cells: readonly string[],
  width: number,
  placed: PlacedWord,
): string {
  const { dRow, dCol } = DIRECTION_VECTORS[placed.direction];
  let out = '';
  for (let i = 0; i < placed.word.length; i += 1) {
    out += cells[(placed.start.row + i * dRow) * width + placed.start.col + i * dCol];
  }
  return out;
}

// --- overlap ---------------------------------------------------------------

describe('placeWords — overlap at matching letters', () => {
  it('accepts an overlap where the shared cell already holds the same letter', () => {
    // width 3, E-only: fitting both AB and BC requires sharing the middle 'B'.
    let both = null as ReturnType<typeof placeWords> | null;
    for (let seed = 0; seed < 50 && !both; seed += 1) {
      const r = placeWords(
        config({ width: 3, height: 1, words: ['AB', 'BC'], directions: ['E'] }),
        mulberry32(seed),
      );
      if (r.unplaceable.length === 0) both = r;
    }
    expect(both).not.toBeNull();
    expect(both?.cells).toEqual(['A', 'B', 'C']);
  });

  it('rejects a conflicting overlap, reporting one word un-placeable', () => {
    // width 3 cannot hold two len-2 words without overlapping; AB vs CD conflict.
    const r = placeWords(
      config({ width: 3, height: 1, words: ['AB', 'CD'], directions: ['E'] }),
      mulberry32(4),
    );
    expect(r.placed).toHaveLength(1);
    expect(r.unplaceable).toHaveLength(1);
  });
});

// --- un-placeable reporting ------------------------------------------------

describe('placeWords — un-placeable reporting', () => {
  it('reports a word longer than any grid span without crashing', () => {
    const r = placeWords(
      config({ width: 5, height: 5, words: ['ABCDEFGHIJ'], directions: [...ALL_DIRECTIONS], reverse: true }),
      mulberry32(2),
    );
    expect(r.placed).toEqual([]);
    expect(r.unplaceable).toEqual(['ABCDEFGHIJ']);
  });

  it('reports overflow words but never drops any (placed + unplaceable = input)', () => {
    const words = ['AAA', 'BBB', 'CCC', 'DDD', 'EEE', 'FFF'];
    const r = placeWords(
      config({ width: 3, height: 3, words, directions: ['E', 'S'] }),
      mulberry32(9),
    );
    expect(r.placed.length + r.unplaceable.length).toBe(words.length);
    expect(r.unplaceable.length).toBeGreaterThan(0);
  });

  it('reports an empty word as un-placeable', () => {
    const r = placeWords(config({ words: ['CAT', ''] }), mulberry32(1));
    expect(r.unplaceable).toEqual(['']);
    expect(r.placed).toHaveLength(1);
  });
});

// --- German characters -----------------------------------------------------

describe('placeWords — German umlauts and ß', () => {
  it('normalizes and places umlaut/ß words, ß as a single cell (not SS)', () => {
    const r = placeWords(
      config({ width: 12, height: 12, words: ['straße', 'Grüße', 'Öl'], directions: [...ALL_DIRECTIONS], reverse: true }),
      mulberry32(8),
    );
    expect(r.unplaceable).toEqual([]);
    const placedWords = r.placed.map((p) => p.word);
    expect(placedWords).toContain('STRAßE');
    expect(placedWords).toContain('GRÜßE');
    for (const placed of r.placed) {
      expect(readBack(r.cells, r.width, placed)).toBe(placed.word);
      expect(placed.word).not.toContain('SS');
    }
  });
});
