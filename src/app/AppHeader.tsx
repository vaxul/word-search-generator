import { strings } from '../strings';

/**
 * The app header: a token-styled logo badge + product title on the left and the
 * differentiator meta on the right (docs/design/assets/editor-preview-mockup.png).
 * All text comes from src/strings/. `primary` badge with white glyph and the
 * `secondary` meta both clear WCAG 2.1 AA on the page background.
 */
export function AppHeader(): JSX.Element {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-xl font-bold text-white"
        >
          {strings.app.logoInitial}
        </span>
        <h1 className="text-2xl font-bold text-foreground">
          {strings.app.title}
        </h1>
      </div>
      <p className="text-sm text-secondary">{strings.app.meta}</p>
    </header>
  );
}
