// Reducer unit tests (issue #30): the store transitions are the Phase 3
// foundation the later editor/generate/solution issues dispatch, so they are
// verified now even though the shell UI does not yet dispatch them. Split across
// two describe blocks to keep each callback within the 50-line function bound.
import { describe, expect, it } from 'vitest';
import { DIFFICULTY_PRESETS, type GenerationResult } from '../core';
import { appReducer, initialState } from './state';

describe('appReducer config', () => {
  it('seeds size + directions + reverse from the selected difficulty preset', () => {
    const next = appReducer(initialState, {
      type: 'selectDifficulty',
      difficulty: 'hard',
    });
    const preset = DIFFICULTY_PRESETS.hard;
    expect(next.config.difficulty).toBe('hard');
    expect(next.config.size).toBe(preset.width);
    expect(next.config.directions).toEqual(preset.directions);
    expect(next.config.reverse).toBe(preset.reverse);
  });

  it('clamps a manual size to the 5-30 grid bound', () => {
    expect(appReducer(initialState, { type: 'setSize', size: 99 }).config.size).toBe(30);
    expect(appReducer(initialState, { type: 'setSize', size: 1 }).config.size).toBe(5);
  });

  it('toggles a direction on and back off, preserving the rest', () => {
    const added = appReducer(initialState, {
      type: 'toggleDirection',
      direction: 'W',
    });
    expect(added.config.directions).toContain('W');
    const removed = appReducer(added, { type: 'toggleDirection', direction: 'W' });
    expect(removed.config.directions).not.toContain('W');
    expect(removed.config.directions).toEqual(initialState.config.directions);
  });
});

describe('appReducer view-model + result', () => {
  it('updates the words, reverse flag, a header field, and the font', () => {
    expect(appReducer(initialState, { type: 'setWords', words: 'KATZE' }).words).toBe(
      'KATZE',
    );
    expect(
      appReducer(initialState, { type: 'setReverse', reverse: true }).config.reverse,
    ).toBe(true);
    expect(
      appReducer(initialState, {
        type: 'setHeaderField',
        field: 'title',
        value: 'Tiere',
      }).header.title,
    ).toBe('Tiere');
    const fonted = appReducer(initialState, { type: 'setFontFamily', family: 'sans' });
    expect(appReducer(fonted, { type: 'setFontSize', size: 24 }).font).toEqual({
      family: 'sans',
      size: 24,
    });
  });

  it('stores and clears the latest generation result', () => {
    const result: GenerationResult = {
      grid: { width: 5, height: 5, cells: [] },
      placed: [],
      unplaceable: [],
    };
    const withResult = appReducer(initialState, { type: 'setResult', result });
    expect(withResult.result).toBe(result);
    expect(appReducer(withResult, { type: 'setResult', result: null }).result).toBeNull();
  });

  it('does not mutate the previous state (returns a new object)', () => {
    const next = appReducer(initialState, { type: 'setWords', words: 'X' });
    expect(next).not.toBe(initialState);
    expect(initialState.words).toBe('');
  });
});
