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
// The shell owns `state` + `dispatch`; the editor controls (issue #32) mutate
// state via `dispatch`, and the preview reads from `state`.
export function App(): JSX.Element {
  const { state, dispatch } = useAppStore();
  return (
    <main className="min-h-screen bg-muted p-6 font-sans text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <AppHeader />
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[380px_1fr]">
          <Card ariaLabel={strings.editor.regionLabel}>
            <EditorPanel state={state} dispatch={dispatch} />
          </Card>
          <Card ariaLabel={strings.preview.regionLabel}>
            <PreviewPanel
              result={state.result}
              header={state.header}
              font={state.font}
            />
          </Card>
        </div>
      </div>
    </main>
  );
}
