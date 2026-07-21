import { EditorPanel } from '../features/editor';
import { PreviewPanel } from '../features/preview';
import { strings } from '../strings';
import { AppHeader } from './AppHeader';
import { Card } from './Card';
import { useAppStore } from './useAppStore';

// App shell (Phase 3, issue #30): the composition root. It owns the app state
// store (useAppStore → useReducer) and lays out the two-card responsive grid —
// the editor card (left) and the preview card (right) — per the committed mockup
// (docs/design/assets/editor-preview-mockup.png). The cards host the feature
// panels, which are placeholders until the later Phase 3 issues fill them in.
// The shell reads `state`; later issues import `dispatch` to drive edits.
export function App(): JSX.Element {
  const { state } = useAppStore();
  return (
    <main className="min-h-screen bg-muted p-6 font-sans text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <AppHeader />
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[380px_1fr]">
          <Card ariaLabel={strings.editor.regionLabel}>
            <EditorPanel />
          </Card>
          <Card ariaLabel={strings.preview.regionLabel}>
            <PreviewPanel
              title={state.header.title}
              hasResult={state.result !== null}
              fontFamily={state.font.family}
            />
          </Card>
        </div>
      </div>
    </main>
  );
}
