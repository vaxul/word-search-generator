import { useId } from 'react';
import { GRID_SIZE_MAX, GRID_SIZE_MIN } from '../../core';
import { strings } from '../../strings';
import { ReverseSwitch } from './ReverseSwitch';

interface GridSizeReverseProps {
  /** Current grid size (store `config.size`). */
  readonly size: number;
  /** Emits the raw numeric input; the store clamps it to 5–30 (dispatch). */
  readonly onSizeChange: (size: number) => void;
  /** Whether reverse (backward) placement is allowed (store `config.reverse`). */
  readonly reverse: boolean;
  /** Toggles the reverse flag (dispatch `setReverse`). */
  readonly onReverseChange: (reverse: boolean) => void;
}

/**
 * Grid-size numeric input (bounded 5–30, clamped by the store) alongside the
 * reverse toggle — the mockup pairs them in one row. The size input carries
 * native `min`/`max` plus the "5 – 30" hint and a programmatic label (WCAG 2.1
 * AA); the reverse control is the {@link ReverseSwitch}.
 */
export function GridSizeReverse({
  size,
  onSizeChange,
  reverse,
  onReverseChange,
}: GridSizeReverseProps): JSX.Element {
  const sizeId = useId();
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label
          htmlFor={sizeId}
          className="block text-sm font-medium text-foreground"
        >
          {strings.editor.size.label}
        </label>
        <input
          id={sizeId}
          type="number"
          min={GRID_SIZE_MIN}
          max={GRID_SIZE_MAX}
          value={size}
          onChange={(event) => onSizeChange(event.target.valueAsNumber)}
          className={
            'mt-2 block w-full rounded-md border border-border bg-background ' +
            'p-2 text-sm text-foreground focus:outline-none ' +
            'focus-visible:ring-2 focus-visible:ring-primary'
          }
        />
        <p className="mt-1 text-xs text-secondary">
          {strings.editor.size.hint}
        </p>
      </div>
      <ReverseSwitch reverse={reverse} onChange={onReverseChange} />
    </div>
  );
}
