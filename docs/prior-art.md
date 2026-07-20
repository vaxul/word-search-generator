# Prior Art

> Descriptive, living document. Indexed BY CONCERN, not by project. Add
> entries whenever new references surface; gaps are fine.
>
> Tag each concern header with the one roadmap phase it feeds: `(Phase N)` for a
> roadmap P-number or `(feature: <slug>)` for a Features-table row (one tag, not
> both) — so `/loopkit:plan` can resolve "prior art for phase N" deterministically.

## Grid generation engine (Phase 2)

### blex41/word-search

- Path: https://github.com/blex41/word-search — `src/WordSearch.js`
- License: MIT
- Verdict: reuse — closest browser-usable placement engine; feature match on disabled directions, backward-probability, diacritics
- Date: 2026-07-20
- Notes:
  - ADOPT: options model (per-direction enable/disable N/S/E/W/NE/NW/SE/SW, backward-placement probability, custom dictionary, forbidden-word retry, dump/load state). Overlap-at-matching-letter placement.
  - AVOID: long-term hard dependency — last release Jan 2019, ~18 stars. Vendor/fork into our repo rather than depend on the unmaintained package.

### bunkat/wordfind

- Path: https://github.com/bunkat/wordfind — `wordfind.js`
- License: MIT
- Verdict: reference-only — most-starred JS option but stale (~14 commits, no releases)
- Date: 2026-07-20
- Notes:
  - ADOPT: random-placement-with-retries algorithm and the solver logic (useful later for verifying/highlighting solutions).
  - AVOID: the `wordfindgame.js` jQuery game layer — out of scope, wrong dependency.

### joshbduncan/word-search-generator

- Path: https://github.com/joshbduncan/word-search-generator (PyPI `word-search-generator`)
- License: MIT
- Verdict: reference-only — gold-standard model but Python/server-side, won't run client-side
- Date: 2026-07-20
- Notes:
  - ADOPT: difficulty-LEVEL abstraction (L1 = one direction … L3 = all 8), direction-string API (`"NW,SW"`), and the answer-key coordinate format (`CAT NE @ (5,14)`).
  - AVOID: adopting it as a runtime dependency (breaks the pure-browser model); mask/shape feature is out of MVP scope.

### Placement algorithm reference (Jamis Buck)

- Path: https://weblog.jamisbuck.org/2015/9/26/generating-word-search-puzzles.html
- License: n/a (article)
- Verdict: reference-only — clearest narrative of grid-as-1D-array + direction vectors + backtracking
- Date: 2026-07-20
- Notes:
  - ADOPT: grid-as-1D-array indexing, `(dRow,dCol)` direction vectors, stack-based backtracking, fill remaining cells with random letters.
  - AVOID: over-engineering — full backtracking often unnecessary when grid ≥ ~1.5× longest word; start with retries, escalate only if needed.

## German character set / diacritics (Phase 2)

### blex41/word-search — diacritics handling

- Path: https://github.com/blex41/word-search — diacritics + uppercase options
- License: MIT
- Verdict: reference-only — confirms umlaut/ß handling is a solved concern
- Date: 2026-07-20
- Notes:
  - ADOPT: normalize/uppercase words consistently; bias random fill to the alphabet actually in use so hidden umlaut-words aren't trivially findable.
  - AVOID: filling with characters outside the puzzle's alphabet — makes ä/ö/ü/ß words stand out.

## Puzzle input & configuration UI (Phase 3)

### Competitor UIs (jigsawmake, wordsearchgenerator.co, thewordsearch.com)

- Path: https://jigsawmake.com/custom-word-search-generator · https://wordsearchgenerator.co/ · https://thewordsearch.com/maker/
- License: n/a (proprietary web tools)
- Verdict: reference-only — closest feature competitors; study their config surface and PDF output
- Date: 2026-07-20
- Notes:
  - ADOPT: minimal, no-signup flow — paste words, set size + directions, preview, download. Grid 5×5–30×30, 8 directions, reverse toggle, difficulty presets.
  - AVOID: ads, forced accounts, download paywalls, US-Letter-only assumptions, cluttered dated UIs.

## A4 PDF export & print layout (Phase 4)

### parallax/jsPDF

- Path: https://github.com/parallax/jsPDF
- License: MIT
- Verdict: reuse — primary client-side PDF engine; native `a4` format, precise coordinate control
- Date: 2026-07-20
- Notes:
  - ADOPT: fixed A4 content box (~180×267 mm inside 15 mm margins); pack 1/2/4 puzzle blocks per page via origin offsets keyed to grid size; `addPage()` for solution pages.
  - AVOID: fighting a layout engine — geometric letter grids want manual coordinates, which jsPDF gives.

### Hopding/pdf-lib

- Path: https://github.com/Hopding/pdf-lib
- License: MIT
- Verdict: reference-only — fallback/alternative if font-embedding or merge/split robustness beats jsPDF
- Date: 2026-07-20
- Notes:
  - ADOPT: reliable Unicode TTF embedding for ä/ö/ü/ß; trivial merge/split for producing separate solution documents.
  - AVOID: choosing it over jsPDF prematurely — more code for simple text placement; decide by measured font-rendering need.

### Print-CSS `@page`

- Path: MDN `@page` / CSS Paged Media
- License: n/a (web standard)
- Verdict: reference-only — zero-dependency MVP/fallback path
- Date: 2026-07-20
- Notes:
  - ADOPT: `@page { size: A4 }`, `break-inside: avoid` per puzzle as a fast fallback preview/print route.
  - AVOID: relying on it as the primary export — non-deterministic across browsers, user must pick A4 and disable headers/footers manually.

## Product differentiation (feature: differentiation)

### Competitor landscape (Discovery Puzzlemaker, education.com, SuperTeacherWorksheets)

- Path: https://puzzlemaker.discoveryeducation.com/word-search · https://www.education.com/worksheet-generator/reading/word-search/ · https://www.superteacherworksheets.com/generator-word-search.html
- License: n/a (proprietary)
- Verdict: avoid — dated, ad-supported, or download-paywalled; define the gap against them
- Date: 2026-07-20
- Notes:
  - ADOPT (as gap to own): A4-first print fidelity, multiple puzzles per page keyed to grid size, genuinely separate solution sheets, ad-free/no-paywall/no-account.
  - AVOID: their monetization patterns and US-Letter defaults; feature-creep into a general worksheet suite.
