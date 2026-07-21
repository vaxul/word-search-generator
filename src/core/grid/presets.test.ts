import { describe, expect, it } from 'vitest';

import type { Difficulty } from '../model';
import {
  clampGridSize,
  configFromDifficulty,
  DIFFICULTY_PRESETS,
  GRID_SIZE_MAX,
  GRID_SIZE_MIN,
} from './presets';

describe('DIFFICULTY_PRESETS — the gate-resolved mapping', () => {
  it('Easy is 12×12, H+V (E, S), reverse off', () => {
    expect(DIFFICULTY_PRESETS.easy).toEqual({
      width: 12,
      height: 12,
      directions: ['E', 'S'],
      reverse: false,
    });
  });

  it('Medium is 15×15, +diagonals (E, S, SE, NE), reverse off', () => {
    expect(DIFFICULTY_PRESETS.medium).toEqual({
      width: 15,
      height: 15,
      directions: ['E', 'S', 'SE', 'NE'],
      reverse: false,
    });
  });

  it('Hard is 18×18, all 8 directions, reverse on', () => {
    expect(DIFFICULTY_PRESETS.hard).toEqual({
      width: 18,
      height: 18,
      directions: ['E', 'W', 'N', 'S', 'NE', 'NW', 'SE', 'SW'],
      reverse: true,
    });
  });

  it('every preset size sits within the 5–30 bound', () => {
    for (const preset of Object.values(DIFFICULTY_PRESETS)) {
      expect(preset.width).toBeGreaterThanOrEqual(GRID_SIZE_MIN);
      expect(preset.width).toBeLessThanOrEqual(GRID_SIZE_MAX);
      expect(preset.height).toBeGreaterThanOrEqual(GRID_SIZE_MIN);
      expect(preset.height).toBeLessThanOrEqual(GRID_SIZE_MAX);
    }
  });
});

describe('clampGridSize — the 5–30 bound', () => {
  it('passes an in-range size through unchanged', () => {
    expect(clampGridSize(12)).toBe(12);
    expect(clampGridSize(GRID_SIZE_MIN)).toBe(5);
    expect(clampGridSize(GRID_SIZE_MAX)).toBe(30);
  });

  it('clamps below the minimum up to 5 and above the maximum down to 30', () => {
    expect(clampGridSize(2)).toBe(GRID_SIZE_MIN);
    expect(clampGridSize(0)).toBe(GRID_SIZE_MIN);
    expect(clampGridSize(-4)).toBe(GRID_SIZE_MIN);
    expect(clampGridSize(999)).toBe(GRID_SIZE_MAX);
  });

  it('truncates fractional sizes and falls back to the minimum for non-finite', () => {
    expect(clampGridSize(12.9)).toBe(12);
    expect(clampGridSize(Number.NaN)).toBe(GRID_SIZE_MIN);
    expect(clampGridSize(Number.POSITIVE_INFINITY)).toBe(GRID_SIZE_MIN);
  });
});

describe('configFromDifficulty', () => {
  const difficulties: readonly Difficulty[] = ['easy', 'medium', 'hard'];

  it('folds each preset plus a word list into a PuzzleConfig', () => {
    for (const difficulty of difficulties) {
      const preset = DIFFICULTY_PRESETS[difficulty];
      const config = configFromDifficulty(difficulty, ['CAT', 'DOG']);
      expect(config).toEqual({
        width: preset.width,
        height: preset.height,
        directions: preset.directions,
        reverse: preset.reverse,
        words: ['CAT', 'DOG'],
      });
    }
  });

  it('applies a clamped square size override when given', () => {
    const config = configFromDifficulty('easy', ['CAT'], 20);
    expect(config.width).toBe(20);
    expect(config.height).toBe(20);
    // Preset direction set + reverse are untouched by the override.
    expect(config.directions).toEqual(DIFFICULTY_PRESETS.easy.directions);
    expect(config.reverse).toBe(false);
  });

  it('clamps an out-of-bounds size override into the 5–30 bound', () => {
    expect(configFromDifficulty('hard', ['CAT'], 100).width).toBe(GRID_SIZE_MAX);
    expect(configFromDifficulty('hard', ['CAT'], 1).height).toBe(GRID_SIZE_MIN);
  });
});
