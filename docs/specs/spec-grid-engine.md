# Spec: Phase 2 — Grid generation engine

> Created: 2026-07-20

Deliver the pure-TypeScript grid engine in `src/core/` — domain types plus
deterministic word placement (8 directions, optional reverse, difficulty
presets), overlap handling, alphabet-biased random fill, correct German
umlaut/ß handling, and exhaustive un-placeable-word reporting — with no React or
DOM dependency and full unit-test coverage.

## Outcome

What is true when this work is done:

- [ ] `src/core/model/` exports the domain types `PuzzleConfig`, `Grid`,
      `PlacedWord`, `Difficulty`, `Direction`, `GenerationResult` (per
      `docs/architecture.md`).
- [ ] `src/core/grid/` generates a filled letter grid that places every word it
      can, along the configured directions, with correct overlap at matching
      letters.
- [ ] Generation is **deterministic given a seed** — the same
      `(PuzzleConfig, seed)` yields the identical grid — enabling reproducible
      unit tests (this is an engine-internal contract, not a user feature; see
      Prior decisions on the vision/constitution reconciliation).
- [ ] The eight directions (E, W, N, S, NE, NW, SE, SW) are individually
      controllable, and an **optional reverse** toggle allows backward placement
      along the allowed directions.
- [ ] Difficulty presets (Easy / Medium / Hard) fold into a `PuzzleConfig` as a
      grid size + allowed direction set + reverse flag, per the resolved mapping
      (Easy 12×12 H+V; Medium 15×15 +diagonals; Hard 18×18 all-8 +reverse — see
      Prior decisions).
- [ ] Words that cannot be placed are returned in `GenerationResult` as an
      explicit un-placeable list — **never silently omitted** (`docs/vision.md`
      success criterion).
- [ ] German umlauts (ä/ö/ü) and ß are handled correctly: words are normalized
      to a consistent case and preserved (not transliterated — no naive
      `toUpperCase` that turns ß into SS), and random fill draws from an alphabet
      = the full German alphabet (A–Z) plus any ä/ö/ü/ß present, so hidden
      umlaut-words do not stand out.
- [ ] `src/core/*` imports no React/DOM (ESLint-enforced), contains no `any`,
      and ships with Vitest unit tests; `npm run verify` passes.

## Scope

### In scope

- Domain types in `src/core/model/`.
- Deterministic placement engine in `src/core/grid/`: grid-as-1D-array,
  `(dRow, dCol)` direction vectors, retry-based placement with a bounded retry
  budget, overlap at matching letters, seeded PRNG.
- Direction-set control (8 directions) + reverse toggle.
- Difficulty preset → `PuzzleConfig` mapping (Easy / Medium / Hard).
- Random fill honoring the German character set (full German alphabet A–Z plus
  any ä/ö/ü/ß present in the words).
- Word normalization (case + umlaut/ß preservation) and validation
  (word longer than the grid → reported un-placeable, not a crash).
- `GenerationResult` carrying the grid, the placed words (with coordinates +
  direction), and the un-placeable words.
- Full unit-test coverage for placement, overlap, directions, reverse,
  determinism, un-placeable reporting, and German characters.

### Out of scope

- Any React/DOM, rendering, or preview (Phase 3).
- Any PDF/print layout (Phase 4).
- A **user-facing** seed / reproducibility feature (a UI to regenerate the same
  puzzle) — explicitly out per `docs/vision.md`. The engine accepts a seed for
  determinism/testing, but nothing exposes or persists it to the user.
- A solver / highlight-on-screen (the app is a print tool, not a game — vision
  non-goal). The engine records placement coordinates; on-screen solving is not
  built.
- Grid shapes / masks, batch/book mode, word-list templates (vision "Out").

## Constraints

Per `docs/constitution.md` and `docs/architecture.md` (referenced, not restated):

- Pure domain logic in `src/core/` — **no** React/DOM imports (ESLint
  `no-restricted-imports`); no runtime network calls.
- No `any` in `src/core/`; explicit types on public functions.
- Max function 50 lines; max file 300 lines; named exports only.
- The grid engine is deterministic given a seed and has no UI dependency
  (constitution architecture principle).
- New domain logic ships with unit tests; `npm run verify` is the gate.
- Boundaries: `src/features/*` and `src/app/*` may import `src/core/*`, never the
  reverse (`docs/architecture.md`).
- Depends on Phase 1 (milestone #1): the scaffold, `src/core/` directory, strict
  TS, ESLint guards, and the `verify` gate must exist first.

## Prior art

From `docs/prior-art.md`, indexed by concern for this phase:

- [Grid generation engine (Phase 2) → blex41/word-search](../prior-art.md#blex41word-search)
  — **vendor, do not depend.** Adopt the options model (per-direction
  enable/disable across the 8 directions, backward-placement, custom dictionary,
  forbidden-word retry) and overlap-at-matching-letter placement. Reimplement in
  `src/core/`, not as an npm dependency (unmaintained; constitution "Don'ts").
- [Grid generation engine (Phase 2) → Jamis Buck article](../prior-art.md#placement-algorithm-reference-jamis-buck)
  — grid-as-1D-array indexing, `(dRow, dCol)` direction vectors, random fill of
  remaining cells; start with **retries**, escalate to backtracking only if a
  grid ≥ ~1.5× longest word still fails (avoid premature backtracking).
- [Grid generation engine (Phase 2) → bunkat/wordfind](../prior-art.md#bunkatwordfind)
  — random-placement-with-retries algorithm (its `wordfindgame.js` jQuery layer
  is the wrong dependency; the solver logic is deferred, not built this phase).
- [Grid generation engine (Phase 2) → joshbduncan/word-search-generator](../prior-art.md#joshbduncanword-search-generator)
  — the difficulty-LEVEL abstraction (L1 = one direction … L3 = all 8), the
  direction-string API shape, and the answer-key coordinate format
  (`CAT NE @ (5,14)`) for `PlacedWord`.
- [German character set / diacritics (Phase 2) → blex41 diacritics](../prior-art.md#blex41word-search--diacritics-handling)
  — normalize/uppercase words consistently; bias random fill to the alphabet in
  use; never fill with characters outside the puzzle's alphabet (would make
  ä/ö/ü/ß words stand out).

## Human prerequisites

- **none.** Pure client-side domain logic — no secrets, external provisioning,
  accounts, or dashboard configuration. Phase 1's scaffold (milestone #1) is a
  code dependency, not a human prerequisite; it is tracked via the milestone
  `Depends on milestone: #1` edge and the first issue's `Depends on`.

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Engine takes an explicit **seed** and is deterministic; the seed is **not** user-exposed | Reconciles the two foundation docs: `docs/constitution.md` mandates "deterministic given a seed" (testability + reproducible unit tests), while `docs/vision.md` lists a user-facing "seed / reproducibility" feature as **Out of scope**. Both hold: the engine is seedable internally; the app generates a seed per run and never surfaces/persists it. | 2026-07-20 |
| Vendor the blex41 placement approach into `src/core/grid/`, not an npm dependency | `docs/constitution.md` "Don'ts": no runtime dependency on unmaintained packages; the placement engine is vendored. Prior-art verdict: reuse the approach, avoid the hard dependency (last release 2019). | 2026-07-20 |
| **Retry-based** placement with a bounded retry budget; report words that still don't fit | Jamis Buck prior art: full backtracking is usually unnecessary for grid ≥ ~1.5× longest word — start simple, escalate only if measured need arises. Bounded retries keep generation fast and deterministic under a fixed seed. | 2026-07-20 |
| Overlap allowed **only at matching letters**; conflicting cell → placement rejected, retried | Standard word-search behavior (blex41, wordfind); produces denser, valid grids. | 2026-07-20 |
| `Direction` = the 8 compass vectors; `reverse` is a **config flag** enabling backward placement along allowed directions | `docs/vision.md`: direction control H/V/D with "optional reverse". Modeling reverse as a flag (not 16 directions) keeps the direction set the user-facing 8 and matches the difficulty presets. | 2026-07-20 |
| Words normalized to **UPPERCASE via an explicit German-aware mapping**, umlauts/ß **preserved** (not transliterated to ae/oe/ue/ss) | `docs/vision.md`: "Correct handling of German umlauts / ß." Transliteration would change the word the child searches for. **Do not use bare `String.prototype.toUpperCase()`** — it maps `ß` → `SS` (two cells, breaking placement length). Map `ä/ö/ü → Ä/Ö/Ü` and keep `ß` as a single-cell glyph (leave lowercase `ß`, or use capital `ẞ` U+1E9E — a single cell either way). | 2026-07-20 |
| Grid size bounds **5×5 – 30×30** | Below 5×5 cannot hold most words; the upper bound keeps the retry budget bounded (retry cost scales with grid area) and the grid legible for the later A4 print phase. Consistent with the prior-art competitor range (5–30). | 2026-07-20 |
| A word longer than the grid dimension is **reported un-placeable**, never a crash or silent drop | `docs/vision.md` success criterion: places all words or clearly reports which do not fit — never a silent omission. | 2026-07-20 |
| **Fixed, documented seeded PRNG** (small pure function, e.g. mulberry32), no `Math.random()` in `src/core` | Determinism tests assert byte-identical grids, so the PRNG must be pinned once; test fixtures depend on it. A tiny pure PRNG keeps `src/core` dependency-free and offline. | 2026-07-20 |
| **Difficulty presets** — Easy: 12×12, directions H+V (E, S), reverse **off**; Medium: 15×15, H+V+diagonals (E, S, SE, NE), reverse **off**; Hard: 18×18, all 8 directions, reverse **on** | Resolved at the spec-acceptance gate (2026-07-20). Follows the prior-art L1→L3 progression (one axis → +diagonals → all 8 + reverse); human chose the larger grid sizes (bigger search area) with that progression. Presets are data, not logic — adjustable later without engine changes. | 2026-07-20 |
| **Random-fill alphabet** = the **full German alphabet (A–Z) plus any ä/ö/ü/ß present in the words** | Resolved at the spec-acceptance gate (2026-07-20). Hides words well and keeps difficulty honest even for short/low-diversity word lists; satisfies the prior-art diacritics requirement (any diacritic in a word also appears in the fill) and matches typical word-search practice. | 2026-07-20 |

## Tracking

- Milestone: created at the spec-acceptance gate (Phase 2 — Grid generation
  engine), with `Depends on milestone: #1`.
- Issues: created from this spec once merged (one per implementable step).

Each issue references this spec path in its body.

## Verification

Per `docs/workflow.md` (Verify = `npm run verify`; Test = Vitest; no live UI in
this phase, so the QA gate is code-level rather than a `UI check`).

- [ ] `npm run verify` passes: strict type-check + ESLint (incl. the `src/core`
      purity + no-`any` guards) + Vitest.
- [ ] Unit test: every word in a well-sized config is placed; `PlacedWord`
      coordinates + direction are correct and the letters read back off the grid.
- [ ] Unit test: **determinism** — same `(config, seed)` → byte-identical grid;
      different seed → (very likely) different grid.
- [ ] Unit test: each of the 8 directions can be individually enabled/disabled
      and placement honors it; reverse toggle places words backward.
- [ ] Unit test: overlap at a shared letter succeeds; a conflicting overlap is
      rejected and retried.
- [ ] Unit test: a word longer than the grid, and an over-full word list, are
      returned in the un-placeable list — never crash, never silently dropped.
- [ ] Unit test: German — ä/ö/ü/ß words are placed and readable (ß occupies a
      single cell, not "SS"); random fill contains no character outside the
      gate-resolved fill alphabet.
- [ ] Unit test: each difficulty preset yields the agreed grid size + direction
      set + reverse flag (per the gate-resolved mapping).

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| Dense word lists exceed the retry budget and over-report un-placeable words | Tune the retry budget; the Jamis Buck escalation-to-backtracking path is available if measured need arises (out of MVP unless required). |
| A weak/global PRNG breaks determinism or leaks nondeterminism | Use an explicit seeded PRNG passed into the engine; no `Math.random()` in `src/core`. Determinism is directly unit-tested. |
| Alphabet-biased fill still makes rare letters conspicuous | Fill from the union of in-use letters (incl. umlaut/ß); tests assert no out-of-alphabet fill. |
| Preset mapping chosen at the gate proves too easy/hard in practice | Presets are data, not logic — adjustable later without engine changes; Phase 3 preview surfaces the feel. |

## Decision log

- 2026-07-21 (#11, placement engine): authored `src/core/grid/placement.ts` —
  deterministic word placement into the grid-as-1D-array, producing the PLACED
  grid (`cells` = one glyph per occupied cell, `EMPTY_CELL` `''` elsewhere; the
  alphabet-biased random fill of empty cells is #12) plus `PlacedWord[]` and the
  normalized-form un-placeable list. Decisions: (a) **Reverse = opposite
  direction**, not a distinct direction: with `reverse` on, the allowed set is
  expanded by each direction's `oppositeDirection`, so a backward word is
  recorded as running in the opposite compass direction (`PlacedWord.direction`
  stays one of the 8) — matching the model's `reverse`-as-a-flag decision.
  (b) **Bounded retry budget = the full shuffled candidate set** of
  `(direction, start-cell)` options (`directions × width × height`): the PRNG
  Fisher–Yates-shuffles it once per word and takes the first in-bounds,
  overlap-compatible candidate. This is finite/bounded (no infinite retry, no
  `Math.random`), deterministic under a fixed seed, AND complete-per-word — it
  never falsely reports a word un-placeable when a compatible slot exists in the
  current grid, directly mitigating the spec's "over-reports un-placeable" risk.
  Placement stays greedy per word (no backtracking) per the retry-based Prior
  decision; the Jamis Buck backtracking escalation remains available if a
  measured need arises. (c) **Un-placeable reports the NORMALIZED word form**
  (matching `placed[i].word`) so the engine speaks one vocabulary; a word longer
  than every grid span collects no in-bounds candidate and is reported, never a
  crash; an empty word (normalizing to `''`) is reported un-placeable rather
  than "placed" into zero cells.
- 2026-07-20: Phase split from `docs/roadmap.md`; Phase 2 owns `core/model` +
  `core/grid` only — no rendering (Phase 3) or PDF (Phase 4).
- 2026-07-20 (spec-acceptance gate): difficulty presets resolved — Easy 12×12
  H+V no-reverse, Medium 15×15 +diagonals no-reverse, Hard 18×18 all-8 +reverse
  (larger grids per human preference, prior-art L1→L3 direction progression).
- 2026-07-20 (spec-acceptance gate): random-fill alphabet resolved — full German
  alphabet (A–Z) plus any ä/ö/ü/ß present in the words.
- 2026-07-21 (#10, core/grid primitives): authored `src/core/grid/` — a pinned
  seeded PRNG, the compass direction vectors, and German-aware normalization.
  Decisions: (a) PRNG = **mulberry32**, a tiny pure `(seed:number) => () =>
  number` factory returning floats in [0,1); `Math.random()` stays banned in
  src/core. A companion `seedFromString` (xfnv1a hash) gives a deterministic
  string→32-bit-seed reduction for callers that seed from a textual key. (b)
  Reverse placement is exposed two ways over the fixed 8-direction set — a
  vector-level `reverseVector` (negate the `(dRow,dCol)` step) and a
  direction-level `oppositeDirection` (E↔W, N↔S, NE↔SW, NW↔SE, involutive) — so
  the placement engine can walk a word backward without adding reverse
  directions, matching the model's `reverse`-as-a-flag decision. (c) **ß glyph:
  kept as lowercase `ß` (U+00DF)**, a single cell, rather than capital `ẞ`
  (U+1E9E): both are one code point, but `ß` renders in effectively every font
  (incl. the later dyslexia-friendly print font) whereas `ẞ` is often missing.
  `normalizeWord` upper-cases per code point (ä/ö/ü→Ä/Ö/Ü natively) and collapses
  either eszett form to a single `ß`, never the bare-`toUpperCase` `ß`→`SS`.
- 2026-07-21 (#9, core/model): domain types authored in `src/core/model/`.
  Modeling choices: `Grid` uses a row-major single-dimension `cells: readonly
  string[]` (cell at `(row,col)` = `cells[row*width+col]`) to mirror the engine's
  grid-as-1D-array Prior decision so the engine returns its working array with no
  transform; `Coordinate` is `{row, col}` (zero-based); `reverse` is a boolean
  flag on `PuzzleConfig` (not a 9th–16th direction) per the Prior decision, so
  `PlacedWord.direction` is one of the eight `Direction`s; the `CAT NE @ (5,14)`
  answer-key form is a Phase-4 rendering concern, not stored on `PlacedWord`; the
  determinism seed is a generate-time parameter (issue #13), deliberately NOT a
  `PuzzleConfig` field, matching the #9 acceptance list. `Difficulty` is the
  lowercase union `'easy'|'medium'|'hard'`; preset→config mapping is engine data,
  not a type. All collection fields are `readonly`.
