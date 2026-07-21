import { type Dispatch } from 'react';
import type { AppAction, AppState } from '../../app/state';
import { strings } from '../../strings';
import { runGeneration } from './generatePuzzle';

interface GenerateActionProps {
  /** The app state — the generate handler reads the words + config inputs. */
  readonly state: AppState;
  /** The store dispatch — the result is stored via a `setResult` action. */
  readonly dispatch: Dispatch<AppAction>;
}

// The single primary action (docs/design.md Button: primary = amber `accent`,
// the one generate/download action). The label uses the DARK `foreground` token
// for its text — white-on-amber is NOT WCAG 2.1 AA (spec design contrast note),
// dark-on-amber is. A visible `primary` focus ring meets the focus-state
// requirement. Full width so it reads as the panel's committing action.
const CLASSES =
  'w-full rounded-md bg-accent px-4 py-3 text-base font-semibold ' +
  'text-foreground transition-colors hover:brightness-95 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ' +
  'focus-visible:ring-offset-2';

/**
 * The "Puzzle generieren" primary button — issue #33. On click it mints a fresh
 * per-run seed (in the feature layer via {@link runGeneration}; `Math.random` is
 * banned in `src/core` only), builds the core `PuzzleConfig` from state, runs the
 * Phase 2 engine, and stores the {@link GenerationResult} via `setResult`.
 * Generation runs ONLY on click — no live auto-regeneration — and the seed is
 * neither surfaced nor persisted (spec Prior decision).
 */
export function GenerateAction({
  state,
  dispatch,
}: GenerateActionProps): JSX.Element {
  const handleGenerate = (): void => {
    const result = runGeneration(state.words, state.config);
    dispatch({ type: 'setResult', result });
  };
  return (
    <button type="button" onClick={handleGenerate} className={CLASSES}>
      {strings.editor.generate}
    </button>
  );
}
