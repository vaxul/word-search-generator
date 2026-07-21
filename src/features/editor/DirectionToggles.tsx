import type { Direction } from '../../core';
import { strings } from '../../strings';
import { ToggleButton } from './ToggleButton';

interface DirectionTogglesProps {
  /** The currently allowed directions (store `config.directions`). */
  readonly selected: readonly Direction[];
  /** Adds / removes a direction from the allowed set (dispatch `toggleDirection`). */
  readonly onToggle: (direction: Direction) => void;
}

// Display order matching the mockup's 4-column grid: forward/diagonal-forward row
// first, then the reverse-facing row. The labels (arrow + German abbreviation)
// come from src/strings/.
const DIRECTION_ORDER: readonly Direction[] = [
  'E',
  'S',
  'SE',
  'NE',
  'W',
  'N',
  'SW',
  'NW',
];

/**
 * The 8-direction labelled toggle group (docs/design.md: "Direction toggles are
 * a labelled toggle group, not raw checkboxes"). Each button toggles one compass
 * direction in/out of the allowed set; a preset seeds the initial set and these
 * manual toggles override it (spec Prior decision). Wrapped in a labelled `group`
 * for WCAG 2.1 AA.
 */
export function DirectionToggles({
  selected,
  onToggle,
}: DirectionTogglesProps): JSX.Element {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">
        {strings.editor.directions.label}
      </p>
      <div
        role="group"
        aria-label={strings.editor.directions.groupLabel}
        className="mt-2 grid grid-cols-4 gap-2"
      >
        {DIRECTION_ORDER.map((direction) => (
          <ToggleButton
            key={direction}
            pressed={selected.includes(direction)}
            label={strings.editor.directions.labels[direction]}
            onToggle={() => onToggle(direction)}
          />
        ))}
      </div>
    </div>
  );
}
