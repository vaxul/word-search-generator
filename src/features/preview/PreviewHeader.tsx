import type { PuzzleHeader } from '../../app/state';
import { strings } from '../../strings';

interface PreviewHeaderProps {
  /** The per-puzzle header (title / theme / date) from the store view-model. */
  readonly header: PuzzleHeader;
}

/** Join theme + date with a middot, dropping whichever is empty (mockup meta). */
function metaLine(theme: string, date: string): string {
  return [theme, date]
    .filter((part) => part.trim().length > 0)
    .join(strings.preview.metaSeparator);
}

/**
 * The per-puzzle header shown above the grid (issue #34): the title on the left
 * and a `secondary` "theme · date" meta line on the right, matching the committed
 * mockup. Renders nothing when every field is empty so the preview stays clean
 * for an untitled puzzle. Text originates from the store (no literals here).
 */
export function PreviewHeader({ header }: PreviewHeaderProps): JSX.Element | null {
  const meta = metaLine(header.theme, header.date);
  const hasTitle = header.title.trim().length > 0;
  if (!hasTitle && meta.length === 0) {
    return null;
  }
  return (
    <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
      {hasTitle ? (
        <p className="text-xl font-bold text-foreground">{header.title}</p>
      ) : (
        <span />
      )}
      {meta.length > 0 ? (
        <p className="text-sm text-secondary">{meta}</p>
      ) : null}
    </div>
  );
}
