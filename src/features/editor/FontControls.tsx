import type { FontFamily, FontSettings } from '../../app/state';
import { strings } from '../../strings';
import { SelectField } from './SelectField';

interface FontControlsProps {
  /** Current font view-model state (store `font`). */
  readonly font: FontSettings;
  /** Changes the font family (dispatch `setFontFamily`). */
  readonly onFamilyChange: (family: FontFamily) => void;
  /** Changes the font size (dispatch `setFontSize`). */
  readonly onSizeChange: (size: number) => void;
}

// The design type scale (docs/design.md: 12 / 14 / 16 / 20 / 24 / 32 / 48 px).
const FONT_SIZES: readonly number[] = [12, 14, 16, 20, 24, 32, 48];

/**
 * Font choice + size controls — the family picker (default Inter → accessible
 * Atkinson Hyperlegible / OpenDyslexic) and a size picker over the design type
 * scale. Both are feature view-model state applied to the preview grid (spec:
 * font size is a puzzle-display property, not a core config field). Each select
 * is a labelled {@link SelectField} (WCAG 2.1 AA).
 */
export function FontControls({
  font,
  onFamilyChange,
  onSizeChange,
}: FontControlsProps): JSX.Element {
  const f = strings.editor.font;
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{f.label}</p>
      <div className="grid grid-cols-2 gap-2">
        <SelectField
          label={f.familyLabel}
          value={font.family}
          onChange={(value) =>
            onFamilyChange(value === 'accessible' ? 'accessible' : 'sans')
          }
        >
          <option value="sans">{f.sans}</option>
          <option value="accessible">{f.accessible}</option>
        </SelectField>
        <SelectField
          label={f.sizeLabel}
          value={String(font.size)}
          onChange={(value) => onSizeChange(Number(value))}
        >
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {`${size} ${f.sizeUnit}`}
            </option>
          ))}
        </SelectField>
      </div>
    </div>
  );
}
