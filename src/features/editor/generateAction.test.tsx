// Generate wiring test (issue #33): the primary "Puzzle generieren" button runs
// the Phase 2 engine and stores the result in the app store. Driving the composed
// <App /> proves the full round-trip: words → click → GenerationResult in state.
// The store is internal, so the preview's empty-state text (shown only while
// `result === null`) is the observable proxy for "a result is in state". A
// direct unit test on `runGeneration` asserts the config-build + engine call with
// an injected seed. All assertions reference src/strings/ — no inline German.
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { App } from '../../app/App';
import { strings } from '../../strings';
import { buildPuzzleConfig, runGeneration } from './generatePuzzle';
import type { ConfigInputs } from '../../app/state';

const EASY_INPUTS: ConfigInputs = {
  difficulty: 'easy',
  size: 12,
  directions: ['E', 'S'],
  reverse: false,
};

describe('Generieren button wires words to engine to store', () => {
  it('clicking Generieren stores a result (preview empty state clears)', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText(strings.editor.words.label), {
      target: { value: 'KATZE\nHUND\nMAUS' },
    });
    // Before generation the store result is null → empty state visible.
    expect(screen.getByText(strings.preview.empty)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: strings.editor.generate }),
    );
    // A GenerationResult is now in state → the empty state is gone.
    expect(
      screen.queryByText(strings.preview.empty),
    ).not.toBeInTheDocument();
  });
});

describe('runGeneration builds the config directly and runs the engine', () => {
  it('places the entered words into a fully populated grid (injected seed)', () => {
    const result = runGeneration('KATZE\nHUND\nMAUS', EASY_INPUTS, 12345);
    expect(result.grid.cells).toHaveLength(EASY_INPUTS.size * EASY_INPUTS.size);
    // No empty cells — the engine random-fills the remainder.
    expect(result.grid.cells.every((cell) => cell.length > 0)).toBe(true);
    // Every entered word is accounted for (placed or reported unplaceable).
    expect(result.placed.length + result.unplaceable.length).toBe(3);
  });

  it('maps the square size to width + height and carries directions/reverse', () => {
    const config = buildPuzzleConfig(EASY_INPUTS, ['KATZE']);
    expect(config.width).toBe(12);
    expect(config.height).toBe(12);
    expect(config.directions).toEqual(['E', 'S']);
    expect(config.reverse).toBe(false);
    expect(config.words).toEqual(['KATZE']);
  });
});
