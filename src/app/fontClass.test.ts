import { describe, expect, it } from 'vitest';
import { fontFamilyClass } from './fontClass';

// The token → utility wiring (issue #31): the accessible family resolves to the
// `font-accessible` utility (backed by the vendored fonts + `--font-accessible`
// token), and the default `sans` family stays on `font-sans` (Inter).
describe('fontFamilyClass', () => {
  it('maps the accessible family to the token-derived utility', () => {
    expect(fontFamilyClass('accessible')).toBe('font-accessible');
  });

  it('maps the default sans family to the Inter utility', () => {
    expect(fontFamilyClass('sans')).toBe('font-sans');
  });
});
