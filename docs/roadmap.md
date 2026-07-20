# Word Search Generator — Roadmap

> Living document: the sequenced queue of phases. The hand-off to `/plan`, which
> picks the next phase, creates its spec + issues, and links them back here.
> No status markers — progress lives in the GitHub issues and milestones each
> phase links to. Specs (created by `/plan`) carry no lifecycle state either;
> a spec is "accepted" once merged on the default branch with a milestone and
> issues.

## Phase overview

| Phase | Name | Spec | Milestone |
|---|---|---|---|
| 1 | Project scaffold & deploy | [spec](specs/spec-scaffold.md) | [#1](https://github.com/vaxul/word-search-generator/milestone/1) |
| 2 | Grid generation engine | [spec](specs/spec-grid-engine.md) | [#2](https://github.com/vaxul/word-search-generator/milestone/2) |
| 3 | Editor & preview UI | — | — |
| 4 | A4 PDF export | — | — |

A phase gets a Spec link once `/plan` drafts it, and a Milestone link once the
spec is merged. The milestone (open/closed + issue progress) is where status
lives.

### Phase notes

- **Phase 1 — Project scaffold & deploy.** Vite + React + TypeScript (strict),
  Tailwind, ESLint + Prettier, Vitest, the single `npm run verify` command, and
  the GitHub Pages deploy via Actions. Prior art: *greenfield — no prior art*.
- **Phase 2 — Grid generation engine.** `core/model` + `core/grid`: deterministic
  placement, direction sets, difficulty presets, overlap handling, random fill,
  un-placeable reporting, German umlaut/ß handling. Prior art:
  `docs/prior-art.md` → *Grid generation engine (Phase 2)* and *German character
  set / diacritics (Phase 2)*.
- **Phase 3 — Editor & preview UI.** Word input, size/direction/preset controls,
  per-puzzle title, live preview, accessible/dyslexia-friendly font. Prior art:
  *Puzzle input & configuration UI (Phase 3)*.
- **Phase 4 — A4 PDF export.** `core/pdf`: puzzle + separate solution sheets,
  multiple puzzles per page keyed to grid size. Prior art: *A4 PDF export &
  print layout (Phase 4)*.

## North star

From your own words to a print-ready A4 puzzle with a separate solution — in
under two minutes, without ballast.
