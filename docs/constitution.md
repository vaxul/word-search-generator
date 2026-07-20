# Constitution

> Normative and binding. Every principle must be verifiable and specific.
> Keep to ~1 page; this file is permanently loaded via CLAUDE.md. No status
> marker — foundation docs carry none.

## Tech stack

| Area | Choice | Rationale |
| ---- | ------ | --------- |
| Language | TypeScript (strict) | Type safety across UI and grid engine; `strict` catches placement bugs early |
| UI framework | React 18 + Vite | Largest ecosystem; Vite gives a fast static build for a pure client SPA |
| Styling | Tailwind CSS | Consistent UI without scattered CSS; fast iteration |
| PDF export | jsPDF | MIT, native `a4` format, precise coordinate control for letter grids (see prior-art) |
| Grid engine | Own TS module in `src/core/`, vendoring the @blex41/word-search approach | Reuse proven placement logic without depending on an unmaintained package |
| Testing | Vitest + React Testing Library | Fast unit tests for core logic; component tests for UI |
| Lint / format | ESLint + Prettier | Enforce conventions mechanically |
| Hosting | GitHub Pages via GitHub Actions | Free, static, no extra account; matches a no-backend client app |
| Backend | none | Privacy-friendly, offline-capable, no accounts (see vision non-goals) |

## Architecture principles

- Pure domain logic (grid generation, placement, PDF layout math) lives in
  `src/core/` and imports **no** React or DOM APIs — enforced by an ESLint
  `no-restricted-imports` rule on that directory.
- The grid engine is deterministic given a seed and has no UI dependency.
- No runtime network calls: `fetch` / `XMLHttpRequest` are disallowed in
  application code — the app must work fully offline.
- Max function length 50 lines; max file length 300 lines.
- No `any` in `src/core/` (`noImplicitAny` + lint); explicit types on public
  functions.

## Conventions

- Code, comments, and all `docs/` artifacts are written in **English**.
- User-facing UI text is **German**, centralized in one strings module — no
  German string literals scattered across components.
- Filenames: React components `PascalCase.tsx`; everything else `camelCase.ts`.
- Named exports only (no `default export`, except where a tool requires it).

## Quality gates

- `npm run verify` passes: TypeScript type-check + ESLint + Vitest.
- New domain logic in `src/core/` ships with unit tests.
- `npm run build` succeeds (production static build).

## Don'ts

- No backend, external API, analytics/tracking, or ads.
- No accounts or server-side storage of user-entered words.
- No runtime dependency on unmaintained packages — the placement engine is
  vendored into `src/core/`, not pulled as a dependency.
- No secrets or keys committed to the repo.
