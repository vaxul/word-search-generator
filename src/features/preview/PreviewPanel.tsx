import { strings } from '../../strings';

interface PreviewPanelProps {
  /** The per-puzzle title from the store header; shown once a puzzle exists. */
  readonly title: string;
  /** Whether a generation result exists — drives the empty state for now. */
  readonly hasResult: boolean;
}

/**
 * Preview panel — the right card's content region. Phase 3 FOUNDATION seam
 * (issue #30): renders the heading, the puzzle title once present, and an empty
 * state. The generated grid, word-list-to-find, un-placeable warning, and the
 * "Lösung" toggle land in later Phase 3 issues (#34, #35). UI text comes from
 * src/strings/.
 */
export function PreviewPanel({
  title,
  hasResult,
}: PreviewPanelProps): JSX.Element {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">
        {strings.preview.heading}
      </h2>
      {title ? (
        <p className="mt-4 text-xl font-bold text-foreground">{title}</p>
      ) : null}
      {hasResult ? null : (
        <p className="mt-4 text-sm text-secondary">{strings.preview.empty}</p>
      )}
    </div>
  );
}
