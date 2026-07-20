# Architecture

> Structural, living document — the most volatile artifact. Update whenever a
> change alters components, boundaries, or flows.

## Component map

| Component | Responsibility |
| --------- | -------------- |
| `src/core/model/` | Domain types: `PuzzleConfig`, `Grid`, `PlacedWord`, `Difficulty`, `Direction`, `GenerationResult` |
| `src/core/grid/` | Deterministic grid generation: word placement, direction vectors, overlaps, random-fill, un-placeable report |
| `src/core/pdf/` | A4 layout math + jsPDF rendering: puzzle pages, multiple-per-page packing, separate solution pages |
| `src/features/editor/` | React UI: enter words, set size / directions / preset, title, font options |
| `src/features/preview/` | Live preview of the generated grid (React) |
| `src/features/export/` | Triggers PDF generation (puzzle / solution) and download |
| `src/app/` | App shell, layout, state wiring |
| `src/strings/` | Centralized German UI text |

## Boundaries

- `src/features/*` and `src/app/` may import `src/core/*` — **never** the reverse.
- `src/core/*` has no React/DOM imports (ESLint-enforced); `core/pdf` uses jsPDF
  but no DOM APIs.
- No module makes runtime network calls — the app works fully offline.

## Key flows

1. **Generation:** editor collects a `PuzzleConfig` → `core/grid` produces a
   `GenerationResult` (grid + placed words + un-placeable words) → preview shows
   the grid and any un-placeable warning.
2. **Export:** `GenerationResult` → `core/pdf` computes A4 packing (1/2/4 per
   page by grid size) → jsPDF document(s): puzzle and, separately, solution →
   browser download.
3. **Difficulty:** a preset (Easy / Medium / Hard) maps to grid size + allowed
   direction set → folded into `PuzzleConfig`.

## Where new code goes

- New puzzle / placement logic → `src/core/grid/` (with a unit test).
- New print / layout rule → `src/core/pdf/`.
- New input / control element → `src/features/editor/`.
- New UI text → always `src/strings/`, never inline.
