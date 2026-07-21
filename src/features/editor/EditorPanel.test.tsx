// Editor controls test (issue #32): the controls are wired to the #30 store, so
// driving them through the composed <App /> proves the dispatch round-trip —
// words, difficulty presets (seeding size + directions + reverse), the clamped
// size input, direction + reverse toggles, and the header + font controls. All
// assertions reference src/strings/ — no inline German literals.
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { App } from '../../app/App';
import { strings } from '../../strings';

const s = strings.editor;

function sizeInput(): HTMLInputElement {
  return screen.getByLabelText(s.size.label) as HTMLInputElement;
}

function directionButton(label: string): HTMLElement {
  return within(
    screen.getByRole('group', { name: s.directions.groupLabel }),
  ).getByRole('button', { name: label });
}

describe('editor controls wired to the store', () => {
  it('typing words updates the word textarea state', () => {
    render(<App />);
    const textarea = screen.getByLabelText(
      s.words.label,
    ) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'KATZE\nHUND' } });
    expect(textarea.value).toBe('KATZE\nHUND');
  });

  it('selecting the Hard preset seeds size + directions + reverse', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: s.difficulty.hard }));
    // Hard = 18×18, all 8 directions, reverse ON (Phase 2 mapping).
    expect(sizeInput().value).toBe('18');
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    // 'W' is off under Medium (the default) but on under Hard.
    expect(directionButton(s.directions.labels.W)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('clamps a manual size above the 5-30 bound', () => {
    render(<App />);
    fireEvent.change(sizeInput(), { target: { value: '99' } });
    expect(sizeInput().value).toBe('30');
  });

  it('clamps a manual size below the 5-30 bound', () => {
    render(<App />);
    fireEvent.change(sizeInput(), { target: { value: '2' } });
    expect(sizeInput().value).toBe('5');
  });
});

describe('editor toggles and header/font controls', () => {
  it('toggling a direction flips its pressed state (manual override)', () => {
    render(<App />);
    // 'E' is on under the default Medium preset; toggling turns it off.
    const east = directionButton(s.directions.labels.E);
    expect(east).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(east);
    expect(east).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggling reverse flips the switch state', () => {
    render(<App />);
    const reverse = screen.getByRole('switch');
    expect(reverse).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(reverse);
    expect(reverse).toHaveAttribute('aria-checked', 'true');
  });

  it('editing the title header field updates state (shown in the preview)', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(s.header.title), {
      target: { value: 'Tiere im Wald' },
    });
    expect(screen.getByText('Tiere im Wald')).toBeInTheDocument();
  });

  it('changing the font family updates the font control state', () => {
    render(<App />);
    const family = screen.getByLabelText(
      s.font.familyLabel,
    ) as HTMLSelectElement;
    expect(family.value).toBe('accessible');
    fireEvent.change(family, { target: { value: 'sans' } });
    expect(family.value).toBe('sans');
  });

  it('changing the font size updates the font control state', () => {
    render(<App />);
    const size = screen.getByLabelText(s.font.sizeLabel) as HTMLSelectElement;
    fireEvent.change(size, { target: { value: '24' } });
    expect(size.value).toBe('24');
  });
});
