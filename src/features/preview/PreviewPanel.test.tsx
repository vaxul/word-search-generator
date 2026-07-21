// PreviewPanel font-wiring test (issue #31): the preview content region applies
// the selected font via the token-derived `fontFamilyClass`. This proves a
// component can apply the vendored accessible font (`font-accessible`) and that
// the default `sans` family stays on `font-sans` (Inter) — the acceptance point
// "a component can apply the accessible font via a token-derived utility".
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PreviewPanel } from './PreviewPanel';
import { strings } from '../../strings';

describe('PreviewPanel font wiring', () => {
  function contentRegion(): HTMLElement {
    // The heading lives inside the font-carrying content region root.
    const heading = screen.getByRole('heading', {
      name: strings.preview.heading,
    });
    const region = heading.parentElement;
    if (region === null) throw new Error('preview content region not found');
    return region;
  }

  it('applies the accessible font utility when the family is accessible', () => {
    render(<PreviewPanel title="" hasResult={false} fontFamily="accessible" />);
    expect(contentRegion()).toHaveClass('font-accessible');
  });

  it('applies the sans font utility when the family is sans', () => {
    render(<PreviewPanel title="" hasResult={false} fontFamily="sans" />);
    expect(contentRegion()).toHaveClass('font-sans');
  });
});
