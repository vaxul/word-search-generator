// Solution PDF renderer (Phase 4, issue #40). Produces the SEPARATE solution
// document for a GenerationResult: the same A4 packing/layout as the puzzle
// (`renderPuzzleDoc`), but every placed word is MARKED with the accent stroke
// via the reused `renderPuzzleBlock` `highlight` seam (#39), and each block's
// title carries a solution suffix so the sheet reads as the answer key.
//
// Prior decision (docs/specs/spec-pdf-export.md): the solution is its OWN jsPDF
// file (`-loesung`), never appended to the puzzle — so this returns a document
// object distinct from `renderPuzzleDoc`'s. Like the puzzle renderer this lives
// in `src/core/pdf`: jsPDF but NO DOM, NO download (that is #41). No `any`;
// named exports. The highlighted cells are computed inside `renderPuzzleBlock`
// from each `PlacedWord` (start + `DIRECTION_VECTORS[direction]`), so no cell
// math is duplicated here and nothing is imported from `src/features`.
//
// The German "Lösung" label is NOT owned here: `src/core` holds no user-facing
// UI text (constitution — German strings live only in `src/strings/`). The
// caller supplies the suffix as plain data via `SolutionView.solutionSuffix`,
// exactly as the header title/theme/date already flow into the renderer.
import { jsPDF } from 'jspdf';

import type { GenerationResult } from '../model';
import { paginate } from './layout';
import { registerFont } from './registerFont';
import { renderPuzzleBlock, type PdfPuzzleHeader, type PuzzleView } from './renderPuzzle';

/**
 * The solution view mirrors {@link PuzzleView} plus `solutionSuffix`: the text
 * tagged onto each block title so the sheet reads as the answer key (e.g.
 * `Tiere` → `Tiere — Lösung`). Required and supplied by the caller from
 * `src/strings/` — core owns no German UI literal.
 */
export interface SolutionView extends PuzzleView {
  readonly solutionSuffix: string;
}

/** Strips the leading connector from the suffix so the bare label survives when
 * no title precedes it: a run of whitespace and separator glyphs (– — - ·) at
 * the start is removed, turning `" — Lösung"` into `"Lösung"`. Core stays
 * string-free — the label itself is caller-supplied data, never a literal. */
function bareSuffixLabel(suffix: string): string {
  return suffix.replace(/^[\s–—‒‐·-]+/u, '');
}

/** Derives the solution block header: the puzzle title tagged with the suffix
 * (or the bare suffix label, leading separator dropped, when no title was
 * entered), theme + date kept. Exported for unit coverage of both branches. */
export function solutionHeader(header: PdfPuzzleHeader, suffix: string): PdfPuzzleHeader {
  const label = header.title.length > 0 ? `${header.title}${suffix}` : bareSuffixLabel(suffix);
  return { ...header, title: label };
}

/**
 * Renders the solution PDF for `result` and returns a jsPDF document object that
 * is DISTINCT from the puzzle document (no download — that is #41). Uses the same
 * `paginate` packing and per-block layout as {@link renderPuzzleDoc} so the
 * solution mirrors the puzzle page-for-page, but passes the placed words as the
 * `highlight` set so each is marked with the accent stroke, and tags each block
 * title with the solution suffix. The answer list is the placed words
 * (`result.placed`); unplaceable words are never drawn (they are not in the grid).
 */
export function renderSolutionDoc(result: GenerationResult, view: SolutionView): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const fontName = registerFont(doc, view.fontFamily);
  const size = result.grid.width;
  const words = result.placed.map((placed) => placed.word);
  const header = solutionHeader(view.header, view.solutionSuffix);
  const { pages } = paginate(size, view.copies ?? 1);
  pages.forEach((page, pageIndex) => {
    if (pageIndex > 0) doc.addPage();
    for (const layout of page.blocks) {
      renderPuzzleBlock(doc, {
        layout,
        grid: result.grid,
        header,
        words,
        fontName,
        fontSizePt: view.fontSize,
        highlight: result.placed,
      });
    }
  });
  return doc;
}
