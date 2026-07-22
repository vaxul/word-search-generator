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
- 2026-07-21 (issue #38 — A4 layout math): added pure `src/core/pdf/layout.ts`
  (no jsPDF, no DOM) with the geometry the renderers (#39/#40) consume. Constants
  `A4_WIDTH_MM`/`A4_HEIGHT_MM` (210×297), `PAGE_MARGIN_MM` (15) → `CONTENT_BOX`
  ≈180×267 mm. `puzzlesPerPage(size)` = the gate mapping (≤10→4, 11–17→2, ≥18→1);
  block grid shape 4-up=2×2, 2-up=1×2 (stacked), 1-up=1×1 per the layout diagram,
  with an 8 mm gutter. Each block reserves a 12 mm header strip (top) + 14 mm
  word-list strip (bottom); `blockLayout` fits the largest **square** grid into
  the remaining area and centres it, so `cellPitch = side/size` fills exactly and
  never overflows the block/content box. Legibility floor
  `MIN_LEGIBLE_CELL_PITCH_MM = 5` is guaranteed by the tier assignment (worst
  case ≈6 mm at size 17/2-up and size 30/1-up) and asserted across sizes 5–30.
  `paginate(size, copies)` → `{ puzzlesPerPage, pageCount, pages[] }`, the partial
  last page carrying its blocks in the leading slots (no clipping). Deterministic
  in `(size, copies)`; unit-tested for every tier boundary + a partial page.
- 2026-07-21 (issue #39 — puzzle PDF renderer): added `src/core/pdf/renderPuzzle.ts`
  (jsPDF, no DOM, no download). `renderPuzzleDoc(result, view)` builds a
  `jsPDF({unit:'mm',format:'a4'})`, embeds the selected font via `registerFont`
  (#37), paginates `view.copies` (default 1) copies of the square grid via
  `paginate` (#38), and draws each packed block. A reusable
  `renderPuzzleBlock(doc, {layout, grid, header, words, fontName, fontSizePt,
  highlight?})` helper draws the per-block header (title + `theme · date`), the
  cell lattice + centred letters, and the wrapped word-list-to-find — the seam the
  solution renderer (#40) reuses by passing its `highlight` set of `PlacedWord`s
  (a rounded amber stroke through each word's cells, drawn beneath the letters).
  The `view` carries `{ header{title,theme,date}, fontFamily, fontSize, copies? }`
  (mirrors the editor view-model); the words-to-find are the placed words
  (`result.placed`), never the unplaceable ones. Grid glyphs auto-fit the cell
  pitch (`GLYPH_FILL` × pitch) for print legibility while header/word-list text
  honors the selected size (clamped to its strip). Vitest asserts a usable doc
  across tiers (10→4-up, 15→2-up, 18→1-up), page count matches `paginate`, ä/ö/ü/ß
  words render without throwing under the embedded font, and `output('arraybuffer')`
  yields non-empty bytes starting with `%PDF`. Renderer barrel + `src/core` barrel
  re-export it. Download stays for #41.
- 2026-07-21 (issue #40 — solution PDF renderer): added
  `src/core/pdf/renderSolution.ts` (jsPDF, no DOM, no download).
  `renderSolutionDoc(result, view)` mirrors `renderPuzzleDoc` — a fresh
  `jsPDF({unit:'mm',format:'a4'})`, `registerFont` (#37), the same `paginate`
  packing/per-block layout (#38) — but passes `result.placed` as the
  `renderPuzzleBlock` `highlight` set (#39) so every placed word is MARKED with
  the accent stroke, and tags each block title with a solution suffix. The
  German "Lösung" label is NOT baked into core (constitution: German UI text
  lives only in `src/strings/`, never in `src/core`) — the caller passes it as
  plain data via the required `SolutionView.solutionSuffix`, exactly as the
  header title/theme/date already flow into the renderer; bare (trimmed) label
  when no title. The returned document is a
  DISTINCT object from `renderPuzzleDoc`'s (Prior decision: solution is its own
  `-loesung` file), so #41 can download two separate PDFs. The highlighted cells
  are computed inside `renderPuzzleBlock`/`drawHighlight` from each `PlacedWord`
  (start + `DIRECTION_VECTORS[direction]`), so no cell math is duplicated and
  nothing is imported from `src/features` (boundary held). Answer list = the
  placed words; unplaceable words never drawn. Vitest asserts: distinct doc vs.
  the puzzle, `%PDF` magic bytes, page count matches `paginate` AND the puzzle
  page-for-page across every tier/copy count, the highlight path (incl. ä/ö/ü/ß)
  renders without throwing, empty-placed and suffix-override/empty-title paths.
  Renderer barrel + `src/core` barrel re-export it. Download stays for #41.
- 2026-07-21 (issue #41 — export action + two-file download): added
  `src/features/export/` — the FEATURE-layer download that closes Phase 4.
  `download.ts` holds the one place the app touches DOM/browser APIs to save a
  file: `downloadBlob(blob, name)` opens a `URL.createObjectURL` object URL,
  clicks a transient `<a download>`, then revokes the URL in a `finally` (no
  leak); `downloadPdf(doc, name)` feeds it `doc.output('blob')` — in-memory, no
  network. `exportPuzzle.ts` orchestrates: `exportPuzzlePdfs(result, puzzleView,
  solutionView, parts)` renders the puzzle via `renderPuzzleDoc` (#39) and the
  SEPARATE solution via `renderSolutionDoc` (#40) and downloads TWO distinct
  files sharing a sanitized title stem — `<stem>-raetsel.pdf` +
  `<stem>-loesung.pdf` (Prior decision: two files, never merged).
  `sanitizeFilenameStem(title, fallback)` folds diacritics (NFKD + strip
  combining marks) and maps ß→ss via ASCII-escaped regexes (`̀..`, `ß`)
  so no non-ASCII literal lives outside `src/strings/`, lowercases, collapses
  non-`[a-z0-9]` runs to single hyphens, and falls back when empty.
  `ExportAction.tsx` is the amber-accent primary DOWNLOAD button (design.md's
  generate/download primary language; dark `foreground` label = WCAG AA, visible
  `primary` focus ring, `muted` disabled state), wired into the editor next to
  "Puzzle generieren"; it builds the puzzle + solution view-models from the store
  (header, font family + size) and is DISABLED (and handler-guarded) while
  `result === null`. The German action label, solution suffix (` — Lösung`), and
  the download filename parts (fallback `wortsuche`, `-raetsel`/`-loesung`,
  `.pdf`) live in `src/strings/de.ts` (`strings.export`). Boundary held:
  `src/features/export` imports `src/core` only (never the reverse); the DOM lives
  here, not in core. Vitest: the button is disabled with no result and enabled
  with one, a click downloads exactly two files with the `-raetsel`/`-loesung`
  names (real path; only `URL.createObjectURL`/`revokeObjectURL` + anchor click
  stubbed), the empty-title fallback stem, and the pure `sanitizeFilenameStem`
  rules (diacritic fold, ß→ss, hyphen collapse, fallback). This completes
  milestone #4.
- 2026-07-22 (issue #54 — Phase 4 QA-gate fix, header/word-list ↔ grid spacing):
  the printed block placed the grid flush against the header and word-list strips
  in the 2-up tier (the block is narrow-and-tall, so the square filled the whole
  inner height with no centring slack; 1-up/4-up were width-limited and already
  had slack). Added `HEADER_GAP_MM = 4` + `WORDLIST_GAP_MM = 4` to `layout.ts` and
  compute the grid square from the gap-reduced region (`regionHeight = box.height −
  BLOCK_HEADER_MM − BLOCK_WORDLIST_MM − HEADER_GAP_MM − WORDLIST_GAP_MM`), then
  centre it there. This guarantees ≥4 mm of breathing room below the header and
  above the word list in every tier. Fix lives entirely in the layout math, so it
  flows to BOTH puzzle (`renderPuzzle.ts`) and solution (`renderSolution.ts`)
  renderers unchanged (they draw into `layout.grid`). No overflow and pitch ≥
  `MIN_LEGIBLE_CELL_PITCH_MM` still hold — worst cases size 17 @ 2-up (pitch ≈
  5.6 mm) and size 30 @ 1-up (6.0 mm, width-limited, unaffected). `layout.test.ts`
  gains gap-assertion tests (grid inset ≥ each gap) and a no-overflow/min-pitch
  sweep across sizes 5–30 with the gaps applied. No DOM, no `any`, named exports,
  `npm run verify` + `npm run build` green.
