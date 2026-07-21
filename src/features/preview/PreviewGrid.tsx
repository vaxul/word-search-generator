import type { Grid } from '../../core';
import { strings } from '../../strings';

interface PreviewGridProps {
  /** The generated letter grid (row-major: cell (r,c) = cells[r*width+c]). */
  readonly grid: Grid;
  /** The selected font size in px (design type scale) — drives cell + glyph size. */
  readonly fontSize: number;
  /**
   * Row-major indices of the cells to highlight as the solution (issue #35).
   * Empty (the default) is the plain puzzle view; a non-empty set paints those
   * cells with the accent highlight. See {@link solutionCellIndices}.
   */
  readonly highlighted?: ReadonlySet<number>;
}

// A cell is a square sized from the font so bigger letters get bigger cells; the
// ratio keeps a glyph comfortably centered (docs/design.md: fixed-pitch cells).
const CELL_RATIO = 1.9;

// docs/design.md Preview grid: fixed-pitch letter cells, high contrast
// (`foreground` on `background`), a `border` between cells. Grid lines come from
// a top/left border on the container plus a right/bottom border per cell, so
// interior lines are single-width and the outer edge is closed.
const GRID_CLASSES = 'inline-block border-l border-t border-border bg-background';
const CELL_CLASSES =
  'flex items-center justify-center border-b border-r border-border ' +
  'font-semibold text-foreground';
// Solution highlight (docs/design.md: "solution view highlights placed words
// with `accent`"). The dark `foreground` glyph on the amber `accent` fill meets
// WCAG 2.1 AA contrast (same accent + dark-label pairing as the primary action).
const HIGHLIGHT_CLASSES = 'bg-accent';

/** Slice the row-major `cells` into `height` rows of `width` for ARIA rows. */
function toRows(grid: Grid): readonly (readonly string[])[] {
  const rows: string[][] = [];
  for (let r = 0; r < grid.height; r += 1) {
    const start = r * grid.width;
    rows.push(grid.cells.slice(start, start + grid.width) as string[]);
  }
  return rows;
}

/**
 * The puzzle letter grid — the preview centerpiece (issue #34). Renders every
 * `grid.cells` glyph in a fixed-pitch grid (ARIA `grid`/`row`/`gridcell`),
 * honoring the selected font size (glyph + square cell size). Large grids (up to
 * 30×30) keep a fixed cell pitch and scroll inside the parent container rather
 * than reflowing (spec risk mitigation). The plain puzzle view only — the
 * "Lösung" highlight is issue #35.
 */
export function PreviewGrid({
  grid,
  fontSize,
  highlighted,
}: PreviewGridProps): JSX.Element {
  const cellPx = Math.round(fontSize * CELL_RATIO);
  const cell = { width: `${cellPx}px`, height: `${cellPx}px` };
  return (
    <div
      role="grid"
      aria-label={strings.preview.gridLabel}
      className={GRID_CLASSES}
      style={{ fontSize: `${fontSize}px` }}
    >
      {toRows(grid).map((row, rowIndex) => (
        <div key={rowIndex} role="row" className="flex">
          {row.map((letter, colIndex) => {
            const isHighlighted =
              highlighted?.has(rowIndex * grid.width + colIndex) ?? false;
            return (
              <div
                key={colIndex}
                role="gridcell"
                className={
                  isHighlighted
                    ? `${CELL_CLASSES} ${HIGHLIGHT_CLASSES}`
                    : CELL_CLASSES
                }
                style={cell}
              >
                {letter}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
