import { strings } from '../strings';

// Minimal app shell (Phase 1): a placeholder screen that proves the
// React + Vite + Tailwind + strings-module pipeline end-to-end. All text comes
// from src/strings/; the utility classes resolve to design-token values (see
// src/styles/tokens.css ← docs/design.md). Real editor/preview/export UI arrives
// in later phases (docs/architecture.md, src/features/).
export function App() {
  return (
    <main className="min-h-screen bg-background p-8 font-sans text-foreground">
      <h1 className="text-2xl font-bold text-primary">{strings.app.title}</h1>
      <p className="mt-4 text-secondary">{strings.app.tagline}</p>
    </main>
  );
}
