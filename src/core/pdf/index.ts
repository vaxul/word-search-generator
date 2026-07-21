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
