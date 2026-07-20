import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Trivial placeholder shell proving the React + Vite + TypeScript pipeline.
// The real app shell, strings module, and styling arrive in later phases.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <main>
      <h1>Wortsuche-Generator</h1>
      <p>Scaffold läuft.</p>
    </main>
  </StrictMode>,
);
