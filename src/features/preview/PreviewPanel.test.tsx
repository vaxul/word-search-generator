// PreviewPanel component tests (issues #31, #34):
//   #31 — the preview content region applies the selected font via the
//         token-derived `fontFamilyClass` (`font-accessible` / `font-sans`).
//   #34 — the grid renders the GenerationResult letters, the header shows above
//         it, the placed words appear as "Zu finden" chips, and un-placeable
//         words surface in a destructive-styled warning listing exactly them.
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { PreviewPanel } from './PreviewPanel';
import type { FontSettings, PuzzleHeader } from '../../app/state';
import type { GenerationResult } from '../../core';
import { strings } from '../../strings';

const EMPTY_HEADER: PuzzleHeader = { title: '', theme: '', date: '' };
const DEFAULT_FONT: FontSettings = { family: 'accessible', size: 16 };

// A 3×2 grid; `cells` is row-major (cell (r,c) = cells[r*width+c]).
const RESULT: GenerationResult = {
  grid: { width: 3, height: 2, cells: ['A', 'B', 'C', 'D', 'E', 'F'] },
  placed: [
    { word: 'ABC', start: { row: 0, col: 0 }, direction: 'E' },
    { word: 'DEF', start: { row: 1, col: 0 }, direction: 'E' },
  ],
  unplaceable: [],
};

describe('PreviewPanel font wiring (issue #31)', () => {
  function contentRegion(): HTMLElement {
    const heading = screen.getByRole('heading', {
      name: strings.preview.heading,
    });
    const region = heading.parentElement;
    if (region === null) throw new Error('preview content region not found');
    return region;
  }

  it('applies the accessible font utility when the family is accessible', () => {
    render(
      <PreviewPanel result={null} header={EMPTY_HEADER} font={DEFAULT_FONT} />,
    );
    expect(contentRegion()).toHaveClass('font-accessible');
  });

  it('applies the sans font utility when the family is sans', () => {
    render(
      <PreviewPanel
        result={null}
        header={EMPTY_HEADER}
        font={{ family: 'sans', size: 16 }}
      />,
    );
    expect(contentRegion()).toHaveClass('font-sans');
  });
});

describe('PreviewPanel empty state (issue #34)', () => {
  it('shows the empty state when there is no result', () => {
    render(
      <PreviewPanel result={null} header={EMPTY_HEADER} font={DEFAULT_FONT} />,
    );
    expect(screen.getByText(strings.preview.empty)).toBeInTheDocument();
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });
});

describe('PreviewPanel grid render (issue #34)', () => {
  it('renders every grid cell letter in row-major order', () => {
    render(
      <PreviewPanel result={RESULT} header={EMPTY_HEADER} font={DEFAULT_FONT} />,
    );
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(6);
    expect(cells.map((cell) => cell.textContent)).toEqual([
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
    ]);
  });

  it('honors the selected font size on the grid', () => {
    render(
      <PreviewPanel
        result={RESULT}
        header={EMPTY_HEADER}
        font={{ family: 'accessible', size: 24 }}
      />,
    );
    expect(screen.getByRole('grid')).toHaveStyle({ fontSize: '24px' });
  });

  it('shows the per-puzzle header (title + theme/date) above the grid', () => {
    render(
      <PreviewPanel
        result={RESULT}
        header={{ title: 'Tiere', theme: 'Klasse 3b', date: '21.07.2026' }}
        font={DEFAULT_FONT}
      />,
    );
    expect(screen.getByText('Tiere')).toBeInTheDocument();
    expect(screen.getByText(/Klasse 3b.*21\.07\.2026/)).toBeInTheDocument();
  });

  it('shows the placed words as "Zu finden" chips', () => {
    render(
      <PreviewPanel result={RESULT} header={EMPTY_HEADER} font={DEFAULT_FONT} />,
    );
    const list = screen.getByRole('list');
    expect(within(list).getByText('ABC')).toBeInTheDocument();
    expect(within(list).getByText('DEF')).toBeInTheDocument();
  });
});

describe('PreviewPanel un-placeable warning (issue #34)', () => {
  it('lists exactly the un-placeable words in a destructive alert', () => {
    render(
      <PreviewPanel
        result={{ ...RESULT, unplaceable: ['SCHMETTERLING', 'NASHORN'] }}
        header={EMPTY_HEADER}
        font={DEFAULT_FONT}
      />,
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('SCHMETTERLING');
    expect(alert).toHaveTextContent('NASHORN');
    expect(alert).toHaveClass('text-destructive');
    // A placed word is never listed as un-placeable.
    expect(alert).not.toHaveTextContent('ABC');
  });

  it('renders no warning when every word was placed', () => {
    render(
      <PreviewPanel result={RESULT} header={EMPTY_HEADER} font={DEFAULT_FONT} />,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

// A 3×2 grid where only cells 0,1 (the placed word "HI") belong to a solution;
// cells 2..5 are filler, so the highlight can be asserted both on and off.
const PARTIAL: GenerationResult = {
  grid: { width: 3, height: 2, cells: ['H', 'I', 'X', 'Y', 'Z', 'Q'] },
  placed: [{ word: 'HI', start: { row: 0, col: 0 }, direction: 'E' }],
  unplaceable: [],
};

function solutionButton(): HTMLElement {
  return screen.getByRole('button', { name: strings.preview.view.solution });
}
function puzzleButton(): HTMLElement {
  return screen.getByRole('button', { name: strings.preview.view.puzzle });
}
function renderPartial(): void {
  render(
    <PreviewPanel result={PARTIAL} header={EMPTY_HEADER} font={DEFAULT_FONT} />,
  );
}
function hasAnyHighlight(): boolean {
  return screen
    .getAllByRole('gridcell')
    .some((cell) => cell.className.includes('bg-accent'));
}

describe('PreviewPanel solution toggle (issue #35)', () => {
  it('defaults to the plain puzzle view with no highlighted cells', () => {
    renderPartial();
    expect(hasAnyHighlight()).toBe(false);
    expect(puzzleButton()).toHaveAttribute('aria-pressed', 'true');
    expect(solutionButton()).toHaveAttribute('aria-pressed', 'false');
  });

  it('highlights exactly the placed-word cells with accent in the solution view', () => {
    renderPartial();
    fireEvent.click(solutionButton());
    const cells = screen.getAllByRole('gridcell');
    // "HI" occupies cells 0 and 1; the filler cells stay un-highlighted.
    expect(cells[0]).toHaveClass('bg-accent');
    expect(cells[1]).toHaveClass('bg-accent');
    expect(cells[2]).not.toHaveClass('bg-accent');
    expect(cells[5]).not.toHaveClass('bg-accent');
    expect(solutionButton()).toHaveAttribute('aria-pressed', 'true');
  });

  it('returns to the plain puzzle view when toggled back', () => {
    renderPartial();
    fireEvent.click(solutionButton());
    expect(screen.getAllByRole('gridcell')[0]).toHaveClass('bg-accent');
    fireEvent.click(puzzleButton());
    expect(hasAnyHighlight()).toBe(false);
  });
});

describe('PreviewPanel solution view is static (issue #35)', () => {
  it('keeps grid cells non-interactive in the solution view', () => {
    renderPartial();
    fireEvent.click(solutionButton());
    // No cell is a button/checkbox: the solution view is a print preview, not a
    // solving game (spec Prior decision: static highlight, no marking).
    for (const cell of screen.getAllByRole('gridcell')) {
      expect(cell.tagName).toBe('DIV');
      expect(cell).not.toHaveAttribute('onclick');
    }
    expect(within(screen.getByRole('grid')).queryByRole('button')).toBeNull();
  });
});
