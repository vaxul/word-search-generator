import { strings } from '../../strings';

interface ReverseSwitchProps {
  /** Whether reverse (backward) placement is allowed (store `config.reverse`). */
  readonly reverse: boolean;
  /** Toggles the reverse flag (dispatch `setReverse`). */
  readonly onChange: (reverse: boolean) => void;
}

const TRACK =
  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ' +
  'focus-visible:ring-offset-1';
const KNOB =
  'inline-block h-4 w-4 transform rounded-full bg-background transition-transform';

/**
 * The reverse (backward placement) toggle — a `role="switch"` control labelled
 * "Rückwärts" (WCAG 2.1 AA). `primary` (on) vs. `border` (off) track meets AA
 * contrast; the visible focus ring applies in both states.
 */
export function ReverseSwitch({
  reverse,
  onChange,
}: ReverseSwitchProps): JSX.Element {
  return (
    <div>
      <p className="block text-sm font-medium text-foreground">
        {strings.editor.reverse.label}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={reverse}
          aria-label={strings.editor.reverse.label}
          onClick={() => onChange(!reverse)}
          className={`${TRACK} ${reverse ? 'bg-primary' : 'bg-border'}`}
        >
          <span
            className={`${KNOB} ${reverse ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
        <span className="text-sm text-foreground">
          {strings.editor.reverse.toggle}
        </span>
      </div>
    </div>
  );
}
