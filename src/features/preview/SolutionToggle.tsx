import { strings } from '../../strings';

/** The two preview view modes: the plain puzzle vs. the solution highlight. */
export type PreviewView = 'puzzle' | 'solution';

interface SolutionToggleProps {
  /** The currently active view (drives styling + `aria-pressed`). */
  readonly view: PreviewView;
  /** Switch the preview to the given view. */
  readonly onChange: (view: PreviewView) => void;
}

// Segmented control styling (docs/design.md mockup: a "Puzzle / Lösung" toggle
// at the top of the preview card). The active segment uses `primary` indigo with
// a `background` label (WCAG 2.1 AA), matching the editor toggle group; inactive
// segments are plain text. A visible `primary` focus ring covers both states.
const BASE =
  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ' +
  'focus-visible:ring-offset-1';
const ACTIVE = 'bg-primary text-background';
const INACTIVE = 'text-secondary hover:text-foreground';

const OPTIONS: readonly { readonly value: PreviewView; readonly label: string }[] =
  [
    { value: 'puzzle', label: strings.preview.view.puzzle },
    { value: 'solution', label: strings.preview.view.solution },
  ];

/**
 * The Puzzle/Lösung view toggle (issue #35) — a static answer-key switch, not
 * interactive solving. Selecting "Lösung" highlights the placed words on the
 * grid with the accent color; "Puzzle" returns the plain grid. A labelled
 * `group` of `aria-pressed` buttons keeps it keyboard-accessible and reported to
 * assistive tech.
 */
export function SolutionToggle({
  view,
  onChange,
}: SolutionToggleProps): JSX.Element {
  return (
    <div
      role="group"
      aria-label={strings.preview.view.groupLabel}
      className="inline-flex gap-1 rounded-md border border-border bg-background p-1"
    >
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={view === option.value}
          onClick={() => onChange(option.value)}
          className={`${BASE} ${view === option.value ? ACTIVE : INACTIVE}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
