// App state store — the plain React `useReducer` model for the Phase 3 editor
// (issue #30). This is the single source of app state: the word-list input, the
// generation config INPUTS, the per-puzzle header, the font choice/size, and the
// latest generation result.
//
// Boundary note (constitution / spec Prior decisions): the header, the font
// choice + size, and the difficulty are feature/app VIEW-MODEL state — never
// fields on the core `PuzzleConfig` (`{ width, height, directions, reverse,
// words }`), whose sole role is generation input. The core `PuzzleConfig` is
// built only at generate time (a later issue) from these inputs; the store just
// holds the raw inputs. This module imports `src/core` only (never the reverse).
import type {
  Difficulty,
  Direction,
  GenerationResult,
} from '../core';
import { clampGridSize, DIFFICULTY_PRESETS } from '../core';

/** The selectable font families for the preview grid (mockup "Schrift"). */
export type FontFamily = 'sans' | 'accessible';

/** Font view-model state: family + a size from the design type scale (px). */
export interface FontSettings {
  readonly family: FontFamily;
  readonly size: number;
}

/** Per-puzzle header carried into the Phase 4 PDF (title / theme / date). */
export interface PuzzleHeader {
  readonly title: string;
  readonly theme: string;
  readonly date: string;
}

/**
 * The generation config INPUTS as the editor collects them — a view-model, not
 * the core `PuzzleConfig`. `size` is the square grid dimension (bounded 5–30 at
 * mutation time); `directions`/`reverse` are seeded by the difficulty preset and
 * may be overridden manually (spec Prior decision).
 */
export interface ConfigInputs {
  readonly difficulty: Difficulty;
  readonly size: number;
  readonly directions: readonly Direction[];
  readonly reverse: boolean;
}

/** The whole app state (issue #30 acceptance). */
export interface AppState {
  readonly words: string;
  readonly config: ConfigInputs;
  readonly header: PuzzleHeader;
  readonly font: FontSettings;
  readonly result: GenerationResult | null;
}

/**
 * Every state transition. The UI shell does not dispatch these yet — the editor
 * controls (#32), generate wiring (#33), and solution toggle (#35) will — but
 * the store shape and reducer land now as the Phase 3 foundation and are
 * unit-tested here.
 */
export type AppAction =
  | { readonly type: 'setWords'; readonly words: string }
  | { readonly type: 'selectDifficulty'; readonly difficulty: Difficulty }
  | { readonly type: 'setSize'; readonly size: number }
  | { readonly type: 'toggleDirection'; readonly direction: Direction }
  | { readonly type: 'setReverse'; readonly reverse: boolean }
  | {
      readonly type: 'setHeaderField';
      readonly field: keyof PuzzleHeader;
      readonly value: string;
    }
  | { readonly type: 'setFontFamily'; readonly family: FontFamily }
  | { readonly type: 'setFontSize'; readonly size: number }
  | { readonly type: 'setResult'; readonly result: GenerationResult | null };

const DEFAULT_DIFFICULTY: Difficulty = 'medium';

/** Default font: the accessible family at 16px (mockup selection). */
const DEFAULT_FONT: FontSettings = { family: 'accessible', size: 16 };

/** Initial state: the medium preset seeds size + directions + reverse. */
export const initialState: AppState = {
  words: '',
  config: {
    difficulty: DEFAULT_DIFFICULTY,
    size: DIFFICULTY_PRESETS[DEFAULT_DIFFICULTY].width,
    directions: DIFFICULTY_PRESETS[DEFAULT_DIFFICULTY].directions,
    reverse: DIFFICULTY_PRESETS[DEFAULT_DIFFICULTY].reverse,
  },
  header: { title: '', theme: '', date: '' },
  font: DEFAULT_FONT,
  result: null,
};

/** Add or remove a direction from the allowed set, preserving order. */
function toggleDirection(
  directions: readonly Direction[],
  direction: Direction,
): readonly Direction[] {
  return directions.includes(direction)
    ? directions.filter((d) => d !== direction)
    : [...directions, direction];
}

/** Selecting a difficulty seeds size + directions + reverse from the preset. */
function applyDifficulty(state: AppState, difficulty: Difficulty): AppState {
  const preset = DIFFICULTY_PRESETS[difficulty];
  return {
    ...state,
    config: {
      difficulty,
      size: preset.width,
      directions: preset.directions,
      reverse: preset.reverse,
    },
  };
}

/** Pure reducer for the app store — total over {@link AppAction}. */
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'setWords':
      return { ...state, words: action.words };
    case 'selectDifficulty':
      return applyDifficulty(state, action.difficulty);
    case 'setSize':
      return {
        ...state,
        config: { ...state.config, size: clampGridSize(action.size) },
      };
    case 'toggleDirection':
      return {
        ...state,
        config: {
          ...state.config,
          directions: toggleDirection(state.config.directions, action.direction),
        },
      };
    case 'setReverse':
      return { ...state, config: { ...state.config, reverse: action.reverse } };
    case 'setHeaderField':
      return {
        ...state,
        header: { ...state.header, [action.field]: action.value },
      };
    case 'setFontFamily':
      return { ...state, font: { ...state.font, family: action.family } };
    case 'setFontSize':
      return { ...state, font: { ...state.font, size: action.size } };
    case 'setResult':
      return { ...state, result: action.result };
  }
}
