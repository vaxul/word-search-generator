import type { Grid } from '../../core';
import { strings } from '../../strings';

interface PreviewGridProps {
  /** The generated letter grid (row-major: cell (r,c) = cells[r*width+c]). */
  readonly grid: Grid;
  /** The selected font size in px (design type scale) — drives cell + glyph size. */
  readonly fontSize: number;
}

// A cell is a square sized from the font so bigger letters get bigger cells; the
// ratio keeps a glyph comfortably centered (docs/design.md: fixed-pitch cells).
const CELL_RATIO = 1.9;

// docs/design.md Preview grid: fixed-pitch letter cells, high contrast
// (`foreground` on `background`), a `border` between cells. Grid lines come from
// a top/left border on the container plus a right/bottom border per cell, so
// interior lines are single-width and the outer edge is closed.
const GRID_CLASSES = 'inline-grid border-l border-t border-border bg-background';
const CELL_CLASSES =
  'flex items-center justify-center border-b border-r border-border ' +
  'font-semibold text-foreground';

/**
 * The puzzle letter grid — the preview centerpiece (issue #34). Renders every
 * `grid.cells` glyph in a fixed-pitch CSS grid, honoring the selected font size
 * (glyph + square cell size). Large grids (up to 30×30) keep a fixed cell pitch
 * and scroll inside the parent container rather than reflowing (spec risk
 * mitigation). The plain puzzle view only — the "Lösung" highlight is issue #35.
 */
export function PreviewGrid({ grid, fontSize }: PreviewGridProps): JSX.Element {
  const cellPx = Math.round(fontSize * CELL_RATIO);
  return (
    <div
      role="grid"
      aria-label={strings.preview.gridLabel}
      className={GRID_CLASSES}
      style={{
        gridTemplateColumns: `repeat(${grid.width}, ${cellPx}px)`,
        fontSize: `${fontSize}px`,
      }}
    >
      {grid.cells.map((letter, index) => (
        <div
          key={index}
          role="gridcell"
          className={CELL_CLASSES}
          style={{ height: `${cellPx}px` }}
        >
          {letter}
        </div>
      ))}
    </div>
  );
}
