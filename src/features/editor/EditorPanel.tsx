import { type Dispatch } from 'react';
import type { AppAction, AppState } from '../../app/state';
import { strings } from '../../strings';
import { DifficultyPresets } from './DifficultyPresets';
import { DirectionToggles } from './DirectionToggles';
import { FontControls } from './FontControls';
import { GridSizeReverse } from './GridSizeReverse';
import { HeaderFields } from './HeaderFields';
import { WordInput } from './WordInput';

interface EditorPanelProps {
  /** The app state (store) — the controls reflect and mutate it. */
  readonly state: AppState;
  /** The store dispatch — every control emits an {@link AppAction}. */
  readonly dispatch: Dispatch<AppAction>;
}

/**
 * Editor panel — the left card's content region (issue #32). Composes the word
 * textarea, difficulty presets, grid-size + reverse, the 8-direction toggle
 * group, the per-puzzle header fields, and the font controls, each wired to the
 * #30 store via `dispatch`. Selecting a preset seeds size + directions + reverse;
 * manual edits afterward override those seeded values (spec Prior decision). The
 * "Generieren" action + its engine wiring are issue #33; all UI text is German
 * from src/strings/.
 */
export function EditorPanel({
  state,
  dispatch,
}: EditorPanelProps): JSX.Element {
  const { words, config, header, font } = state;
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-foreground">
        {strings.editor.heading}
      </h2>
      <WordInput
        value={words}
        onChange={(value) => dispatch({ type: 'setWords', words: value })}
      />
      <DifficultyPresets
        selected={config.difficulty}
        onSelect={(difficulty) =>
          dispatch({ type: 'selectDifficulty', difficulty })
        }
      />
      <GridSizeReverse
        size={config.size}
        onSizeChange={(size) => dispatch({ type: 'setSize', size })}
        reverse={config.reverse}
        onReverseChange={(reverse) => dispatch({ type: 'setReverse', reverse })}
      />
      <DirectionToggles
        selected={config.directions}
        onToggle={(direction) =>
          dispatch({ type: 'toggleDirection', direction })
        }
      />
      <HeaderFields
        header={header}
        onChange={(field, value) =>
          dispatch({ type: 'setHeaderField', field, value })
        }
      />
      <FontControls
        font={font}
        onFamilyChange={(family) => dispatch({ type: 'setFontFamily', family })}
        onSizeChange={(size) => dispatch({ type: 'setFontSize', size })}
      />
    </div>
  );
}
