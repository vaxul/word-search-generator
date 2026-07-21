# Spec: Phase 3 — Editor & preview UI

> Created: 2026-07-21

The single-screen React editor that turns a word list plus configuration into a
`PuzzleConfig`, drives the Phase 2 grid engine, and shows a live, legible preview
of the generated puzzle — with difficulty presets, direction control, a
per-puzzle header, un-placeable-word reporting, and a dyslexia-friendly font — so
the user can see the finished puzzle on screen before the Phase 4 print/export
step exists.

## Outcome

What is true when this work is done:

- [ ] `src/features/editor/` collects a word list plus configuration and builds
      the Phase 2 `PuzzleConfig` (`{ width, height, directions, reverse, words }`)
      to invoke `generate()`. The per-puzzle header, font choice + size, and the
      chosen difficulty are **feature/app view-model state** (the header/font
      destined for the Phase 4 PDF; the difficulty mapped to a config via the
      engine's `configFromDifficulty`) — **never** fields on the core
      `PuzzleConfig`, whose sole role is generation inputs (the `src/core`
      boundary).
- [ ] `src/features/preview/` renders the generated grid with fixed-pitch cells,
      honoring the selected accessible font, plus the list of words to find.
- [ ] Words that cannot be placed are surfaced clearly to the user
      (destructive-styled message) — never silently dropped (`docs/vision.md`
      success criterion), matching the engine's un-placeable list.
- [ ] Difficulty presets (Easy / Medium / Hard) set grid size + direction set +
      reverse per the Phase 2 mapping; the user may override size (within the
      5×5–30×30 bound) and directions manually.
- [ ] A dyslexia-friendly font (Atkinson Hyperlegible / OpenDyslexic) is
      selectable and applies to the on-screen preview grid; font size is
      adjustable across the design type scale.
- [ ] `src/app/` wires the editor ↔ preview state with plain React state (no
      state-management library).
- [ ] Every interactive element meets **WCAG 2.1 AA** contrast (`docs/design.md`).
- [ ] All UI text is German, sourced from `src/strings/` — no German literals in
      components.
- [ ] `npm run verify` passes; the UI ships with React Testing Library component
      tests; `src/features/*` imports `src/core/*`, never the reverse.

## Scope

### In scope

- **Word entry** — a textarea, one word per line, paste-friendly; the app trims
  whitespace, drops empty lines, and de-duplicates before building the config
  (case-folding/normalization itself stays the engine's job).
- **Configuration controls** — grid size (numeric, bounded 5–30), an 8-direction
  labelled toggle group with a reverse toggle, and the three difficulty presets
  (a preset sets size + directions + reverse; manual edits are allowed after).
- **Per-puzzle header** — title / name, theme, and date fields carried on the
  puzzle (shown in the preview; consumed by the Phase 4 PDF).
- **Font controls** — accessible-font toggle (default Inter → Atkinson
  Hyperlegible / OpenDyslexic) and an adjustable font size (design type scale),
  applied to the preview grid.
- **Generate action** — the single primary "Generieren" button that runs
  `generate()` with a fresh app-generated seed each click and shows the result.
- **Preview** — the generated grid, the word-list-to-find, the un-placeable
  warning, and a **"Lösung" toggle** that highlights the placed words on the grid
  (`accent`) as a static answer-key view.
- **App state wiring** in `src/app/` and centralized German strings in
  `src/strings/`.
- **Accessible-font assets** — vendor Atkinson Hyperlegible and OpenDyslexic (both
  freely licensed, SIL OFL) as build assets used by preview (and later print).

### Out of scope

- **PDF export / print layout / download** — Phase 4 (`src/features/export/`,
  `src/core/pdf/`). Phase 3 shows the puzzle on screen only.
- **Multiple puzzles per A4 page** — Phase 4 packing; the Phase 3 preview shows a
  single puzzle.
- **Interactive on-screen solving / marking** — `docs/vision.md` non-goal (this is
  a print tool, not a game). The static solution *highlight* toggle (in scope
  above) is included; interactive solving is never built.
- **Save / load config, batch / book mode, word-list templates, user-facing seed
  / reproducibility** — `docs/vision.md` "Out".

## Constraints

Per `docs/constitution.md`, `docs/architecture.md`, and `docs/design.md`
(referenced, not restated):

- Stack fixed: React 18 + Vite + Tailwind wired to the design tokens.
- `src/features/*` and `src/app/*` may import `src/core/*`, **never** the reverse
  (ESLint-enforced); no `any`; no runtime network calls (fonts are bundled build
  assets, not fetched at runtime).
- `Math.random()` is banned in `src/core/` only — the **feature layer** generates
  the per-run seed and passes it into `generate()` (the engine stays
  deterministic given that seed).
- All UI text German, centralized in `src/strings/`; components `PascalCase.tsx`,
  other files `camelCase.ts`; named exports only; max function 50 lines / file
  300 lines.
- **WCAG 2.1 AA** contrast on every interactive element and the preview grid; the
  dyslexia-friendly font applies to the preview (and, in Phase 4, the print).
- Consumes the Phase 2 engine (`generate`, difficulty presets, `GenerationResult`)
  — milestone depends on milestone #2 (closed).

## Prior art

From `docs/prior-art.md`, indexed by concern for this phase:

- [Puzzle input & configuration UI (Phase 3)](../prior-art.md#puzzle-input--configuration-ui-phase-3)
  — the minimal, no-signup flow (paste words → set size + directions → preview),
  5×5–30×30, 8 directions, reverse, difficulty presets; avoid ads / forced
  accounts / cluttered dated UIs.
- [Product differentiation (feature: differentiation)](../prior-art.md#product-differentiation-feature-differentiation)
  — own the A4-first, ad-free, no-account gap; avoid feature-creep into a general
  worksheet suite.

## Human prerequisites

- **none.** Pure client-side UI — no secrets, external provisioning, accounts, or
  dashboard config. The accessible fonts (Atkinson Hyperlegible, OpenDyslexic) are
  freely licensed (SIL OFL) and vendored as committed build assets during
  implementation — no human action required.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| **Plain React state** (a `useReducer` store in `src/app/`), no state-management library | Single-screen MVP; the constitution favors minimal dependencies. Editor → config → `generate()` → preview is a simple unidirectional flow that needs no Redux/Zustand. | 2026-07-21 |
| App generates the **per-run seed** in the feature layer (e.g. from `Date.now()` / `Math.random`) and passes it to `generate()`; never surfaced or persisted | Reconciles the Phase 2 "deterministic given a seed" contract with `docs/vision.md`'s "seed / reproducibility is Out": the engine is seedable, the app supplies a fresh seed each run and hides it. `Math.random` is allowed outside `src/core/`. | 2026-07-21 |
| **Word parsing** = split on newlines, trim, drop empties, de-duplicate before building the config | Matches the paste-one-per-line prior art; normalization (case, umlaut/ß) stays the engine's responsibility, so the UI only cleans obvious noise. | 2026-07-21 |
| Direction control = a **labelled toggle group** over the 8 directions + a reverse toggle; presets set them as data | `docs/design.md` Components ("Direction toggles are a labelled toggle group, not raw checkboxes"); presets are Phase 2 data. | 2026-07-21 |
| Un-placeable words shown as a **`destructive`-styled** message near the word input | `docs/design.md` Word-list textarea component; `docs/vision.md` "never a silent omission". | 2026-07-21 |
| Accessible fonts **Atkinson Hyperlegible + OpenDyslexic** vendored as OFL build assets; default is Inter (design token `font-sans`) | `docs/design.md` `font-accessible` token; Phase 1 deferred font bundling to "when the preview/editor needs them (Phase 3)". | 2026-07-21 |
| **Adjustable font size is a puzzle-display property** (uses the design type scale), applied to the preview and carried as **feature/app view-model state** (alongside the header + font choice) for the Phase 4 print — never a field on the core `PuzzleConfig`, and not a preview-only view setting | Keeps a single source of truth for letter size across screen and print so the Phase 4 PDF honors the same choice, while preserving the `src/core` boundary (the core type stays `{width,height,directions,reverse,words}`). | 2026-07-21 |
| **Preset-select semantics:** selecting a difficulty preset seeds the size + direction set + reverse controls (via the Phase 2 mapping); the user may then override directions / reverse / size manually, and manual edits win. For the manual path the feature layer builds the `PuzzleConfig` directly — the engine's `configFromDifficulty` helper only emits the preset's own directions plus a square size override, so it does not cover manual direction/reverse edits | The mockup depicts exactly this (Medium preset with reverse manually toggled on); the implementer needs the explicit rule that a preset seeds initial values and manual edits override, and that the manual path bypasses `configFromDifficulty`. | 2026-07-21 |
| **On-screen solution preview: included in Phase 3** — a "Lösung" toggle highlights the placed words on the grid with the `accent` color (a static answer-key view, not interactive solving) | Resolved at the spec-acceptance gate (2026-07-21). `docs/design.md` sanctions the solution-highlight view in the Preview grid; a static highlight is not the interactive solving `docs/vision.md` bars, and the engine already returns placement coordinates. | 2026-07-21 |
| **Generate trigger: an explicit primary "Generieren" button** — runs generation and re-rolls with a fresh app-generated seed each click; no live auto-regeneration | Resolved at the spec-acceptance gate (2026-07-21). Matches `docs/design.md`'s single primary action; avoids chaotic re-rolls on every keystroke and keeps the seed re-roll user-controlled. | 2026-07-21 |

Both formerly-open decisions were resolved at the spec-acceptance gate
(2026-07-21): the solution view is **included in Phase 3** as a static
answer-key highlight toggle, and generation runs on an **explicit primary
button** (no live auto-regeneration). See the two Prior decisions rows above and
the Decision log.

## Tracking

- Milestone: created at the spec-acceptance gate (Phase 3 — Editor & preview UI),
  with `Depends on milestone: #2`.
- Issues: created from this spec once merged (one per implementable step).

Each issue references this spec path in its body.

## Design

This phase has a UI surface. The design is produced within this planning cycle
per `docs/design.md` (tokens are the source of truth; Claude Artifacts is the
editing tool; the durable form is a committed file) and reviewed **at the
spec-acceptance gate** as part of the spec package — not a separate stop.

- Durable design artifact: `docs/design/assets/editor-preview-mockup.png` (a
  committed mockup screenshot of the single-screen editor + preview), built from
  the `docs/design.md` component system (Button, Word-list textarea,
  Select/control, Preview grid, Card/panel) and token palette.
- The implementer consumes `src/styles/tokens.css` (already wired) plus this
  referenced mockup; it never reaches into the design tool.
- Contrast note (WCAG 2.1 AA): the amber `accent` primary action uses the **dark**
  `foreground` for its label (AA-compliant; white-on-amber is **not** AA and must
  not be used); `secondary`-colored text stays at normal size (borderline AA when
  small). The committed mockup follows both.

## Verification

Per `docs/workflow.md` (Verify = `npm run verify`; Test = Vitest + RTL; the QA
gate default is a `UI check`). Items no machine check covers are verified at the
human milestone-QA gate.

- [ ] `npm run verify` passes: strict type-check + ESLint (incl. the
      `src/features` → `src/core` boundary and German-literal guards) + Vitest.
- [ ] Component test: entering words and triggering generation renders a grid in
      the preview with the placed letters; the word-list-to-find is shown.
- [ ] Component test: selecting a difficulty preset updates the size + direction
      controls to the mapped values; a manual size outside 5–30 is prevented or
      clamped.
- [ ] Component test: a word list with an un-placeable word shows the
      destructive-styled warning listing exactly that word; nothing is silently
      dropped.
- [ ] Component test: toggling the accessible font changes the preview grid font;
      changing font size changes the rendered letter size.
- [ ] Component test: all rendered UI text comes from `src/strings/` (no German
      literals in components — lint guard + assertion).
- [ ] Component test: the "Lösung" toggle switches the preview to the solution
      view, highlighting the placed words (`accent`); toggling back hides them.
      No interactive solving is present.
- [ ] **[QA gate — UI check]** The editor + preview screen renders per the
      committed mockup; controls work end-to-end (words → config → generate →
      preview); the preview is legible; the dyslexia-friendly font applies; and
      every interactive element meets WCAG 2.1 AA contrast.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Live auto-regeneration (if chosen) re-rolls the grid on every keystroke, feeling chaotic | If the gate picks live regen, debounce and regenerate only on committed changes; the explicit-button option avoids it entirely. |
| Large grids (30×30) render slowly or break layout in the preview | Fixed-pitch CSS grid with a max on-screen cell size; the preview scrolls/scales rather than reflowing; measured at the QA gate. |
| Dyslexia font assets bloat the bundle or fail to load offline | Vendor only the needed weights, subset if large; fonts are local build assets (no runtime fetch), so offline is unaffected. |
| WCAG AA contrast missed on a control state (disabled/hover) | Design review at the acceptance gate checks token contrast; the QA-gate UI check re-verifies on the running app. |
| Font-size-as-puzzle-property leaks Phase 4 concerns into Phase 3 | Phase 3 only stores + previews the size; the PDF consumption is Phase 4 — the property is defined now, honored later. |

## Decision log

- 2026-07-21: Phase split from `docs/roadmap.md`; Phase 3 owns the editor +
  preview UI and app state wiring only — no PDF/export (Phase 4), no interactive
  solving (vision non-goal).
- 2026-07-21 (spec-acceptance gate): on-screen solution preview **included in
  Phase 3** as a static "Lösung" highlight toggle (design-doc sanctioned; not the
  interactive solving vision bars).
- 2026-07-21 (spec-acceptance gate): generation runs on an **explicit primary
  "Generieren" button** with a fresh seed per click — no live auto-regeneration.
- 2026-07-21 (spec review): per-puzzle header, font choice/size, and difficulty
  are feature/app view-model state — never fields on the core `PuzzleConfig`
  (`{width,height,directions,reverse,words}`); the manual direction/reverse path
  builds the config directly, bypassing `configFromDifficulty`.
- 2026-07-21 (issue #31, accessible fonts): Atkinson Hyperlegible + OpenDyslexic
  (both SIL OFL 1.1) are **vendored as committed build assets** in
  `src/assets/fonts/` (latin subset, weights 400/700, woff2), each with its
  `*-OFL.txt` notice. Files were obtained from the `@fontsource/*` npm packages
  and copied in — no runtime font dependency remains. `@font-face` declarations
  live in `src/styles/fonts.css` (imported by `main.css`) with relative `url()`,
  so Vite bundles them under the app base path — **no runtime network fetch**
  (constitution: offline-capable). The `--font-accessible` token thus resolves to
  the vendored families; default stays Inter (`--font-sans`). A component applies
  the chosen font via the token-derived `fontFamilyClass` helper (`src/app/`);
  the `PreviewPanel` consumes it (design: the preview honors the selected font).
- 2026-07-21 (issue #30, foundation shell): the app store is a `useReducer` in
  `src/app/state.ts` (`AppState` = words + `ConfigInputs` view-model + header +
  `FontSettings` + `GenerationResult | null`) exposed via a `useAppStore` hook;
  the full `AppAction` set (incl. preset-seeding `selectDifficulty` and
  `clampGridSize`-bound `setSize`) lands and is unit-tested now, but the shell
  only reads `state` — the editor/generate/solution issues (#31–#35) import
  `dispatch`. The two-card layout renders as `src/app` shell + `Card`/`AppHeader`
  hosting placeholder `EditorPanel`/`PreviewPanel` feature seams; card content is
  deferred to the later Phase 3 issues.
