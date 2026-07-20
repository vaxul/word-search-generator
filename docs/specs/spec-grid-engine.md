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
      grid size + allowed direction set + reverse flag (mapping resolved at the
      spec-acceptance gate).
- [ ] Words that cannot be placed are returned in `GenerationResult` as an
      explicit un-placeable list — **never silently omitted** (`docs/vision.md`
      success criterion).
- [ ] German umlauts (ä/ö/ü) and ß are handled correctly: words are normalized
      to a consistent case and preserved (not transliterated), and random fill
      is biased to the alphabet actually in use so hidden umlaut-words do not
      stand out.
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
- Alphabet-biased random fill honoring the German character set.
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
  — random-placement-with-retries algorithm (the solver layer is out of scope).
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
| Words normalized to **UPPERCASE**, umlauts/ß **preserved** (not transliterated to ae/oe/ue/ss) | `docs/vision.md`: "Correct handling of German umlauts / ß." Transliteration would change the word the child searches for. Uppercase gives a uniform grid (prior-art diacritics note). | 2026-07-20 |
| Random fill drawn from the **alphabet actually in use** (the union of letters across the placed words, incl. any umlaut/ß present) | Prior-art diacritics: filling with out-of-alphabet characters makes ä/ö/ü/ß words stand out. Keeps difficulty honest. | 2026-07-20 |
| Grid size bounds **5×5 – 30×30** | Prior-art competitor range; below 5 is unusable, above 30 breaks A4 print legibility (Phase 4). | 2026-07-20 |
| A word longer than the grid dimension is **reported un-placeable**, never a crash or silent drop | `docs/vision.md` success criterion: places all words or clearly reports which do not fit — never a silent omission. | 2026-07-20 |
| **OPEN — the exact Easy / Medium / Hard preset mapping** (grid size + allowed direction set + reverse on/off for each) | resolved at the spec-acceptance gate | — |

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
- [ ] Unit test: German — ä/ö/ü/ß words are placed and readable; random fill
      contains no character outside the in-use alphabet.
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

- 2026-07-20: Phase split from `docs/roadmap.md`; Phase 2 owns `core/model` +
  `core/grid` only — no rendering (Phase 3) or PDF (Phase 4).
