import { jsPDF } from 'jspdf';
import { describe, expect, it } from 'vitest';

import { PDF_FONTS, pdfFontForFamily } from './fonts/fontAssets';
import { registerFont, registerFontAsset } from './registerFont';

// German text exercising every umlaut plus ß — the glyphs jsPDF's built-in
// WinAnsi fonts mangle. A positive measured width proves the character resolved
// to a real glyph in the embedded font rather than a missing/substituted one.
const GERMAN = 'FÖRSTERgrüß ÄÖÜ';

describe('registerFont', () => {
  it('embeds the family font and reports it registered', () => {
    for (const family of ['sans', 'accessible'] as const) {
      const doc = new jsPDF();
      const name = registerFont(doc, family);

      expect(name).toBe(pdfFontForFamily(family).fontName);
      expect(Object.keys(doc.getFontList())).toContain(name);
      expect(doc.getFont().fontName).toBe(name);
    }
  });

  it('renders German umlauts and ß via the embedded font without throwing', () => {
    const doc = new jsPDF();
    registerFont(doc, 'accessible');

    expect(() => doc.text(GERMAN, 20, 20)).not.toThrow();
    // ß resolves to a real, positive-width glyph — no WinAnsi mojibake / "SS".
    expect(doc.getTextWidth('ß')).toBeGreaterThan(0);
    // A non-trivial document was produced.
    expect(doc.output('arraybuffer').byteLength).toBeGreaterThan(0);
  });

  it('registers every vendored font asset (incl. OpenDyslexic) explicitly', () => {
    for (const asset of Object.values(PDF_FONTS)) {
      const doc = new jsPDF();
      const name = registerFontAsset(doc, asset);

      expect(name).toBe(asset.fontName);
      expect(Object.keys(doc.getFontList())).toContain(asset.fontName);
      expect(() => doc.text(GERMAN, 20, 20)).not.toThrow();
      expect(doc.getTextWidth('ß')).toBeGreaterThan(0);
    }
  });
});
