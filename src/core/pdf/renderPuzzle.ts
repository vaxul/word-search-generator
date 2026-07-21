// Puzzle PDF renderer (Phase 4, issue #39). Turns a GenerationResult + a small
// view-model (header, font family, font size, copy count) into a jsPDF document
// laid out on DIN A4 via the pure layout math (`layout.ts`) and the embedded
// Unicode font (`registerFont.ts`), so German umlauts/ß render as real glyphs.
//
// `src/core/pdf` uses jsPDF but NO DOM APIs (constitution) and performs NO
// download — producing the document object is all this module does; the browser
// download is a feature-layer concern (#41). The block-drawing helper
// (`renderPuzzleBlock`) takes an optional `highlight` set so the solution
// renderer (#40) can reuse it to mark placed words. No `any`; named exports.
import { jsPDF } from 'jspdf';

import { DIRECTION_VECTORS } from '../grid';
import type { GenerationResult, Grid, PlacedWord } from '../model';
import type { PdfFontFamily } from './fonts/fontAssets';
import type { BlockLayout, Box } from './layout';
import { paginate } from './layout';
import { registerFont } from './registerFont';

/** Millimetres per PostScript point — jsPDF sizes fonts in pt, geometry in mm. */
const MM_PER_PT = 25.4 / 72;
/** Points per millimetre; the inverse used to fit glyphs to a cell pitch. */
const PT_PER_MM = 72 / 25.4;
/** Fraction of the cell pitch a grid glyph fills — keeps letters clear of borders. */
const GLYPH_FILL = 0.55;

/** Per-puzzle header carried into the PDF (mirrors the editor view-model). */
export interface PdfPuzzleHeader {
  readonly title: string;
  readonly theme: string;
  readonly date: string;
}

/**
 * The view-model the renderer consumes: the {@link PdfPuzzleHeader}, the app
 * font `family` (embedded as a Unicode TTF), the selected `fontSize` in points,
 * and how many `copies` of the puzzle to pack (default 1). Grid glyphs are
 * auto-fitted to the cell pitch for print legibility; the selected size drives
 * the header and word-list text.
 */
export interface PuzzleView {
  readonly header: PdfPuzzleHeader;
  readonly fontFamily: PdfFontFamily;
  readonly fontSize: number;
  readonly copies?: number;
}

/**
 * Everything needed to draw one puzzle block at its resolved {@link BlockLayout}.
 * `highlight` is optional: when present (the solution renderer, #40) each placed
 * word is marked with a stroke through its cells; the puzzle sheet omits it.
 */
export interface PuzzleBlockRender {
  readonly layout: BlockLayout;
  readonly grid: Grid;
  readonly header: PdfPuzzleHeader;
  readonly words: readonly string[];
  readonly fontName: string;
  readonly fontSizePt: number;
  readonly highlight?: readonly PlacedWord[];
}

/** Draws the block header: title (top) and a theme · date meta line (bottom). */
function drawBlockHeader(doc: jsPDF, box: Box, header: PdfPuzzleHeader, opts: {
  fontName: string;
  fontSizePt: number;
}): void {
  doc.setFont(opts.fontName, 'normal');
  doc.setTextColor(20);
  if (header.title.length > 0) {
    const titlePt = Math.min(opts.fontSizePt + 2, 16);
    doc.setFontSize(titlePt);
    doc.text(header.title, box.x, box.y + titlePt * MM_PER_PT);
  }
  const meta = [header.theme, header.date].filter((s) => s.length > 0).join('  ·  ');
  if (meta.length > 0) {
    const metaPt = Math.min(opts.fontSizePt * 0.7, 11);
    doc.setFontSize(metaPt);
    doc.text(meta, box.x, box.y + box.height - 1);
  }
}

/** Draws the grid's border lines (the square cell lattice). */
function drawGridLines(doc: jsPDF, grid: Grid, box: Box, cellPitch: number): void {
  doc.setDrawColor(150);
  doc.setLineWidth(0.2);
  for (let c = 0; c <= grid.width; c += 1) {
    const x = box.x + c * cellPitch;
    doc.line(x, box.y, x, box.y + grid.height * cellPitch);
  }
  for (let r = 0; r <= grid.height; r += 1) {
    const y = box.y + r * cellPitch;
    doc.line(box.x, y, box.x + grid.width * cellPitch, y);
  }
}

/** Draws every grid letter centred in its cell, using the embedded font. */
function drawGridLetters(doc: jsPDF, grid: Grid, box: Box, cellPitch: number, fontName: string): void {
  doc.setFont(fontName, 'normal');
  doc.setFontSize(cellPitch * PT_PER_MM * GLYPH_FILL);
  doc.setTextColor(0);
  for (let row = 0; row < grid.height; row += 1) {
    for (let col = 0; col < grid.width; col += 1) {
      const letter = grid.cells[row * grid.width + col];
      if (!letter) continue;
      const x = box.x + (col + 0.5) * cellPitch;
      const y = box.y + (row + 0.5) * cellPitch;
      doc.text(letter, x, y, { align: 'center', baseline: 'middle' });
    }
  }
}

/** Centre point (mm) of a grid cell at (row, col). */
function cellCentre(box: Box, cellPitch: number, row: number, col: number): { x: number; y: number } {
  return { x: box.x + (col + 0.5) * cellPitch, y: box.y + (row + 0.5) * cellPitch };
}

/** Marks each placed word with a rounded stroke through its cells (solution). */
function drawHighlight(doc: jsPDF, box: Box, cellPitch: number, placed: readonly PlacedWord[]): void {
  doc.setDrawColor(255, 205, 0);
  doc.setLineWidth(cellPitch * 0.72);
  doc.setLineCap('round');
  for (const word of placed) {
    const vector = DIRECTION_VECTORS[word.direction];
    const steps = Array.from(word.word).length - 1;
    const start = cellCentre(box, cellPitch, word.start.row, word.start.col);
    const end = cellCentre(box, cellPitch, word.start.row + vector.dRow * steps, word.start.col + vector.dCol * steps);
    doc.line(start.x, start.y, end.x, end.y);
  }
  doc.setLineCap('butt');
}

/** Draws the word-list-to-find below the grid, wrapped to the strip width. */
function drawWordList(doc: jsPDF, box: Box, words: readonly string[], opts: {
  fontName: string;
  fontSizePt: number;
}): void {
  if (words.length === 0) return;
  doc.setFont(opts.fontName, 'normal');
  const listPt = Math.min(opts.fontSizePt * 0.8, 11);
  doc.setFontSize(listPt);
  doc.setTextColor(40);
  const lines: string[] = doc.splitTextToSize(words.join('   '), box.width);
  const lineHeight = listPt * MM_PER_PT * 1.25;
  let y = box.y + listPt * MM_PER_PT;
  for (const line of lines) {
    if (y > box.y + box.height + 1e-9) break;
    doc.text(line, box.x, y);
    y += lineHeight;
  }
}

/**
 * Renders one puzzle block (header + letter grid + word list) into `doc` at its
 * {@link BlockLayout}. When `highlight` is supplied the placed words are marked
 * beneath the letters — the seam the solution renderer (#40) reuses.
 */
export function renderPuzzleBlock(doc: jsPDF, block: PuzzleBlockRender): void {
  const { layout, grid } = block;
  const { cellPitch } = layout;
  drawBlockHeader(doc, layout.header, block.header, {
    fontName: block.fontName,
    fontSizePt: block.fontSizePt,
  });
  drawGridLines(doc, grid, layout.grid, cellPitch);
  if (block.highlight && block.highlight.length > 0) {
    drawHighlight(doc, layout.grid, cellPitch, block.highlight);
  }
  drawGridLetters(doc, grid, layout.grid, cellPitch, block.fontName);
  drawWordList(doc, layout.wordList, block.words, {
    fontName: block.fontName,
    fontSizePt: block.fontSizePt,
  });
}

/**
 * Renders the puzzle PDF for `result` and returns the jsPDF document object (no
 * download — that is #41). Registers the embedded font, paginates `copies` of
 * the square grid per the packing tiers (≤10→4-up, 11–17→2-up, ≥18→1-up), and
 * draws each packed block with its own header + word list. The words-to-find are
 * the placed words; unplaceable words are never listed (they are not in the grid).
 */
export function renderPuzzleDoc(result: GenerationResult, view: PuzzleView): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const fontName = registerFont(doc, view.fontFamily);
  const size = result.grid.width;
  const words = result.placed.map((placed) => placed.word);
  const { pages } = paginate(size, view.copies ?? 1);
  pages.forEach((page, pageIndex) => {
    if (pageIndex > 0) doc.addPage();
    for (const layout of page.blocks) {
      renderPuzzleBlock(doc, {
        layout,
        grid: result.grid,
        header: view.header,
        words,
        fontName,
        fontSizePt: view.fontSize,
      });
    }
  });
  return doc;
}
