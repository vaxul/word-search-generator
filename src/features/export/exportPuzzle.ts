// Export orchestration (issue #41): render the current GenerationResult to the
// puzzle PDF and a genuinely SEPARATE solution PDF via the core renderers, then
// download the two files (`<name>-raetsel.pdf` + `<name>-loesung.pdf`). Prior
// decision (docs/specs/spec-pdf-export.md): two distinct files, never one merged
// document. This module imports `src/core` (the renderers) and the feature-layer
// download helper only — never the reverse. No `any`; named exports.
import {
  renderPuzzleDoc,
  renderSolutionDoc,
  type GenerationResult,
  type PuzzleView,
  type SolutionView,
} from '../../core';
import { downloadPdf } from './download';

/** Filename fragments (from `src/strings/`) used to build the two download names. */
export interface ExportFilenameParts {
  readonly fallback: string;
  readonly puzzleSuffix: string;
  readonly solutionSuffix: string;
  readonly extension: string;
}

/**
 * Turns a puzzle title into a safe filename stem: strips combining diacritics
 * (ae/oe/ue reduce to a/o/u), maps sz-ligature to `ss` (it has no NFKD
 * decomposition), lowercases, and collapses every non-`[a-z0-9]` run into a
 * single hyphen (trimmed). Returns `fallback` when the result is empty. Every
 * pattern is ASCII-escaped (`\u0300..`) so no non-ASCII literal lives outside
 * `src/strings/` (constitution backstop).
 */
export function sanitizeFilenameStem(title: string, fallback: string): string {
  const stem = title
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u00df/g, 'ss')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return stem.length > 0 ? stem : fallback;
}

/**
 * Renders both PDFs for `result` from the editor view-model and downloads them
 * as two separate files. The puzzle view drives the puzzle sheet; the solution
 * view (same view-model plus the German `solutionSuffix`) drives the marked
 * answer key. Filenames share the sanitized title stem with the puzzle/solution
 * suffixes. Callers guard against a null result (the action is disabled) so
 * `result` is always a real puzzle here.
 */
export function exportPuzzlePdfs(
  result: GenerationResult,
  puzzleView: PuzzleView,
  solutionView: SolutionView,
  parts: ExportFilenameParts,
): void {
  const stem = sanitizeFilenameStem(puzzleView.header.title, parts.fallback);
  downloadPdf(
    renderPuzzleDoc(result, puzzleView),
    `${stem}${parts.puzzleSuffix}${parts.extension}`,
  );
  downloadPdf(
    renderSolutionDoc(result, solutionView),
    `${stem}${parts.solutionSuffix}${parts.extension}`,
  );
}
