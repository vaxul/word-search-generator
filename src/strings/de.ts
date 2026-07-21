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
  // Editor card (left column). The word-list textarea + configuration controls
  // (issue #32). UI text lives here; components read keys, never inline literals.
  editor: {
    heading: 'Puzzle erstellen',
    regionLabel: 'Puzzle-Editor',
    // Primary action (amber accent, dark label for WCAG AA) — runs generation.
    generate: 'Puzzle generieren',
    // Word-list textarea (one word per line, paste-friendly).
    words: {
      label: 'Wörter (eines pro Zeile)',
      placeholder: 'KATZE\nHUND\nMAUS',
    },
    // Difficulty presets (a preset seeds size + directions + reverse).
    difficulty: {
      label: 'Schwierigkeit',
      groupLabel: 'Schwierigkeitsgrad wählen',
      easy: 'Leicht',
      medium: 'Mittel',
      hard: 'Schwer',
    },
    // Grid-size numeric input (bounded 5–30).
    size: {
      label: 'Gittergröße',
      hint: '5 – 30',
    },
    // Reverse (backward placement) toggle.
    reverse: {
      label: 'Rückwärts',
      toggle: 'Erlauben',
    },
    // Direction toggle group (8 compass directions, German abbreviations).
    directions: {
      label: 'Richtungen',
      groupLabel: 'Erlaubte Richtungen',
      labels: {
        E: '→ O',
        W: '← W',
        N: '↑ N',
        S: '↓ S',
        NE: '↗ NO',
        NW: '↖ NW',
        SE: '↘ SO',
        SW: '↙ SW',
      },
    },
    // Per-puzzle header fields (title / theme / date), carried to the Phase 4 PDF.
    header: {
      label: 'Kopfzeile des Puzzles',
      title: 'Titel',
      theme: 'Thema',
      date: 'Datum',
      titlePlaceholder: 'Tiere im Wald',
      themePlaceholder: 'Klasse 3b',
      datePlaceholder: '21.07.2026',
    },
    // Font choice + size controls (design type scale), applied to the preview.
    font: {
      label: 'Schrift',
      familyLabel: 'Schriftart',
      sizeLabel: 'Schriftgröße',
      sans: 'Standard (Inter)',
      accessible: 'Barrierefrei (Atkinson Hyperlegible)',
      // Suffix for a font-size option label, composed as `${size} px`.
      sizeUnit: 'px',
    },
  },
  // Preview card (right column). The grid render + words-to-find + un-placeable
  // warning land in issue #34; the solution toggle in #35. The shell owns the
  // heading + the empty state.
  preview: {
    heading: 'Vorschau',
    regionLabel: 'Puzzle-Vorschau',
    empty: 'Noch kein Puzzle generiert — erstelle links dein Puzzle.',
    // Accessible name for the letter grid (screen readers).
    gridLabel: 'Buchstabengitter',
    // Separator joining theme + date in the header meta line (mockup).
    metaSeparator: ' · ',
    // "Zu finden" section heading above the word chips (styled uppercase).
    wordsToFind: 'Zu finden',
    // Puzzle/Lösung view toggle (segmented control): a static answer-key
    // highlight, not interactive solving. `groupLabel` names the toggle group for
    // screen readers; the two options switch the grid between the plain puzzle and
    // the solution highlight (placed words shown with the accent color).
    view: {
      groupLabel: 'Ansicht',
      puzzle: 'Puzzle',
      solution: 'Lösung',
    },
    // Destructive un-placeable warning: label + the exact words that did not fit,
    // joined by the list separator.
    unplaceable: {
      label: 'Nicht platzierbar:',
      separator: ', ',
    },
  },
} as const;

// Shape of the string table, so future locales (if ever added) stay in sync and
// components get typed access to every key.
export type Strings = typeof de;
