import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/main.css';

// Entry point: mounts the app shell (src/app/App.tsx). The shell renders its
// German text through src/strings/ and styles it with token-derived Tailwind
// utilities (src/styles/tokens.css ← docs/design.md).
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
