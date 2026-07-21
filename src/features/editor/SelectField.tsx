import { type ReactNode, useId } from 'react';

interface SelectFieldProps {
  /** Accessible label text (from src/strings/); visually hidden. */
  readonly label: string;
  /** Current value. */
  readonly value: string;
  /** Change handler emitting the new raw value. */
  readonly onChange: (value: string) => void;
  /** The `<option>` elements. */
  readonly children: ReactNode;
}

const SELECT_CLASS =
  'mt-2 block w-full rounded-md border border-border bg-background p-2 ' +
  'text-sm text-foreground focus:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-primary';

/**
 * A single labelled `<select>` — the shared building block for the font family
 * and font size pickers. The programmatic `label`/`id` pairing keeps the control
 * accessible (WCAG 2.1 AA); the label is visually hidden (the "Schrift" group
 * heading provides the visible context).
 */
export function SelectField({
  label,
  value,
  onChange,
  children,
}: SelectFieldProps): JSX.Element {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={SELECT_CLASS}
      >
        {children}
      </select>
    </div>
  );
}
