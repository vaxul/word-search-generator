import type { Grid } from '../../core';
import { strings } from '../../strings';
import type { SolutionMark } from './solutionMarks';

interface PreviewGridProps {
  /** The generated letter grid (row-major: cell (r,c) = cells[r*width+c]). */
  readonly grid: Grid;
  /** The selected font size in px (design type scale) — drives cell + glyph size. */
  readonly fontSize: number;
  /**
   * The per-word solution markings (issue #56). Empty/omitted (the default) is
   * the plain puzzle view; a non-empty list draws one rounded accent capsule per
   * placed word along its cells, so overlapping words stay individually
   * readable. See {@link solutionMarks}.
   */
  readonly marks?: readonly SolutionMark[];
}

// A cell is a square sized from the font so bigger letters get bigger cells; the
// ratio keeps a glyph comfortably centered (docs/design.md: fixed-pitch cells).
const CELL_RATIO = 1.9;

// docs/design.md Preview grid: fixed-pitch letter cells, high contrast
// (`foreground` on `background`), a `border` between cells. Grid lines come from
// a top/left border on the container plus a right/bottom border per cell, so
// interior lines are single-width and the outer edge is closed. `relative`
// anchors the absolutely-positioned solution overlay to the cell area.
const GRID_CLASSES =
  'relative inline-block border-l border-t border-border bg-background';
const CELL_CLASSES =
  'flex items-center justify-center border-b border-r border-border ' +
  'font-semibold text-foreground';
// Solution overlay (docs/design.md: "solution view highlights placed words with
// `accent`"). One round-capped capsule per word is drawn UNDER the letters
// (translucent `accent`), so the dark `foreground` glyph stays fully opaque on a
// light-amber fill — high contrast, WCAG 2.1 AA (matches the PDF's per-word
// amber stroke, issue #56). Fraction of the cell pitch a capsule fills, and the
// overlay opacity (overlapping capsules shade darker, keeping each readable).
const CAPSULE_WIDTH = 0.72;
const CAPSULE_OPACITY = 0.7;

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
 * The static solution overlay: an SVG sized to the cell area (via `viewBox` in
 * cell units, so it scales with the font-driven cell pitch) drawing one
 * `accent` capsule per placed word. Decorative and non-interactive — hidden from
 * assistive tech (`aria-hidden`) and click-through (`pointer-events-none`); the
 * grid letters carry the semantics.
 */
function SolutionOverlay({
  grid,
  marks,
}: {
  readonly grid: Grid;
  readonly marks: readonly SolutionMark[];
}): JSX.Element {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full stroke-accent"
      viewBox={`0 0 ${grid.width} ${grid.height}`}
      preserveAspectRatio="none"
      fill="none"
      opacity={CAPSULE_OPACITY}
    >
      {marks.map((mark, index) => (
        <line
          key={index}
          data-solution-mark
          x1={mark.start.col}
          y1={mark.start.row}
          x2={mark.end.col}
          y2={mark.end.row}
          strokeWidth={CAPSULE_WIDTH}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

/**
 * The puzzle letter grid — the preview centerpiece (issue #34). Renders every
 * `grid.cells` glyph in a fixed-pitch grid (ARIA `grid`/`row`/`gridcell`),
 * honoring the selected font size (glyph + square cell size). Large grids (up to
 * 30×30) keep a fixed cell pitch and scroll inside the parent container rather
 * than reflowing (spec risk mitigation). When `marks` is non-empty the static
 * "Lösung" solution overlay draws one distinct capsule per placed word (issue
 * #56); the plain puzzle view omits it.
 */
export function PreviewGrid({
  grid,
  fontSize,
  marks,
}: PreviewGridProps): JSX.Element {
  const cellPx = Math.round(fontSize * CELL_RATIO);
  const cell = { width: `${cellPx}px`, height: `${cellPx}px` };
  const hasMarks = marks !== undefined && marks.length > 0;
  return (
    <div
      role="grid"
      aria-label={strings.preview.gridLabel}
      className={GRID_CLASSES}
      style={{ fontSize: `${fontSize}px` }}
    >
      {hasMarks && <SolutionOverlay grid={grid} marks={marks} />}
      {toRows(grid).map((row, rowIndex) => (
        <div key={rowIndex} role="row" className="relative flex">
          {row.map((letter, colIndex) => (
            <div
              key={colIndex}
              role="gridcell"
              className={CELL_CLASSES}
              style={cell}
            >
              {letter}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
