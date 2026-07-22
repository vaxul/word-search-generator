import { describe, expect, it } from 'vitest';
import { solutionMarks } from './solutionMarks';

describe('solutionMarks', () => {
  it('spans a horizontal word from its first to its last cell centre', () => {
    const [mark] = solutionMarks([
      { word: 'ABC', start: { row: 0, col: 0 }, direction: 'E' },
    ]);
    expect(mark.word).toBe('ABC');
    // First cell (0,0) centre and last cell (0,2) centre, in cell units.
    expect(mark.start).toEqual({ col: 0.5, row: 0.5 });
    expect(mark.end).toEqual({ col: 2.5, row: 0.5 });
  });

  it('walks the engine step vector for a diagonal word', () => {
    // SE from (0,0): last cell is (2,2).
    const [mark] = solutionMarks([
      { word: 'AEI', start: { row: 0, col: 0 }, direction: 'SE' },
    ]);
    expect(mark.start).toEqual({ col: 0.5, row: 0.5 });
    expect(mark.end).toEqual({ col: 2.5, row: 2.5 });
  });

  it('handles a reverse placement (stored as the opposite direction)', () => {
    // Reverse of an eastward word is stored as W: from (0,2) walking W ends at
    // (0,0).
    const [mark] = solutionMarks([
      { word: 'CBA', start: { row: 0, col: 2 }, direction: 'W' },
    ]);
    expect(mark.start).toEqual({ col: 2.5, row: 0.5 });
    expect(mark.end).toEqual({ col: 0.5, row: 0.5 });
  });

  it('produces one distinct mark per word, even when words overlap', () => {
    const marks = solutionMarks([
      { word: 'ABC', start: { row: 0, col: 0 }, direction: 'E' },
      { word: 'AD', start: { row: 0, col: 0 }, direction: 'S' },
    ]);
    // Two words -> two marks (no de-duplication that would blur them into one).
    expect(marks).toHaveLength(2);
    expect(marks[0].end).toEqual({ col: 2.5, row: 0.5 });
    expect(marks[1].end).toEqual({ col: 0.5, row: 1.5 });
  });

  it('returns no marks when nothing was placed', () => {
    expect(solutionMarks([])).toHaveLength(0);
  });

  it('places a single-letter word mark on its own cell centre', () => {
    const [mark] = solutionMarks([
      { word: 'A', start: { row: 1, col: 1 }, direction: 'E' },
    ]);
    expect(mark.start).toEqual({ col: 1.5, row: 1.5 });
    expect(mark.end).toEqual({ col: 1.5, row: 1.5 });
  });
});
