import { fontFamilyClass } from '../../app/fontClass';
import type { FontSettings, PuzzleHeader } from '../../app/state';
import type { GenerationResult } from '../../core';
import { strings } from '../../strings';
import { PreviewGrid } from './PreviewGrid';
import { PreviewHeader } from './PreviewHeader';
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
 * and the chosen size flows into the grid. The plain puzzle view only — the
 * "Lösung" highlight toggle is issue #35, which slots in beside the grid.
 */
export function PreviewPanel({
  result,
  header,
  font,
}: PreviewPanelProps): JSX.Element {
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
          <div className="mt-4 overflow-auto">
            <PreviewGrid grid={result.grid} fontSize={font.size} />
          </div>
          <WordsToFind placed={result.placed} />
        </>
      )}
    </div>
  );
}
