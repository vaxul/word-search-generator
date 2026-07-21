// German UI strings — the single source of user-facing text (constitution:
// "UI text is German, centralized in one strings module"). Components import
// from src/strings/, never inline German literals. This module is the ONE place
// non-ASCII UI text is allowed (the ESLint German-literal backstop excludes it);
// every component reads keys from here. Later Phase 3 issues extend this table
// as the editor/preview controls land — the shell adds only shell-level text.
export const de = {
  app: {
    title: 'Wortsuche-Generator',
    tagline:
      'Erstelle druckfertige A4-Wortsuchrätsel aus deinen eigenen Wörtern.',
    // Top-right header meta — the product's three differentiators (mockup).
    meta: 'Werbefrei · A4-fertig · ohne Konto',
    // Single-glyph logo badge in the header.
    logoInitial: 'W',
  },
  // Editor card (left column). The actual input/config controls arrive in later
  // Phase 3 issues; the shell owns the card heading + region label only.
  editor: {
    heading: 'Puzzle erstellen',
    regionLabel: 'Puzzle-Editor',
    placeholder: 'Die Eingabe- und Konfigurationsfelder folgen in Kürze.',
  },
  // Preview card (right column). The grid rendering + solution toggle arrive in
  // later Phase 3 issues; the shell owns the heading + the empty state.
  preview: {
    heading: 'Vorschau',
    regionLabel: 'Puzzle-Vorschau',
    empty: 'Noch kein Puzzle generiert — erstelle links dein Puzzle.',
  },
} as const;

// Shape of the string table, so future locales (if ever added) stay in sync and
// components get typed access to every key.
export type Strings = typeof de;
