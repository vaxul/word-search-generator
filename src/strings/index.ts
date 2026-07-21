// Public entry point for the centralized UI strings. Components import the
// active string table from here (`import { strings } from '../strings'`), which
// keeps the choice of locale in one place. German is the only locale
// (constitution: UI text is German).
import { de } from './de';

export type { Strings } from './de';

export const strings = de;
