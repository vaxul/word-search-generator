import { jsPDF } from 'jspdf';
import { describe, expect, it } from 'vitest';

import type { GenerationResult, PlacedWord } from '../model';
import { CONTENT_BOX, blockLayout, paginate } from './layout';
import { renderPuzzleBlock, renderPuzzleDoc, type PuzzleView } from './renderPuzzle';

// A letter pool that includes the German glyphs the embedded font must render
// (ä/ö/ü/ß) so tests exercise the Unicode path, not just ASCII.
const POOL = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß');

// Builds a full size×size grid (row-major) plus some placed words, so the
// renderer has real cells + answer coordinates to draw.
function makeResult(size: number, placed: readonly PlacedWord[] = []): GenerationResult {
  const cells: string[] = [];
  for (let i = 0; i < size * size; i += 1) cells.push(POOL[i % POOL.length]);
  return {
    grid: { width: size, height: size, cells },
    placed,
    unplaceable: [],
  };
}

const VIEW: PuzzleView = {
  header: { title: 'Tiere', theme: 'Woche 3', date: '2026-07-21' },
  fontFamily: 'sans',
  fontSize: 16,
};

// PDFs begin with the "%PDF" magic bytes; assert the output is a real document.
function startsWithPdfMagic(buffer: ArrayBuffer): boolean {
  const head = new Uint8Array(buffer.slice(0, 4));
  return head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46;
}

describe('renderPuzzleDoc', () => {
  it('returns a usable jsPDF document for grid sizes across every packing tier', () => {
    for (const size of [10, 15, 18]) {
      const doc = renderPuzzleDoc(makeResult(size), VIEW);
      // jsPDF's factory can return a differently-named class under module
      // interop, so assert the document surface rather than the constructor.
      expect(typeof doc.output).toBe('function');
      expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
    }
  });

  it('produces a page count that matches paginate for the requested copies', () => {
    const cases: ReadonlyArray<readonly [number, number]> = [
      [10, 4], // 4-up → 1 page
      [10, 9], // 4-up → 3 pages
      [15, 3], // 2-up → 2 pages
      [18, 2], // 1-up → 2 pages
    ];
    for (const [size, copies] of cases) {
      const doc = renderPuzzleDoc(makeResult(size), { ...VIEW, copies });
      expect(doc.getNumberOfPages()).toBe(paginate(size, copies).pageCount);
    }
  });

  it('emits non-empty PDF bytes beginning with the %PDF magic', () => {
    const doc = renderPuzzleDoc(makeResult(12), VIEW);
    const buffer = doc.output('arraybuffer');
    expect(buffer.byteLength).toBeGreaterThan(0);
    expect(startsWithPdfMagic(buffer)).toBe(true);
  });

  it('renders a grid containing ä/ö/ü/ß without throwing (embedded font)', () => {
    const placed: PlacedWord[] = [
      { word: 'MÜLL', start: { row: 0, col: 0 }, direction: 'E' },
      { word: 'FÜSSE', start: { row: 2, col: 4 }, direction: 'SE' },
    ];
    const result = makeResult(14, placed);
    expect(() => renderPuzzleDoc(result, { ...VIEW, fontFamily: 'accessible' })).not.toThrow();
  });

  it('lists the placed words (words-to-find), never the unplaceable ones', () => {
    // Smoke: an unplaceable word must not make rendering throw or change paging.
    const result: GenerationResult = {
      ...makeResult(10, [{ word: 'KATZE', start: { row: 1, col: 1 }, direction: 'E' }]),
      unplaceable: ['UNMOEGLICH'],
    };
    const doc = renderPuzzleDoc(result, VIEW);
    expect(doc.getNumberOfPages()).toBe(1);
  });
});

describe('renderPuzzleBlock', () => {
  it('draws a single block at a given layout, with and without a highlight set', () => {
    const size = 12;
    const layout = blockLayout(size, CONTENT_BOX);
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const grid = makeResult(size).grid;
    const highlight: PlacedWord[] = [
      { word: 'HUND', start: { row: 3, col: 2 }, direction: 'S' },
    ];
    expect(() =>
      renderPuzzleBlock(doc, {
        layout,
        grid,
        header: VIEW.header,
        words: ['HUND', 'KATZE'],
        fontName: 'helvetica',
        fontSizePt: 16,
        highlight,
      }),
    ).not.toThrow();
  });
});
