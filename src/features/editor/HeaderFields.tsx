import type { PuzzleHeader } from '../../app/state';
import { strings } from '../../strings';
import { TextField } from './TextField';

interface HeaderFieldsProps {
  /** The per-puzzle header (store `header`). */
  readonly header: PuzzleHeader;
  /** Updates one header field (dispatch `setHeaderField`). */
  readonly onChange: (field: keyof PuzzleHeader, value: string) => void;
}

/**
 * Per-puzzle header fields (title / theme / date) — stored as feature view-model
 * state and carried into the Phase 4 PDF (spec: never fields on the core
 * `PuzzleConfig`). Title spans the row; theme + date share a row (mockup). Each
 * field is a labelled {@link TextField} (WCAG 2.1 AA).
 */
export function HeaderFields({
  header,
  onChange,
}: HeaderFieldsProps): JSX.Element {
  const h = strings.editor.header;
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{h.label}</p>
      <TextField
        label={h.title}
        labelHidden
        value={header.title}
        placeholder={h.titlePlaceholder}
        onChange={(value) => onChange('title', value)}
      />
      <div className="grid grid-cols-2 gap-2">
        <TextField
          label={h.theme}
          labelHidden
          value={header.theme}
          placeholder={h.themePlaceholder}
          onChange={(value) => onChange('theme', value)}
        />
        <TextField
          label={h.date}
          labelHidden
          value={header.date}
          placeholder={h.datePlaceholder}
          onChange={(value) => onChange('date', value)}
        />
      </div>
    </div>
  );
}
