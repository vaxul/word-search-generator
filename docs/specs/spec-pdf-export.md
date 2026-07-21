# Spec: Phase 4 — A4 PDF export

> Created: 2026-07-21

The print-ready output phase: `src/core/pdf/` computes DIN A4 layout math and
renders the generated puzzle (grid + header + word-list-to-find) to a jsPDF
document, plus a genuinely separate solution, with correct German umlaut/ß
glyphs — and `src/features/export/` triggers generation and the browser
download. This delivers the product's core promise: from a word list to a
print-ready A4 sheet with a separate solution.

## Outcome

What is true when this work is done:

- [ ] `src/core/pdf/` computes A4 layout (a fixed content box in millimetres
      inside the page margins) and renders the puzzle via **jsPDF** — grid, the
      per-puzzle header (title / theme / date), and the word-list-to-find — with
      no clipping at the page edges. No DOM APIs in `src/core/pdf/`.
- [ ] A **genuinely separate solution** is produced as its **own PDF file**
      (`<name>-loesung.pdf`, distinct from `<name>-raetsel.pdf`): the grid with the
      placed words marked plus the word list, printable separately (`docs/vision.md`).
- [ ] German umlauts (ä/ö/ü) and ß render correctly in the PDF via an embedded
      Unicode font — never mojibake or a substituted glyph.
- [ ] `src/features/export/` triggers PDF generation from the current
      `GenerationResult` + view-model (header, font choice + size) and downloads
      the file(s) in the browser; the export action lives with the editor.
- [ ] Multiple puzzles per A4 page keyed to grid size (≤10 → 4-up, 11–17 → 2-up,
      ≥18 → 1-up), each block with its own header + word list, cleanly laid out
      with no clipping.
- [ ] `src/core/pdf/` is deterministic layout math with unit tests; the app makes
      no runtime network calls; `npm run verify` passes.

## Scope

### In scope

- **`src/core/pdf/`** — A4 layout math (content box in mm inside fixed margins;
  cell pitch derived from grid size; origin offsets for packing) and jsPDF
  rendering of a puzzle block: the letter grid, the header, and the
  word-list-to-find.
- **Separate solution rendering** — the same grid with placed words marked
  (highlight / ring / bold per the design) plus the answer list, as its **own PDF
  file** distinct from the puzzle.
- **Multiple-per-page packing** keyed to grid size: **≤10 → 4-up, 11–17 → 2-up,
  ≥18 → 1-up**, each block carrying its own header + word list.
- **Embedded Unicode font** so ä/ö/ü/ß render — the selected puzzle font embedded
  as a TTF into the document. Every selectable font must have a **vendored OFL TTF
  build asset to embed**, including the default: Phase 3 vendored only Atkinson
  Hyperlegible + OpenDyslexic, so this phase also vendors the default font's TTF
  (Inter, SIL OFL) rather than relying on the CSS `system-ui` fallback that has no
  embeddable file.
- **`src/features/export/`** — the download trigger (jsPDF `Blob` → object-URL
  anchor), wired to the editor's export action and the current puzzle state.
- German UI strings for the export controls in `src/strings/`.

### Out of scope

- **Grid generation / preview** — Phases 2 & 3 (consumed here, not rebuilt).
- **Batch / book mode** (many *distinct* puzzles at once) — `docs/vision.md`
  "Out". Multiple-per-page means copies of the single generated puzzle keyed to
  size, never a batch of different puzzles.
- **Grid shapes / masks, save/load, templates, user-facing seed** — vision "Out".
- **Print-CSS `@page` route** — kept only as a documented fallback reference, not
  built; jsPDF is the primary engine (constitution).

## Constraints

Per `docs/constitution.md`, `docs/architecture.md`, `docs/prior-art.md`
(referenced, not restated):

- **jsPDF** is the mandated PDF engine (constitution stack table), native `a4`
  format, manual coordinate control.
- `src/core/pdf/` uses jsPDF but **no DOM APIs**; `src/features/export/` owns the
  browser download. `src/features/*` may import `src/core/*`, never the reverse.
- No runtime network calls — the font is a bundled build asset embedded at
  generation time, not fetched.
- No `any` in `src/core/`; explicit public types; named exports; max function 50
  lines / file 300 lines.
- Depends on Phase 3 (milestone #3): consumes the `GenerationResult` and the
  editor's view-model — per-puzzle header (title/theme/date) and font choice +
  size.

## Prior art

From `docs/prior-art.md`, indexed by concern for this phase:

- [A4 PDF export & print layout (Phase 4) → parallax/jsPDF](../prior-art.md#a4-pdf-export--print-layout-phase-4)
  — the primary engine: fixed A4 content box (~180×267 mm inside 15 mm margins),
  pack 1/2/4 blocks per page via origin offsets keyed to grid size, `addPage()`
  for solution pages.
- [A4 PDF export & print layout (Phase 4) → Hopding/pdf-lib](../prior-art.md#a4-pdf-export--print-layout-phase-4)
  — **reference-only fallback** for reliable Unicode TTF embedding and merge/split
  if jsPDF font embedding proves insufficient; decide by measured need, do not
  adopt pre-emptively.
- [A4 PDF export & print layout (Phase 4) → Print-CSS `@page`](../prior-art.md#a4-pdf-export--print-layout-phase-4)
  — documented zero-dependency fallback only; not built this phase.

## Human prerequisites

- **none.** Pure client-side rendering. The embedded fonts are freely-licensed
  (SIL OFL) build assets — the Phase 3 accessible fonts reused here, plus the
  default font's TTF (Inter) vendored this phase. All are implementer-vendorable;
  no secret, provisioning, or account.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| **jsPDF**, native `a4`, manual coordinates | `docs/constitution.md` stack table mandates jsPDF; prior-art verdict "reuse — precise coordinate control for letter grids". | 2026-07-21 |
| Fixed **A4 content box ≈180×267 mm inside 15 mm margins**; cell pitch derived from grid size to fit the box | Prior-art jsPDF entry; guarantees no clipping and legible cells across the 5–30 size range. | 2026-07-21 |
| `src/core/pdf/` is **pure layout + jsPDF render math, no DOM**; `src/features/export/` performs the **download** (Blob → object URL → anchor click) | `docs/architecture.md` boundary: core is UI-free (jsPDF only), the feature layer touches the browser. Keeps layout math unit-testable without a DOM. | 2026-07-21 |
| **Embed the selected puzzle font as a Unicode TTF** into the document (jsPDF `addFont`) so ä/ö/ü/ß render; **every selectable font — including the default — ships a vendored OFL TTF** to embed | jsPDF's built-in fonts are WinAnsi-limited and mangle some glyphs; embedding a vendored TTF renders German correctly and matches the on-screen font. Phase 3 vendored only the accessible fonts, so the default (Inter, OFL) is vendored here too — the CSS `system-ui` fallback has no embeddable file. pdf-lib stays a documented fallback only if embedding proves insufficient. | 2026-07-21 |
| Layout math is **deterministic and unit-tested** (coordinates/packing given size + content box); rendering is thin over it | Constitution: core logic ships with unit tests; geometry is testable without producing a real PDF, keeping the QA gate to a visual check of the actual output. | 2026-07-21 |
| **Separate solution = two separate PDF files** (`<name>-raetsel.pdf` + `<name>-loesung.pdf`), each downloaded independently | Resolved at the spec-acceptance gate (2026-07-21). Cleanest "genuinely separate" per `docs/vision.md` — each sheet prints independently with no page-range selection. | 2026-07-21 |
| **Multiple-per-page mapping = ≤10 → 4-up, 11–17 → 2-up, ≥18 → 1-up**; each packed block carries its own header + word-list-to-find (separable handout) | Resolved at the spec-acceptance gate (2026-07-21). Three tiers per the layout diagram: best paper economy for small puzzles while keeping large grids legible; per-block header/word-list so each copy is independently usable. Multiple-per-page itself is mandated (vision success criterion; terminal phase). | 2026-07-21 |

Both decisions were resolved at the spec-acceptance gate (2026-07-21): the
separate solution ships as **two PDF files** (`-raetsel` / `-loesung`), and
packing is **≤10 → 4-up, 11–17 → 2-up, ≥18 → 1-up** with each block carrying its
own header + word-list-to-find. Both underlying features are mandated by
`docs/vision.md` (Phase 4 is terminal); only these models were open, and they are
now settled — see the Prior decisions rows above and the Decision log.

## Tracking

- Milestone: created at the spec-acceptance gate (Phase 4 — A4 PDF export), with
  `Depends on milestone: #3`.
- Issues: created from this spec once merged (one per implementable step).

Each issue references this spec path in its body.

## Design

This phase's surface is the printed A4 page. A layout diagram materially clarifies
the packing + separate-solution decisions, so it is produced within this cycle
per `docs/design.md` and reviewed at the spec-acceptance gate.

- Durable design artifact: `docs/design/assets/pdf-a4-layout.png` — a committed
  diagram of the A4 page (portrait), the 15 mm margins + content box, the
  1-up / 2-up / 4-up packing options keyed to grid size, and the separate
  solution sheet with marked words.
- The implementer consumes the tokens (`src/styles/tokens.css`) plus this
  referenced diagram; the print output must meet WCAG-adjacent legibility (high
  contrast letters, adequate cell pitch) and honor the selected font.

## Verification

Per `docs/workflow.md` (Verify = `npm run verify`; Test = Vitest; the QA-gate
default is a `UI check` — here a visual check of the generated A4 PDF). Items no
machine check covers are verified at the human milestone-QA gate.

- [ ] `npm run verify` passes: strict type-check + ESLint (incl. `src/core` purity
      / no-`any` and the `src/features` → `src/core` boundary) + Vitest.
- [ ] Unit test: layout math is deterministic — given a grid size + content box it
      yields the expected cell pitch, origins, and per-page packing (no overflow of
      the content box).
- [ ] Unit test: the packing mapping matches the gate-resolved size→count rule;
      the last partial page is handled without clipping.
- [ ] **[QA gate — UI check]** A generated puzzle PDF opens and shows the grid +
      header (title/theme/date) + word-list-to-find on A4 with clean margins and
      no clipping; letters are legible at the chosen size and font.
- [ ] **[QA gate — UI check]** ä/ö/ü/ß render correctly in the PDF (embedded
      font), single-cell — no mojibake, no "SS" for ß.
- [ ] **[QA gate — UI check]** The solution is genuinely separate per the resolved
      decision (separate file or clearly separate pages) and marks the placed
      words correctly against the puzzle grid.

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| jsPDF Unicode embedding bloats the PDF or fails for the accessible font | Embed a subset if size is a problem; the pdf-lib fallback (prior art) is available if jsPDF embedding proves insufficient — decided by measured need. |
| Cell pitch too small on large grids (30×30) → illegible print | Content box + minimum legible pitch drive a max grid-per-page; the QA-gate UI check verifies legibility on the real PDF. |
| Multi-up packing clips or misaligns on the last partial page | Layout math unit-tested for partial pages; QA-gate visual check on a multi-up output. |
| "Separate solution" misread (appended key vs separate sheet) — the exact gap prior art flags | Resolved explicitly at the gate (file vs pages); the QA check confirms it prints separately. |
| Core/pdf accidentally reaches for a DOM API (e.g. `document`) | ESLint boundary + the download living in `src/features/export/` keep `src/core/pdf/` DOM-free; unit tests run without a DOM. |

## Decision log

- 2026-07-21: Phase split from `docs/roadmap.md`; Phase 4 owns `src/core/pdf/` +
  `src/features/export/` — the A4 render + download, consuming Phases 2 & 3.
- 2026-07-21 (spec-acceptance gate): separate solution ships as **two PDF files**
  (`-raetsel` / `-loesung`); packing mapping resolved to **≤10 → 4-up,
  11–17 → 2-up, ≥18 → 1-up** with each block carrying its own header + word list.
- 2026-07-21 (spec review): multiple-per-page is a **mandated** vision success
  criterion, not deferrable (Phase 4 is terminal); OPEN #2 narrowed to the
  size→count mapping + per-block layout only. Default font (Inter) TTF is vendored
  this phase for embedding (Phase 3 vendored only the accessible fonts). Consumed
  view-model listed as header + font choice + size.
- 2026-07-21 (issue #37 — PDF font assets + embedding utility): added `jspdf`
  (pinned `4.2.1`) as a runtime dependency. Vendored three OFL TrueType (glyf)
  fonts as **base64 TS modules** under `src/core/pdf/fonts/` — Inter (default),
  Atkinson Hyperlegible, OpenDyslexic — each with its SIL OFL 1.1 notice. Base64
  (not raw `.ttf` + Vite `?url`) keeps `src/core/pdf` DOM-free and unit-testable
  in Node. Inter + Atkinson decompressed from the Phase 3 `@fontsource` woff2
  subsets (screen/PDF glyph parity); OpenDyslexic taken from the upstream
  `antijingoist/open-dyslexic` `ttf/` build because the `@fontsource` woff2
  decompresses to CFF/OTTO which jsPDF cannot embed. `registerFont(doc, family)`
  (+ lower-level `registerFontAsset`) runs `addFileToVFS`/`addFont`/`setFont`;
  `'sans'` → Inter, `'accessible'` → Atkinson Hyperlegible (first in the
  `--font-accessible` stack), OpenDyslexic available via `PDF_FONTS`. A Vitest
  spec embeds each font and asserts ä/ö/ü/ß render (positive `ß` glyph width, no
  throw). Layout math + renderers remain for #38–#41.
