// Component test for the export trigger (issue #41). Proves: the action is
// disabled with no generated puzzle and enabled once a result exists; clicking
// downloads TWO separate files with the `-raetsel` (puzzle) and `-loesung`
// (solution) names; and the filename stem comes from the sanitized title with a
// fallback when empty. The browser download path is exercised for real — only
// the jsdom-absent `URL.createObjectURL`/`revokeObjectURL` and the anchor click
// are stubbed, capturing each `download` name. All UI text is read from
// src/strings/ (no inline German literal).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ExportAction } from './ExportAction';
import { strings } from '../../strings';
import { generate } from '../../core';
import type { FontSettings, PuzzleHeader } from '../../app/state';
import type { GenerationResult, PuzzleConfig } from '../../core';

const CONFIG: PuzzleConfig = {
  width: 8,
  height: 8,
  directions: ['E', 'S'],
  reverse: false,
  words: ['KATZE', 'HUND'],
};

const FONT: FontSettings = { family: 'accessible', size: 16 };

function makeResult(): GenerationResult {
  return generate(CONFIG, 42);
}

function header(title: string): PuzzleHeader {
  return { title, theme: '', date: '' };
}

const originalCreate = URL.createObjectURL;
const originalRevoke = URL.revokeObjectURL;
let downloads: string[];

beforeEach(() => {
  downloads = [];
  URL.createObjectURL = vi.fn(() => 'blob:mock');
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
    function (this: HTMLAnchorElement) {
      downloads.push(this.download);
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  URL.createObjectURL = originalCreate;
  URL.revokeObjectURL = originalRevoke;
});

describe('ExportAction enabled state', () => {
  it('is disabled while there is no generated puzzle', () => {
    render(<ExportAction result={null} header={header('')} font={FONT} />);
    expect(
      screen.getByRole('button', { name: strings.export.action }),
    ).toBeDisabled();
  });

  it('is enabled once a result exists', () => {
    render(
      <ExportAction result={makeResult()} header={header('Tiere')} font={FONT} />,
    );
    expect(
      screen.getByRole('button', { name: strings.export.action }),
    ).toBeEnabled();
  });
});

describe('ExportAction download', () => {
  it('downloads two files named from the sanitized title (-raetsel + -loesung)', () => {
    render(
      <ExportAction
        result={makeResult()}
        header={header('Tiere im Wald')}
        font={FONT}
      />,
    );
    fireEvent.click(
      screen.getByRole('button', { name: strings.export.action }),
    );
    expect(downloads).toEqual([
      'tiere-im-wald-raetsel.pdf',
      'tiere-im-wald-loesung.pdf',
    ]);
    expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
  });

  it('uses the German fallback stem when the title is empty', () => {
    render(
      <ExportAction result={makeResult()} header={header('')} font={FONT} />,
    );
    fireEvent.click(
      screen.getByRole('button', { name: strings.export.action }),
    );
    expect(downloads).toEqual([
      'wortsuche-raetsel.pdf',
      'wortsuche-loesung.pdf',
    ]);
  });

  it('does nothing when clicked without a result (guarded)', () => {
    render(<ExportAction result={null} header={header('')} font={FONT} />);
    // Disabled buttons ignore clicks; the handler also guards on null.
    fireEvent.click(
      screen.getByRole('button', { name: strings.export.action }),
    );
    expect(downloads).toEqual([]);
  });
});
