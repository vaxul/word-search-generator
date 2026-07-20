import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/main.css';

// Trivial placeholder shell proving the React + Vite + Tailwind + TypeScript
// pipeline. The utility classes below resolve to design-token values (see
// src/styles/tokens.css ← docs/design.md), proving the Tailwind-to-tokens
// wiring end-to-end. The real app shell and strings module arrive later.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <main className="min-h-screen bg-background p-8 font-sans text-foreground">
      <h1 className="text-2xl font-bold text-primary">Wortsuche-Generator</h1>
      <p className="mt-4">Scaffold läuft.</p>
    </main>
  </StrictMode>,
);
