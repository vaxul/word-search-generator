interface ToggleButtonProps {
  /** Whether the toggle is currently active (drives styling + `aria-pressed`). */
  readonly pressed: boolean;
  /** Visible label — always sourced from src/strings/ by the caller. */
  readonly label: string;
  /** Activate / toggle handler. */
  readonly onToggle: () => void;
}

// Active vs. inactive styling for a toggle button (docs/design.md: `primary`
// indigo for the active state, `border` token outline for the inactive state).
// The `foreground`/white pairing on `primary` meets WCAG 2.1 AA contrast; the
// visible `primary` focus ring is applied in both states.
const BASE =
  'rounded-md px-3 py-2 text-sm font-medium transition-colors ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ' +
  'focus-visible:ring-offset-1';
const ACTIVE = 'bg-primary text-background';
const INACTIVE =
  'border border-border bg-background text-foreground hover:bg-muted';

/**
 * A single labelled toggle button — the shared building block for the difficulty
 * presets and the 8-direction toggle group (docs/design.md: "Direction toggles
 * are a labelled toggle group, not raw checkboxes"). Exposes its state via
 * `aria-pressed` so assistive tech reports it; the caller owns the semantics
 * (single-select for presets, multi-select for directions).
 */
export function ToggleButton({
  pressed,
  label,
  onToggle,
}: ToggleButtonProps): JSX.Element {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      className={`${BASE} ${pressed ? ACTIVE : INACTIVE}`}
    >
      {label}
    </button>
  );
}
