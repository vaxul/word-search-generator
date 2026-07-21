// German UI strings — the single source of user-facing text (constitution:
// "UI text is German, centralized in one strings module"). Components import
// from src/strings/, never inline German literals. Phase 1 holds only the
// handful of strings the placeholder app shell needs; later phases extend this.
export const de = {
  app: {
    title: 'Wortsuche-Generator',
    tagline:
      'Erstelle druckfertige A4-Wortsuchrätsel aus deinen eigenen Wörtern.',
  },
} as const;

// Shape of the string table, so future locales (if ever added) stay in sync and
// components get typed access to every key.
export type Strings = typeof de;
