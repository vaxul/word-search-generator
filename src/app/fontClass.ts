// Maps the app's selected {@link FontFamily} view-model value to the Tailwind
// utility class derived from the design-token font families (tokens.css:
// `--font-sans` = Inter, `--font-accessible` = Atkinson Hyperlegible /
// OpenDyslexic, both backed by the vendored `@font-face` in styles/fonts.css).
//
// Centralising this mapping keeps the token → utility wiring in one place: a
// component applies the chosen font by spreading `fontFamilyClass(family)` into
// its className rather than hardcoding a font utility (issue #31 wiring).
import type { FontFamily } from './state';

/** The token-derived Tailwind font utility for each selectable family. */
const FONT_FAMILY_CLASS: Readonly<Record<FontFamily, string>> = {
  sans: 'font-sans',
  accessible: 'font-accessible',
};

/**
 * The Tailwind font-family utility class for a selected {@link FontFamily}.
 * `'accessible'` → `font-accessible` (the vendored Atkinson Hyperlegible /
 * OpenDyslexic token); `'sans'` → `font-sans` (Inter, the default).
 */
export function fontFamilyClass(family: FontFamily): string {
  return FONT_FAMILY_CLASS[family];
}
