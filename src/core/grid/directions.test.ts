import { describe, expect, it } from 'vitest';
import type { Direction } from '../model';
import {
  DIRECTIONS,
  DIRECTION_VECTORS,
  oppositeDirection,
  reverseVector,
} from './directions';

describe('DIRECTIONS', () => {
  it('contains exactly the eight compass directions, no duplicates', () => {
    expect(DIRECTIONS).toHaveLength(8);
    expect(new Set(DIRECTIONS).size).toBe(8);
    expect([...DIRECTIONS].sort()).toEqual(
      ['E', 'N', 'NE', 'NW', 'S', 'SE', 'SW', 'W'].sort(),
    );
  });
});

describe('DIRECTION_VECTORS', () => {
  it('maps each direction to the correct (dRow, dCol) step', () => {
    expect(DIRECTION_VECTORS.E).toEqual({ dRow: 0, dCol: 1 });
    expect(DIRECTION_VECTORS.W).toEqual({ dRow: 0, dCol: -1 });
    expect(DIRECTION_VECTORS.N).toEqual({ dRow: -1, dCol: 0 });
    expect(DIRECTION_VECTORS.S).toEqual({ dRow: 1, dCol: 0 });
    expect(DIRECTION_VECTORS.NE).toEqual({ dRow: -1, dCol: 1 });
    expect(DIRECTION_VECTORS.NW).toEqual({ dRow: -1, dCol: -1 });
    expect(DIRECTION_VECTORS.SE).toEqual({ dRow: 1, dCol: 1 });
    expect(DIRECTION_VECTORS.SW).toEqual({ dRow: 1, dCol: -1 });
  });

  it('every direction is a unit step (|d| ≤ 1 on each axis, non-zero)', () => {
    for (const dir of DIRECTIONS) {
      const { dRow, dCol } = DIRECTION_VECTORS[dir];
      expect(Math.abs(dRow)).toBeLessThanOrEqual(1);
      expect(Math.abs(dCol)).toBeLessThanOrEqual(1);
      expect(dRow === 0 && dCol === 0).toBe(false);
    }
  });
});

describe('reverseVector', () => {
  it('negates both axes', () => {
    expect(reverseVector({ dRow: -1, dCol: 1 })).toEqual({ dRow: 1, dCol: -1 });
    expect(reverseVector({ dRow: 0, dCol: -1 })).toEqual({ dRow: 0, dCol: 1 });
  });

  it('matches the opposite direction vector for every direction', () => {
    for (const dir of DIRECTIONS) {
      const reversed = reverseVector(DIRECTION_VECTORS[dir]);
      expect(reversed).toEqual(DIRECTION_VECTORS[oppositeDirection(dir)]);
    }
  });
});

describe('oppositeDirection', () => {
  it('mirrors each compass point', () => {
    const pairs: [Direction, Direction][] = [
      ['E', 'W'],
      ['N', 'S'],
      ['NE', 'SW'],
      ['NW', 'SE'],
    ];
    for (const [a, b] of pairs) {
      expect(oppositeDirection(a)).toBe(b);
      expect(oppositeDirection(b)).toBe(a);
    }
  });

  it('is involutive: applying it twice returns the original', () => {
    for (const dir of DIRECTIONS) {
      expect(oppositeDirection(oppositeDirection(dir))).toBe(dir);
    }
  });
});
