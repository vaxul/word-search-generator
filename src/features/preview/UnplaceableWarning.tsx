import { strings } from '../../strings';

interface UnplaceableWarningProps {
  /** The words the engine could not place — surfaced, never silently dropped. */
  readonly unplaceable: readonly string[];
}

// docs/design.md Word-list textarea component: un-placeable warnings use the
// `destructive` token — a destructive border + destructive message. The text
// sits on the card's `background` (white), where `destructive` #dc2626 clears
// WCAG 2.1 AA (~4.8:1); a tinted fill would drop it below 4.5:1, so it is
// intentionally omitted (design specifies only border + message).
const WARNING_CLASSES =
  'mt-4 rounded-md border border-destructive bg-background p-3 ' +
  'text-sm text-destructive';

/**
 * Destructive-styled message listing exactly the words that could not be placed
 * (issue #34; docs/vision.md "never a silent omission"). Renders nothing when
 * every word was placed. `role="alert"` announces the omission to assistive tech.
 * The exact words are listed so the user can shorten the grid or the word.
 */
export function UnplaceableWarning({
  unplaceable,
}: UnplaceableWarningProps): JSX.Element | null {
  if (unplaceable.length === 0) {
    return null;
  }
  return (
    <p role="alert" className={WARNING_CLASSES}>
      <span className="font-semibold">{strings.preview.unplaceable.label}</span>{' '}
      {unplaceable.join(strings.preview.unplaceable.separator)}
    </p>
  );
}
