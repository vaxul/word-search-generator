import { useState } from 'react';
import { fontFamilyClass } from '../../app/fontClass';
import type { FontSettings, PuzzleHeader } from '../../app/state';
import type { GenerationResult } from '../../core';
import { strings } from '../../strings';
import { PreviewGrid } from './PreviewGrid';
import { PreviewHeader } from './PreviewHeader';
import { SolutionToggle } from './SolutionToggle';
import type { PreviewView } from './SolutionToggle';
import { solutionCellIndices } from './solutionCells';
import { UnplaceableWarning } from './UnplaceableWarning';
import { WordsToFind } from './WordsToFind';

interface PreviewPanelProps {
  /** The latest generation result, or `null` before the first generation. */
  readonly result: GenerationResult | null;
  /** The per-puzzle header (title / theme / date) shown above the grid. */
  readonly header: PuzzleHeader;
  /** The selected font family + size — honored by the whole preview. */
  readonly font: FontSettings;
}

/**
 * Preview panel — the right card's content region (issue #34). Renders the
 * per-puzzle header, the fixed-pitch letter grid, the "Zu finden" word chips, and
 * a destructive un-placeable warning for the current {@link GenerationResult};
 * before any generation it keeps the empty state. The content region applies the
 * selected accessible font via the token-derived `fontFamilyClass` (issue #31),
 * and the chosen size flows into the grid. The Puzzle/Lösung view toggle (issue
 * #35) switches the grid between the plain puzzle and the static solution
 * highlight (placed words painted with the accent color); the view is local UI
 * state since it is a preview concern, not puzzle data.
 */
export function PreviewPanel({
  result,
  header,
  font,
}: PreviewPanelProps): JSX.Element {
  const [view, setView] = useState<PreviewView>('puzzle');
  const highlighted =
    result !== null && view === 'solution'
      ? solutionCellIndices(result.placed, result.grid)
      : undefined;
  return (
    <div className={fontFamilyClass(font.family)}>
      <h2 className="text-lg font-semibold text-foreground">
        {strings.preview.heading}
      </h2>
      {result === null ? (
        <p className="mt-4 text-sm text-secondary">{strings.preview.empty}</p>
      ) : (
        <>
          <PreviewHeader header={header} />
          <UnplaceableWarning unplaceable={result.unplaceable} />
          <div className="mt-4">
            <SolutionToggle view={view} onChange={setView} />
          </div>
          <div className="mt-4 overflow-auto">
            <PreviewGrid
              grid={result.grid}
              fontSize={font.size}
              highlighted={highlighted}
            />
          </div>
          <WordsToFind placed={result.placed} />
        </>
      )}
    </div>
  );
}
