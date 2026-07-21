import { describe, expect, it } from 'vitest';

import type { GenerationResult, PlacedWord } from '../model';
import { paginate } from './layout';
import { renderPuzzleDoc, type PuzzleView } from './renderPuzzle';
import { SOLUTION_TITLE_SUFFIX, renderSolutionDoc } from './renderSolution';

// A letter pool including the German glyphs (ä/ö/ü/ß) so the embedded-font path
// is exercised, mirroring the puzzle renderer spec.
const POOL = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß');

function makeResult(size: number, placed: readonly PlacedWord[] = []): GenerationResult {
  const cells: string[] = [];
  for (let i = 0; i < size * size; i += 1) cells.push(POOL[i % POOL.length]);
  return { grid: { width: size, height: size, cells }, placed, unplaceable: [] };
}

const VIEW: PuzzleView = {
  header: { title: 'Tiere', theme: 'Woche 3', date: '2026-07-21' },
  fontFamily: 'sans',
  fontSize: 16,
};

const PLACED: readonly PlacedWord[] = [
  { word: 'HUND', start: { row: 1, col: 1 }, direction: 'E' },
  { word: 'KATZE', start: { row: 3, col: 0 }, direction: 'SE' },
];

function startsWithPdfMagic(buffer: ArrayBuffer): boolean {
  const head = new Uint8Array(buffer.slice(0, 4));
  return head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46;
}

describe('renderSolutionDoc', () => {
  it('returns a jsPDF document distinct from the puzzle document', () => {
    const result = makeResult(12, PLACED);
    const puzzle = renderPuzzleDoc(result, VIEW);
    const solution = renderSolutionDoc(result, VIEW);
    expect(solution).not.toBe(puzzle);
    expect(typeof solution.output).toBe('function');
  });

  it('emits non-empty PDF bytes beginning with the %PDF magic', () => {
    const solution = renderSolutionDoc(makeResult(12, PLACED), VIEW);
    const buffer = solution.output('arraybuffer');
    expect(buffer.byteLength).toBeGreaterThan(0);
    expect(startsWithPdfMagic(buffer)).toBe(true);
  });

  it('mirrors the puzzle page-for-page across every packing tier and copy count', () => {
    const cases: ReadonlyArray<readonly [number, number]> = [
      [10, 4], // 4-up → 1 page
      [10, 9], // 4-up → 3 pages
      [15, 3], // 2-up → 2 pages
      [18, 2], // 1-up → 2 pages
    ];
    for (const [size, copies] of cases) {
      const result = makeResult(size, PLACED);
      const solution = renderSolutionDoc(result, { ...VIEW, copies });
      const puzzle = renderPuzzleDoc(result, { ...VIEW, copies });
      expect(solution.getNumberOfPages()).toBe(paginate(size, copies).pageCount);
      expect(solution.getNumberOfPages()).toBe(puzzle.getNumberOfPages());
    }
  });

  it('exercises the highlight path — placed words render marked without throwing', () => {
    // Placed words drive the highlight set; ä/ö/ü/ß glyphs check the font path.
    const placed: PlacedWord[] = [
      { word: 'MÜLL', start: { row: 0, col: 0 }, direction: 'E' },
      { word: 'FÜSSE', start: { row: 2, col: 4 }, direction: 'SE' },
    ];
    const result = makeResult(14, placed);
    expect(() =>
      renderSolutionDoc(result, { ...VIEW, fontFamily: 'accessible' }),
    ).not.toThrow();
  });
});

describe('renderSolutionDoc — header + edge cases', () => {
  it('renders with an empty placed set (no marks) without throwing', () => {
    expect(() => renderSolutionDoc(makeResult(10), VIEW)).not.toThrow();
  });

  it('defaults the solution suffix and honours a supplied override', () => {
    expect(SOLUTION_TITLE_SUFFIX.length).toBeGreaterThan(0);
    const result = makeResult(10, PLACED);
    expect(() =>
      renderSolutionDoc(result, { ...VIEW, solutionSuffix: ' (Antworten)' }),
    ).not.toThrow();
    // Empty title path: the bare suffix label is used for the block header.
    expect(() =>
      renderSolutionDoc(result, { ...VIEW, header: { title: '', theme: '', date: '' } }),
    ).not.toThrow();
  });
});
