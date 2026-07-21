import type { PlacedWord } from '../../core';
import { strings } from '../../strings';

interface WordsToFindProps {
  /** The words successfully placed in the grid — the list to find (chips). */
  readonly placed: readonly PlacedWord[];
}

// docs/design.md: each chip is a `border`-outlined pill on `background`, high
// contrast `foreground` text. The section label is a small `secondary`
// uppercase caption (mockup "ZU FINDEN").
const CHIP_CLASSES =
  'rounded-full border border-border bg-background px-3 py-1 ' +
  'text-sm text-foreground';

/**
 * The "Zu finden" word list shown below the grid (issue #34) — one chip per
 * PLACED word (the answer set the child searches for). Un-placeable words are
 * deliberately absent here; they surface in the destructive warning instead, so
 * a puzzle never lists a word that is not actually hidden. Renders nothing when
 * no word was placed.
 */
export function WordsToFind({ placed }: WordsToFindProps): JSX.Element | null {
  if (placed.length === 0) {
    return null;
  }
  return (
    <div className="mt-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
        {strings.preview.wordsToFind}
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {placed.map((entry) => (
          <li key={entry.word} className={CHIP_CLASSES}>
            {entry.word}
          </li>
        ))}
      </ul>
    </div>
  );
}
