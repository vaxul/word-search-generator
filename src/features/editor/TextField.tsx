import { useId } from 'react';

interface TextFieldProps {
  /** Accessible label text (from src/strings/). */
  readonly label: string;
  /** Current value. */
  readonly value: string;
  /** Change handler emitting the new value. */
  readonly onChange: (value: string) => void;
  /** Placeholder hint (from src/strings/). */
  readonly placeholder?: string;
  /** When true, the label is visually hidden but kept for assistive tech. */
  readonly labelHidden?: boolean;
}

const INPUT_CLASS =
  'mt-2 block w-full rounded-md border border-border bg-background p-2 ' +
  'text-sm text-foreground focus:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-primary';

/**
 * A single labelled text input — the shared building block for the per-puzzle
 * header fields. The programmatic `label`/`id` pairing keeps every field
 * accessible (WCAG 2.1 AA), even when the label is visually hidden.
 */
export function TextField({
  label,
  value,
  onChange,
  placeholder,
  labelHidden,
}: TextFieldProps): JSX.Element {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        className={
          labelHidden ? 'sr-only' : 'block text-sm font-medium text-foreground'
        }
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT_CLASS}
      />
    </div>
  );
}
