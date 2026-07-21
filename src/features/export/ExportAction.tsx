import type { FontSettings, PuzzleHeader } from '../../app/state';
import type { GenerationResult, PuzzleView, SolutionView } from '../../core';
import { strings } from '../../strings';
import { exportPuzzlePdfs } from './exportPuzzle';

interface ExportActionProps {
  /** The current generation result — `null` until a puzzle is generated. */
  readonly result: GenerationResult | null;
  /** The per-puzzle header (title / theme / date) carried into the PDF. */
  readonly header: PuzzleHeader;
  /** The font view-model (family + size) applied to the rendered document. */
  readonly font: FontSettings;
}

// Design contract (docs/design.md): the amber `accent` marks the primary
// generate/DOWNLOAD action, with the DARK `foreground` label — dark-on-amber is
// WCAG 2.1 AA, white-on-amber is not. A visible `primary` focus ring meets the
// focus-state requirement. The disabled state (no puzzle yet) uses the `muted`
// background + `secondary` label and a not-allowed cursor.
const CLASSES =
  'w-full rounded-md bg-accent px-4 py-3 text-base font-semibold ' +
  'text-foreground transition-colors hover:brightness-95 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ' +
  'focus-visible:ring-offset-2 disabled:cursor-not-allowed ' +
  'disabled:bg-muted disabled:text-secondary disabled:hover:brightness-100';

/** Builds the puzzle + solution view-models from the editor state. */
function buildViews(
  header: PuzzleHeader,
  font: FontSettings,
): { puzzle: PuzzleView; solution: SolutionView } {
  const puzzle: PuzzleView = {
    header,
    fontFamily: font.family,
    fontSize: font.size,
  };
  return {
    puzzle,
    solution: { ...puzzle, solutionSuffix: strings.export.solutionSuffix },
  };
}

/**
 * The "Als PDF herunterladen" action (issue #41) — lives with the editor next to
 * "Puzzle generieren". On click it builds the puzzle + solution view-models from
 * the store state and downloads TWO separate files (`-raetsel` + `-loesung`) via
 * the feature-layer download helper; no runtime network call. Disabled (and so
 * inert) while `result === null` — there is no puzzle to export yet. All labels
 * and the solution suffix come from `src/strings/`.
 */
export function ExportAction({
  result,
  header,
  font,
}: ExportActionProps): JSX.Element {
  const handleExport = (): void => {
    if (result === null) return;
    const { puzzle, solution } = buildViews(header, font);
    exportPuzzlePdfs(result, puzzle, solution, strings.export.filename);
  };
  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={result === null}
      className={CLASSES}
    >
      {strings.export.action}
    </button>
  );
}
