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

- [ ] `src/features/editor/` collects a word list plus configuration (grid size,
      allowed directions, reverse, difficulty preset, per-puzzle header, font
      choice + size) into a `PuzzleConfig` and invokes the Phase 2 `generate()`.
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
- **Generate action** — the single primary action that runs `generate()` with an
  app-generated seed and shows the result (see Prior decisions / OPEN).
- **Preview** — the generated grid, the word-list-to-find, and the un-placeable
  warning. (An on-screen solution view is an OPEN decision — see below.)
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
  a print tool, not a game). Rendering a static solution *highlight* is the OPEN
  decision below; interactive solving is never built.
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
| **Adjustable font size is a puzzle-display property** (uses the design type scale), applied to the preview and carried on the puzzle for the Phase 4 print — not a preview-only view setting | Keeps a single source of truth for letter size across screen and print, so the Phase 4 PDF honors the same choice. | 2026-07-21 |
| OPEN — **On-screen solution preview**: does Phase 3 include a toggle that highlights the placed words on the grid (accent), or is all solution rendering deferred to the Phase 4 PDF? | resolved at the spec-acceptance gate | — |
| OPEN — **Generate trigger**: an explicit primary "Generate" button (re-rolls with a fresh seed), or live auto-regeneration on every config change (debounced)? | resolved at the spec-acceptance gate | — |

`docs/design.md` names generate a "primary action" (button) while `docs/vision.md`
says "live preview" — the trigger decision is genuinely open and settled at the
gate. The solution-preview decision sits between `docs/design.md` (Preview grid
"solution view highlights placed words with accent") and `docs/vision.md` (no
on-screen solving) — also settled at the gate.

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
