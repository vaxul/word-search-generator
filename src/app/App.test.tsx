// Shell render test (issue #30 verification): the two-card layout renders with
// both region landmarks and text sourced from src/strings/ — no hardcoded German
// literals in the assertions (they reference the strings module, mirroring the
// centralized-strings rule).
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';
import { strings } from '../strings';

describe('App shell', () => {
  it('renders the product title and header meta from strings', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: strings.app.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(strings.app.meta)).toBeInTheDocument();
  });

  it('renders both card regions (editor and preview)', () => {
    render(<App />);
    expect(
      screen.getByRole('region', { name: strings.editor.regionLabel }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: strings.preview.regionLabel }),
    ).toBeInTheDocument();
  });

  it('shows the editor and preview headings from strings', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: strings.editor.heading }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: strings.preview.heading }),
    ).toBeInTheDocument();
  });

  it('shows the preview empty state before any puzzle is generated', () => {
    render(<App />);
    expect(screen.getByText(strings.preview.empty)).toBeInTheDocument();
  });
});
