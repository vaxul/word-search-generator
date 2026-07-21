import { useId } from 'react';
import { strings } from '../../strings';

interface WordInputProps {
  /** Raw textarea value (store `words`). */
  readonly value: string;
  /** Emits the new raw value on every edit (dispatch `setWords`). */
  readonly onChange: (value: string) => void;
}

/**
 * Word-list textarea (docs/design.md: Word-list textarea component) — one word
 * per line, paste-friendly. Holds the RAW value in the store; parsing
 * (trim/drop-empty/dedup) happens at generate time via `parseWords`. A
 * programmatic `label`/`id` pairing keeps it accessible (WCAG 2.1 AA).
 */
export function WordInput({ value, onChange }: WordInputProps): JSX.Element {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {strings.editor.words.label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={6}
        placeholder={strings.editor.words.placeholder}
        className={
          'mt-2 block w-full resize-y rounded-md border border-border ' +
          'bg-background p-3 font-mono text-sm text-foreground ' +
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
        }
      />
    </div>
  );
}
