// Smoke test for the Vitest + React Testing Library harness (issue #5).
// Deliberately self-contained — it renders an inline component and does NOT
// import the app shell, so it passes regardless of parallel work on src/app
// (issue #6). It proves the pipeline works: jsdom environment, JSX transform,
// RTL render/query, and the jest-dom matchers wired via src/test/setup.ts.
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

function HarnessProbe(): JSX.Element {
  return <h1>harness ready</h1>;
}

describe('test harness', () => {
  it('renders a React component into the jsdom document', () => {
    render(<HarnessProbe />);
    expect(
      screen.getByRole('heading', { name: 'harness ready' }),
    ).toBeInTheDocument();
  });
});
