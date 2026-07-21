import { describe, expect, it } from 'vitest';
import { mulberry32, seedFromString } from './prng';

const take = (fn: () => number, n: number): number[] =>
  Array.from({ length: n }, () => fn());

describe('mulberry32', () => {
  it('is deterministic: the same seed yields the same sequence', () => {
    const a = take(mulberry32(12345), 20);
    const b = take(mulberry32(12345), 20);
    expect(a).toEqual(b);
  });

  it('produces different sequences for different seeds', () => {
    const a = take(mulberry32(1), 20);
    const b = take(mulberry32(2), 20);
    expect(a).not.toEqual(b);
  });

  it('yields floats in the half-open range [0, 1)', () => {
    const values = take(mulberry32(999), 500);
    for (const value of values) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('advances state: successive draws are not all identical', () => {
    const [first, second, third] = take(mulberry32(42), 3);
    expect(new Set([first, second, third]).size).toBe(3);
  });

  it('normalizes seed representation (>>>0): equal 32-bit seeds match', () => {
    // 0 and 2**32 collapse to the same unsigned 32-bit state.
    expect(take(mulberry32(0), 5)).toEqual(take(mulberry32(2 ** 32), 5));
  });
});

describe('seedFromString', () => {
  it('is deterministic for the same input', () => {
    expect(seedFromString('Katze')).toBe(seedFromString('Katze'));
  });

  it('differs for different inputs', () => {
    expect(seedFromString('Katze')).not.toBe(seedFromString('Hund'));
  });

  it('returns an unsigned 32-bit integer', () => {
    const seed = seedFromString('irgendein-schlüssel');
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
    expect(seed).toBeLessThan(2 ** 32);
  });

  it('feeds mulberry32 to give a reproducible sequence from a string key', () => {
    const seq1 = take(mulberry32(seedFromString('grid-1')), 10);
    const seq2 = take(mulberry32(seedFromString('grid-1')), 10);
    expect(seq1).toEqual(seq2);
  });
});
