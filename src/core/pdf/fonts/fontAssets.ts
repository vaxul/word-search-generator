// The PDF font registry: the vendored Unicode TTFs (base64) that jsPDF embeds so
// German umlauts (ä/ö/ü) and ß render as real glyphs. Pure data + types, no DOM
// and no React (constitution: `src/core` purity). Every selectable font ships a
// vendored OFL TTF build asset — including the default (Inter) — because jsPDF's
// built-in fonts are WinAnsi-limited and mangle those glyphs (see
// docs/specs/spec-pdf-export.md, Prior decisions).
import { ATKINSON_HYPERLEGIBLE_REGULAR_TTF_BASE64 } from './atkinsonHyperlegibleRegular';
import { INTER_REGULAR_TTF_BASE64 } from './interRegular';
import { OPEN_DYSLEXIC_REGULAR_TTF_BASE64 } from './openDyslexicRegular';

/** Stable identifier for a vendored, embeddable PDF font. */
export type PdfFontId = 'inter' | 'atkinson-hyperlegible' | 'opendyslexic';

/**
 * The app's selectable font families (mirrors `FontFamily` in `src/app/state`).
 * Declared here rather than imported so `src/core` never depends on the UI layer
 * (architecture boundary: features → core, never the reverse). `src/features`
 * passes its `FontFamily` value straight in — the string literals match.
 */
export type PdfFontFamily = 'sans' | 'accessible';

/** A vendored TTF ready to embed into a jsPDF document. */
export interface PdfFontAsset {
  /** Stable font identifier. */
  readonly id: PdfFontId;
  /** Name registered with jsPDF (`addFont`) and passed to `setFont`. */
  readonly fontName: string;
  /** Virtual-file-system name under which the TTF is stored (`addFileToVFS`). */
  readonly vfsFileName: string;
  /** The TrueType (glyf) font bytes, base64-encoded. */
  readonly base64: string;
}

/** All embeddable PDF fonts, keyed by {@link PdfFontId}. */
export const PDF_FONTS: Readonly<Record<PdfFontId, PdfFontAsset>> = {
  inter: {
    id: 'inter',
    fontName: 'Inter',
    vfsFileName: 'Inter-Regular.ttf',
    base64: INTER_REGULAR_TTF_BASE64,
  },
  'atkinson-hyperlegible': {
    id: 'atkinson-hyperlegible',
    fontName: 'AtkinsonHyperlegible',
    vfsFileName: 'AtkinsonHyperlegible-Regular.ttf',
    base64: ATKINSON_HYPERLEGIBLE_REGULAR_TTF_BASE64,
  },
  opendyslexic: {
    id: 'opendyslexic',
    fontName: 'OpenDyslexic',
    vfsFileName: 'OpenDyslexic-Regular.ttf',
    base64: OPEN_DYSLEXIC_REGULAR_TTF_BASE64,
  },
};

/**
 * The embeddable font for each app font family. `'sans'` → Inter (default);
 * `'accessible'` → Atkinson Hyperlegible — the first family in the
 * `--font-accessible` CSS stack, so the PDF matches what the screen renders.
 * OpenDyslexic stays available via {@link PDF_FONTS} for explicit selection.
 */
export const PDF_FONT_FOR_FAMILY: Readonly<Record<PdfFontFamily, PdfFontId>> = {
  sans: 'inter',
  accessible: 'atkinson-hyperlegible',
};

/** The vendored PDF font asset for a given app font family. */
export function pdfFontForFamily(family: PdfFontFamily): PdfFontAsset {
  return PDF_FONTS[PDF_FONT_FOR_FAMILY[family]];
}
