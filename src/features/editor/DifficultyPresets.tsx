import type { Difficulty } from '../../core';
import { strings } from '../../strings';
import { ToggleButton } from './ToggleButton';

interface DifficultyPresetsProps {
  /** The currently selected difficulty (store `config.difficulty`). */
  readonly selected: Difficulty;
  /** Selecting a preset seeds size + directions + reverse (dispatch). */
  readonly onSelect: (difficulty: Difficulty) => void;
}

// The three presets in mockup order (Leicht / Mittel / Schwer) paired with their
// German labels from src/strings/.
const PRESETS: readonly {
  readonly value: Difficulty;
  readonly label: string;
}[] = [
  { value: 'easy', label: strings.editor.difficulty.easy },
  { value: 'medium', label: strings.editor.difficulty.medium },
  { value: 'hard', label: strings.editor.difficulty.hard },
];

/**
 * Difficulty presets (Leicht / Mittel / Schwer). Selecting one seeds the grid
 * size + direction set + reverse via the Phase 2 mapping (store `selectDifficulty`);
 * manual edits afterward override those seeded values (spec Prior decision). A
 * labelled `group` wraps the toggle buttons for WCAG 2.1 AA.
 */
export function DifficultyPresets({
  selected,
  onSelect,
}: DifficultyPresetsProps): JSX.Element {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">
        {strings.editor.difficulty.label}
      </p>
      <div
        role="group"
        aria-label={strings.editor.difficulty.groupLabel}
        className="mt-2 grid grid-cols-3 gap-2"
      >
        {PRESETS.map((preset) => (
          <ToggleButton
            key={preset.value}
            pressed={selected === preset.value}
            label={preset.label}
            onToggle={() => onSelect(preset.value)}
          />
        ))}
      </div>
    </div>
  );
}
