# Spec: Phase 1 — Project scaffold & deploy

> Created: 2026-07-20

Stand up the pure-browser SPA toolchain — Vite + React 18 + TypeScript (strict),
Tailwind wired to the design tokens, ESLint + Prettier enforcing the
constitution's architecture rules, Vitest + React Testing Library, a single
`npm run verify` gate, and an automated GitHub Pages deploy via GitHub Actions —
so every later phase builds, verifies, and ships on a working foundation.

## Outcome

What is true when this work is done:

- [ ] `npm ci && npm run build` produces a static production bundle with the
      correct GitHub Pages base path, servable from `dist/`.
- [ ] `npm run verify` runs TypeScript type-check + ESLint + Vitest and passes
      on a clean checkout.
- [ ] ESLint mechanically enforces the constitution's architecture rules:
      `src/core/*` may not import React/DOM; `fetch`/`XMLHttpRequest` are
      disallowed in application code; `max-lines` 300 / `max-lines-per-function`
      50; no `default export`; `no-explicit-any` in `src/core/`.
- [ ] Tailwind is wired to the design tokens (`docs/design.md` front-matter →
      `src/styles/tokens.css`), and the theme is available to components.
- [ ] A minimal running app shell renders (placeholder screen) proving the
      React + Vite + Tailwind + strings-module pipeline works end-to-end.
- [ ] The centralized German strings module (`src/strings/`) exists and is the
      only place UI text lives; a lint or convention guard keeps German literals
      out of components.
- [ ] Pushing to `main` builds and deploys the app to GitHub Pages via Actions;
      the live URL serves the app with working asset paths.

## Scope

### In scope

- Vite + React 18 + TypeScript (`strict`) project skeleton.
- Tailwind CSS configured; `src/styles/tokens.css` derived from the
  `docs/design.md` token front-matter; Tailwind theme referencing those tokens.
- ESLint (flat config) + Prettier, with the constitution's architecture rules
  encoded as lint rules (see Outcome).
- Vitest + React Testing Library harness with one smoke test wired into
  `npm run verify`.
- `package.json` scripts: `dev`, `build`, `preview`, `verify`, `test`, `lint`,
  `format`.
- `src/` directory skeleton matching `docs/architecture.md` (`core/`,
  `features/`, `app/`, `strings/`, `styles/`) with placeholder modules where a
  later phase fills them in — **no domain logic**.
- Minimal app shell (`src/app/`) rendering a placeholder screen through the
  strings module, to prove the pipeline.
- GitHub Actions workflow: build on push to `main`, deploy to GitHub Pages.
- Repo hygiene: `.gitignore`, `.nvmrc`/engines pin, `.prettierrc`, editorconfig.

### Out of scope

- Any grid-generation / placement logic (Phase 2).
- Any real editor controls, preview rendering, or PDF export (Phases 3–4).
- Full German copy — only the handful of strings the placeholder shell needs;
  the module and the guard are what Phase 1 delivers.
- Font asset bundling for the dyslexia-friendly fonts (established when the
  preview/editor needs them, Phase 3) — Phase 1 only records the token.

## Constraints

Per `docs/constitution.md` (not restated — referenced):

- Stack is fixed: TypeScript strict, React 18 + Vite, Tailwind, jsPDF (later),
  Vitest + RTL, ESLint + Prettier, GitHub Pages via Actions, no backend.
- `src/core/*` imports no React/DOM; enforced by ESLint `no-restricted-imports`
  on that directory.
- No runtime network calls anywhere in application code.
- Max function 50 lines; max file 300 lines; no `any` in `src/core/`.
- Code + comments + `docs/` in English; UI text German, centralized in one
  strings module; components `PascalCase.tsx`, other files `camelCase.ts`;
  named exports only (except where a tool config requires a default).
- `npm run verify` = type-check + ESLint + Vitest is the quality gate;
  `npm run build` must succeed.
- GitHub Pages is a **project page** at `https://vaxul.github.io/word-search-generator/`,
  so Vite `base` must be `/word-search-generator/` in the production build.

## Prior art

Phase 1 is greenfield tooling — `docs/roadmap.md` records it as *greenfield, no
prior art*, and `docs/prior-art.md` is indexed by concern for Phases 2–4 only.

- **none relevant** — the scaffold is standard Vite/React/TS wiring with no
  domain concern for prior art to inform. (Design tokens come from
  `docs/design.md`, not prior art.)

## Human prerequisites

- [x] **GitHub Pages enabled with source = "GitHub Actions"** for
      `vaxul/word-search-generator` (repo Settings → Pages → Build and
      deployment → Source: GitHub Actions). The deploy workflow uses
      `actions/configure-pages` + `actions/deploy-pages`; the human confirms
      Pages is enabled (or lets `configure-pages` enable it) so the first deploy
      does not fail on a disabled Pages endpoint.
- [x] **Actions enabled** for the repo and workflow permissions allow
      `pages: write` + `id-token: write` (default for repo-owned Actions;
      confirm no org policy blocks it).
- [x] **Repo is public** (or the account plan permits GitHub Pages on a private
      repo). Pages on the free tier requires a public repo; a private repo needs
      a paid plan. Confirm the repo's visibility/plan supports Pages.

No secrets, API keys, or `.env` values are needed — the app has no backend
(constitution).

## Prior decisions

| Decision | Rationale | Date |
|---|---|---|
| Vite `base: '/word-search-generator/'` in the production build (dev uses `/`) | GitHub project pages serve under the repo-name path; assets 404 otherwise. Derived from the repo name. | 2026-07-20 |
| ESLint **flat config** (`eslint.config.js`) | Current ESLint default (v9+); `no-restricted-imports`, `max-lines`, `max-lines-per-function`, `no-restricted-globals` (fetch/XHR), `no-restricted-syntax` (default export), `@typescript-eslint/no-explicit-any` encode the constitution mechanically. | 2026-07-20 |
| `src/core` architecture guard via `no-restricted-imports` scoped to `src/core/**` | Constitution mandates `src/core` import no React/DOM; the path-scoped override is the mechanical enforcement it calls for. | 2026-07-20 |
| `no-explicit-any` scoped stricter (error) in `src/core/**` | Constitution forbids `any` in core specifically; `noImplicitAny` (tsconfig strict) covers implicit, lint covers explicit. | 2026-07-20 |
| Node 22 LTS pinned (`.nvmrc` + `package.json` engines) for local + CI | Node 20 reached end-of-life (~April 2026); Node 22 is the current maintenance LTS as of 2026-07-20. Deterministic `npm ci` across dev and Actions. | 2026-07-20 |
| npm as package manager (committed `package-lock.json`) | `docs/workflow.md` Bootstrap is `npm ci`; matches the contract. | 2026-07-20 |
| `tokens.css` generated from `docs/design.md` front-matter, committed (not build-time-generated) | Keeps the build dependency-free and offline; the tokens change rarely. Kept in sync **manually**, with the source-of-truth (`docs/design.md`) named in a header comment at the top of `tokens.css` so the next editor knows where the values come from. No sync script in Phase 1 (low churn; a script is over-engineering now). | 2026-07-20 |
| German-literal guard = ESLint rule flagging **non-ASCII** string literals (umlaut/ß) in `src/features/**` and `src/app/**` (pointing to `src/strings/`) — a **partial** backstop, not full enforcement | Constitution: "no German string literals scattered across components." The lint rule mechanically catches umlaut/ß literals; ASCII-only German ("Titel", "Download") slips past it, so the real enforcement is the centralization convention (all UI text in `src/strings/`) plus review. The spec does not claim the lint rule fully enforces the rule. | 2026-07-20 |
| Deploy trigger = push to `main` (+ manual `workflow_dispatch`) | Base/integration branch is `main` (`docs/workflow.md`); every merged change ships. | 2026-07-20 |

No genuinely-open decisions — every fork is settled by the constitution,
architecture doc, or a determinable repo fact.

## Tracking

- Milestone: created at the spec-acceptance gate (Phase 1 — Project scaffold & deploy).
- Issues: created from this spec once merged (one per implementable step).

Each issue references this spec path in its body.

## Verification

Per `docs/workflow.md` (Verify = `npm run verify`, Build = `npm run build`;
Test is `none yet` until this phase defines it — so items below no machine check
covers are checked at the human milestone-QA gate).

- [ ] `npm ci` succeeds from a clean clone (lockfile committed).
- [ ] `npm run verify` passes: `tsc --noEmit` (strict) + ESLint (0 errors) +
      Vitest (smoke test green).
- [ ] `npm run build` succeeds and emits `dist/` with asset URLs prefixed
      `/word-search-generator/`.
- [ ] ESLint **fails** on a deliberate violation of each guard (React import in
      `src/core`, a `fetch` in app code, an `any` in core, a `default export`, a
      German umlaut/ß string literal in a component) — confirming the rules are live.
      *(A tiny fixture test or a manual check at the QA gate.)*
- [ ] `npm run dev` serves the placeholder shell locally; text comes from
      `src/strings/`.
- [ ] **[QA gate]** The GitHub Actions run on `main` completes and the live
      GitHub Pages URL renders the app with no broken asset paths (`UI check`).

## Risks and mitigations

| Risk | Mitigation |
|---|---|
| First Pages deploy fails because Pages is not enabled on the repo | Listed as a human prerequisite; `actions/configure-pages` can also auto-enable with `enablement: true`. |
| Vite `base` wrong → white screen / 404 assets on Pages, works locally | `base` is env-conditional (prod only); QA-gate `UI check` on the live URL catches it before the phase closes. |
| ESLint flat-config + `typescript-eslint` version drift breaks `verify` | Pin versions in `package.json`; `npm ci` from the committed lockfile is deterministic. |
| Token drift between `docs/design.md` and `tokens.css` | Single source of truth is the doc front-matter; a committed sync note (or script) documents how to regenerate; low churn. |
| Over-scoping the shell into real UI | Scope explicitly bars editor/preview/PDF; shell is a placeholder proving the pipeline only. |

## Decision log

- 2026-07-20: Phase split from `docs/roadmap.md`; scaffold owns toolchain +
  deploy only, no domain logic (that is Phase 2+).
- 2026-07-20 (issue #3): **Tailwind v4** via the first-party `@tailwindcss/vite`
  plugin (no PostCSS/`tailwind.config.js`). The spec did not pin a Tailwind
  major; v4 is the current stable and integrates cleanly with the installed
  Vite 6. The design tokens are declared as Tailwind `@theme` variables in
  `src/styles/tokens.css` (imported via `src/styles/main.css`), so the tokens
  *are* the theme — utilities (`bg-primary`, `text-foreground`, `font-sans`,
  `rounded-md`, the 4px-based spacing scale) resolve to the `docs/design.md`
  values, satisfying the "Tailwind theme references those tokens" requirement
  with a single manually-synced source file (no build-time generator, per the
  existing `tokens.css` decision above).
