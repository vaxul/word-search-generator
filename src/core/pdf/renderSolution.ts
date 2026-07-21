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
import { jsPDF } from 'jspdf';

import type { GenerationResult } from '../model';
import { paginate } from './layout';
import { registerFont } from './registerFont';
import { renderPuzzleBlock, type PdfPuzzleHeader, type PuzzleView } from './renderPuzzle';

/**
 * German suffix appended to a block title on the solution sheet so it is
 * unmistakably the answer key (e.g. `Tiere` → `Tiere — Lösung`). Kept as a
 * single constant here — `src/core/pdf` is DOM/UI-free, so it takes user text
 * via the view and only owns this fixed formatting token.
 */
export const SOLUTION_TITLE_SUFFIX = ' — Lösung';

/** The solution view mirrors {@link PuzzleView}; `solutionSuffix` can override
 * {@link SOLUTION_TITLE_SUFFIX} (falls back to it when omitted). */
export interface SolutionView extends PuzzleView {
  readonly solutionSuffix?: string;
}

/** Derives the solution block header: the puzzle title tagged with the suffix
 * (or the bare suffix label when no title was entered), theme + date unchanged. */
function solutionHeader(header: PdfPuzzleHeader, suffix: string): PdfPuzzleHeader {
  const label = header.title.length > 0 ? `${header.title}${suffix}` : suffix.trim();
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
  const suffix = view.solutionSuffix ?? SOLUTION_TITLE_SUFFIX;
  const header = solutionHeader(view.header, suffix);
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
