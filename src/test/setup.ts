// Vitest global setup, loaded via `test.setupFiles` in vite.config.ts.
// - Registers @testing-library/jest-dom matchers on Vitest's `expect`
//   (and augments its type, so `toBeInTheDocument` etc. type-check).
// - Unmounts React trees after every test. RTL only auto-cleans when Vitest
//   globals are enabled; this project keeps globals off, so cleanup is explicit.
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

afterEach(() => {
  cleanup();
});
