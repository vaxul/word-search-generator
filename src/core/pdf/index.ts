// Public entry point for the A4 PDF layer (`src/core/pdf`): jsPDF font embedding
// (this issue) and, as they land, A4 layout math + puzzle/solution rendering.
// Pure TypeScript over jsPDF — no DOM APIs (constitution; docs/architecture.md).
export { registerFont, registerFontAsset } from './registerFont';
export {
  PDF_FONTS,
  PDF_FONT_FOR_FAMILY,
  pdfFontForFamily,
} from './fonts/fontAssets';
export type { PdfFontAsset, PdfFontFamily, PdfFontId } from './fonts/fontAssets';
export {
  A4_WIDTH_MM,
  A4_HEIGHT_MM,
  PAGE_MARGIN_MM,
  BLOCK_GUTTER_MM,
  BLOCK_HEADER_MM,
  BLOCK_WORDLIST_MM,
  MIN_LEGIBLE_CELL_PITCH_MM,
  CONTENT_BOX,
  puzzlesPerPage,
  blockLayout,
  paginate,
} from './layout';
export type { Box, BlockLayout, PageLayout, PaginationResult } from './layout';
export { renderPuzzleDoc, renderPuzzleBlock } from './renderPuzzle';
export type {
  PdfPuzzleHeader,
  PuzzleView,
  PuzzleBlockRender,
} from './renderPuzzle';
export { renderSolutionDoc, SOLUTION_TITLE_SUFFIX } from './renderSolution';
export type { SolutionView } from './renderSolution';
