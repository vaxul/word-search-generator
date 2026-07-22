import { describe, expect, it } from 'vitest';

import type { GenerationResult, PlacedWord } from '../model';
import { paginate } from './layout';
import { renderPuzzleDoc, type PuzzleView } from './renderPuzzle';
import { renderSolutionDoc, solutionHeader, type SolutionView } from './renderSolution';

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

// The solution suffix is supplied as plain data by the caller (from src/strings
// in the app) — core owns no German literal. Tests pass it explicitly.
const SOL_VIEW: SolutionView = { ...VIEW, solutionSuffix: ' — Lösung' };

// The block header text the puzzle must use to match the solution 1:1 (title +
// suffix), isolating the highlight strokes as the only content-stream diff.
const SUFFIXED_HEADER = {
  ...SOL_VIEW.header,
  title: `${SOL_VIEW.header.title}${SOL_VIEW.solutionSuffix}`,
};
const bytes = (doc: { output(t: 'arraybuffer'): ArrayBuffer }): number =>
  doc.output('arraybuffer').byteLength;

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
    const solution = renderSolutionDoc(result, SOL_VIEW);
    expect(solution).not.toBe(puzzle);
    expect(typeof solution.output).toBe('function');
  });

  it('emits non-empty PDF bytes beginning with the %PDF magic', () => {
    const solution = renderSolutionDoc(makeResult(12, PLACED), SOL_VIEW);
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
      const solution = renderSolutionDoc(result, { ...SOL_VIEW, copies });
      const puzzle = renderPuzzleDoc(result, { ...VIEW, copies });
      expect(solution.getNumberOfPages()).toBe(paginate(size, copies).pageCount);
      expect(solution.getNumberOfPages()).toBe(puzzle.getNumberOfPages());
    }
  });

  it('marks the placed words — the highlight strokes enlarge the content stream', () => {
    // Placed words drive the highlight set; ä/ö/ü/ß glyphs check the font path.
    const placed: PlacedWord[] = [
      { word: 'MÜLL', start: { row: 0, col: 0 }, direction: 'E' },
      { word: 'FÜSSE', start: { row: 2, col: 4 }, direction: 'SE' },
    ];
    const result = makeResult(14, placed);
    const solution = renderSolutionDoc(result, { ...SOL_VIEW, fontFamily: 'accessible' });
    // A puzzle with the identical header text + word list but NO marks: the only
    // content difference is the highlight strokes, so the solution is larger.
    const puzzle = renderPuzzleDoc(result, {
      ...VIEW,
      fontFamily: 'accessible',
      header: SUFFIXED_HEADER,
    });
    expect(bytes(solution)).toBeGreaterThan(bytes(puzzle));
  });
});

describe('renderSolutionDoc — header + edge cases', () => {
  it('draws no highlight when the placed set is empty (matches the plain puzzle)', () => {
    const result = makeResult(10);
    const solution = renderSolutionDoc(result, SOL_VIEW);
    const puzzle = renderPuzzleDoc(result, { ...VIEW, header: SUFFIXED_HEADER });
    // No placed words → no highlight and no word list: identical to the puzzle.
    expect(bytes(solution)).toBe(bytes(puzzle));
  });

  it('with a title, keeps the separator: "<title> — Lösung"', () => {
    const header = solutionHeader(SOL_VIEW.header, SOL_VIEW.solutionSuffix);
    expect(header.title).toBe('Tiere — Lösung');
  });

  it('with no title, drops the leading separator: bare "Lösung"', () => {
    const header = solutionHeader({ title: '', theme: '', date: '' }, ' — Lösung');
    expect(header.title).toBe('Lösung');
    expect(header.title.startsWith('—')).toBe(false);
    expect(header.title.startsWith('-')).toBe(false);
    expect(header.title.startsWith(' ')).toBe(false);
  });

  it('honours the supplied suffix and the empty-title (bare label) path', () => {
    const result = makeResult(10, PLACED);
    expect(() =>
      renderSolutionDoc(result, { ...SOL_VIEW, solutionSuffix: ' (Antworten)' }),
    ).not.toThrow();
    // Empty title path: the trimmed suffix label is used for the block header.
    expect(() =>
      renderSolutionDoc(result, { ...SOL_VIEW, header: { title: '', theme: '', date: '' } }),
    ).not.toThrow();
  });
});
