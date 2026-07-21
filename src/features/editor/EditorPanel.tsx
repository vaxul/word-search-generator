import { strings } from '../../strings';

/**
 * Editor panel — the left card's content region. Phase 3 FOUNDATION seam
 * (issue #30): renders the heading and a placeholder only. The word-list
 * textarea, difficulty presets, size/direction controls, header + font controls,
 * and the "Generieren" action land in later Phase 3 issues (#31–#33, #35), each
 * wiring the store's dispatch. UI text comes from src/strings/.
 */
export function EditorPanel(): JSX.Element {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">
        {strings.editor.heading}
      </h2>
      <p className="mt-4 text-sm text-secondary">{strings.editor.placeholder}</p>
    </div>
  );
}
