import { strings } from '../../strings';

interface UnplaceableWarningProps {
  /** The words the engine could not place — surfaced, never silently dropped. */
  readonly unplaceable: readonly string[];
}

// docs/design.md Word-list textarea component: un-placeable warnings use the
// `destructive` token — a destructive border + tinted background + destructive
// text. High enough contrast for WCAG 2.1 AA (dark red on a light tint).
const WARNING_CLASSES =
  'mt-4 rounded-md border border-destructive bg-destructive/10 p-3 ' +
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
