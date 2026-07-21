// Embeds a vendored Unicode TTF into a jsPDF document so text drawn afterwards
// uses that font — the mechanism that makes ä/ö/ü/ß render as real glyphs
// instead of WinAnsi mojibake. `src/core/pdf` uses jsPDF but no DOM APIs
// (constitution): this only touches the jsPDF document's virtual file system.
import type { jsPDF } from 'jspdf';

import type { PdfFontAsset, PdfFontFamily } from './fonts/fontAssets';
import { pdfFontForFamily } from './fonts/fontAssets';

/**
 * Registers a specific {@link PdfFontAsset} in `doc` and selects it as the
 * active font. Stores the TTF bytes in jsPDF's virtual file system
 * (`addFileToVFS`), declares them a Unicode font (`addFont`), then activates it
 * (`setFont`). Returns the jsPDF font name to pass to future `setFont` calls.
 */
export function registerFontAsset(doc: jsPDF, asset: PdfFontAsset): string {
  doc.addFileToVFS(asset.vfsFileName, asset.base64);
  doc.addFont(asset.vfsFileName, asset.fontName, 'normal');
  doc.setFont(asset.fontName, 'normal');
  return asset.fontName;
}

/**
 * Registers the embedded font for the selected app font family and makes it the
 * active font. Thin resolver over {@link registerFontAsset} that maps the app's
 * `FontFamily` choice to its vendored TTF — the entry point the puzzle/solution
 * renderers (#39/#40) call before drawing German text.
 */
export function registerFont(doc: jsPDF, family: PdfFontFamily): string {
  return registerFontAsset(doc, pdfFontForFamily(family));
}
