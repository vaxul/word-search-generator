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
- 2026-07-20 (#4 — ESLint/Prettier guards): pinned toolchain — `eslint@9.17.0`,
  `typescript-eslint@8.18.2`, `@eslint/js@9.17.0`, `prettier@3.4.2`,
  `eslint-config-prettier@9.1.0`, `globals@15.14.0` (exact, matching the
  scaffold's exact-version convention; deterministic `npm ci`).
- 2026-07-20 (#4): `max-lines` (300) and `max-lines-per-function` (50) use
  `skipBlankLines` + `skipComments` — the limits govern real code, not blank
  lines or the mandated English comments.
- 2026-07-20 (#4): network guard is `no-restricted-globals` (bare `fetch` /
  `XMLHttpRequest`) **plus** `no-restricted-syntax` selectors for
  `window.fetch` / `window.XMLHttpRequest` / `new XMLHttpRequest()` — the
  member-access forms the globals rule alone would miss.
- 2026-07-20 (#4): `no-restricted-syntax` options are spread from shared arrays
  because ESLint replaces (not merges) a rule's options across overrides; the
  `src/features/**` + `src/app/**` block therefore re-declares the network +
  default-export selectors alongside the German-literal ones.
- 2026-07-20 (#4): German-literal backstop is scoped to `src/features/**` +
  `src/app/**` and deliberately **excludes** `src/strings/` (the one place
  German text is allowed) and `src/core/**` (no UI text). Confirmed by fixture:
  a non-ASCII literal in `src/strings/` is not flagged.
- 2026-07-20 (#4): core `no-undef` disabled for `src/**` TS files
  (typescript-eslint guidance — TS resolves identifiers; core `no-undef` only
  false-positives on type-only references).
- 2026-07-20 (#4): Prettier runs as a separate step (`format` / `format:check`);
  `eslint-config-prettier` turns off ESLint's stylistic rules so the two tools
  do not fight. `.prettierignore` excludes generated files and hand-maintained
  `docs/` prose.
- 2026-07-20 (#4): each guard verified to fire via temporary fixtures (React
  import in `core`, `any` in `core`, `fetch` in a feature, `default export`,
  German umlaut literal, a 59-line function) that were linted then removed — no
  violation fixtures are committed under `src/`.
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
- 2026-07-21 (#5 — Vitest + RTL harness): pinned test toolchain (exact
  versions, matching the scaffold convention) — `vitest@2.1.8`, `jsdom@25.0.1`,
  `@testing-library/react@16.1.0`, `@testing-library/dom@10.4.0` (RTL 16 peer,
  installed explicitly), `@testing-library/jest-dom@6.6.3`. Compatible with the
  installed Vite 6 / React 18.
- 2026-07-21 (#5): Vitest config lives **in** `vite.config.ts` (imported from
  `vitest/config`, which re-exports Vite's `defineConfig` with the `test` field
  typed) rather than a separate `vitest.config.ts` — one config, no duplicated
  `react()`/`tailwindcss()` plugin wiring to keep in sync. Env `jsdom`; test
  glob `src/**/*.{test,spec}.{ts,tsx}`.
- 2026-07-21 (#5): Vitest `globals` left **off** — test files import
  `describe`/`it`/`expect` from `'vitest'` so TypeScript and ESLint see real
  bindings, not ambient globals (no eslint test-env override needed, no extra
  `types` entry in tsconfig). jest-dom matchers registered once in
  `src/test/setup.ts` via `@testing-library/jest-dom/vitest`, which also
  augments `expect`'s type; RTL `cleanup()` is called explicitly in an
  `afterEach` there (auto-cleanup only fires when globals are enabled).
- 2026-07-21 (#5): smoke test (`src/smoke.test.tsx`) is deliberately
  self-contained — renders an inline probe component, not the app shell — so it
  is independent of the parallel app-shell work (#6). `verify` =
  `tsc --noEmit && eslint . && vitest run`; measured ~2-3 s on a clean checkout
  (recorded in `docs/workflow.md`).
- 2026-07-21 (#6 — src/ skeleton + strings + app shell): the `core/` and
  `features/` layers ship as **top-level placeholder modules** (`index.ts` with
  an explanatory comment + `export {}`), not the full `model/grid/pdf` and
  `editor/preview/export` sub-tree from `docs/architecture.md`. The sub-modules
  are created by the phase that fills them with logic (Phase 2+); committing
  empty sub-dirs now would be inert noise (git tracks no empty dirs anyway).
- 2026-07-21 (#6): the strings module is `src/strings/de.ts` (a `const de`
  object, `as const`, with a derived `Strings` type) re-exported from
  `src/strings/index.ts` as `strings` (the active locale). Components import
  `{ strings }` and read typed keys (`strings.app.title`); no German literal
  appears in `src/app/` or `src/features/`. Only the shell's title + tagline are
  populated in Phase 1 (spec: "only the handful of strings the shell needs").
- 2026-07-21 (#6): `src/app/App.tsx` (named `App` export) replaces the inline
  JSX previously living in `src/main.tsx`; `main.tsx` now only mounts `<App/>`.
  All styling stays token-derived Tailwind utilities (`bg-background`,
  `text-primary`, `text-secondary`, `font-sans`, the 4px spacing scale).
- 2026-07-21 (#7 — GitHub Actions Pages deploy): single workflow
  `.github/workflows/deploy.yml`, two jobs — `build` (checkout, setup-node with
  `node-version-file: .nvmrc` + npm cache, `npm ci`, `npm run verify`,
  `npm run build`, `configure-pages`, `upload-pages-artifact path: dist`) and
  `deploy` (`needs: build`, `environment: github-pages`, `deploy-pages`).
  `verify` runs before `build` so a red gate fails the job before any artifact
  is produced — deploy never ships a broken commit. Trigger `push` to `main` +
  `workflow_dispatch` (Prior decisions). `permissions: contents:read,
  pages:write, id-token:write`; `concurrency: group pages, cancel-in-progress:
  false` (a push mid-deploy queues rather than aborting a half-applied publish).
  Action majors: `checkout@v4`, `setup-node@v4`, `configure-pages@v5`,
  `upload-pages-artifact@v3`, `deploy-pages@v4` (current as of 2026-07-21).
