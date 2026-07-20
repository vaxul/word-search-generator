---
kind: "ui"
color:
  background: "#ffffff"
  foreground: "#1f2937"
  primary: "#4f46e5"
  secondary: "#64748b"
  accent: "#f59e0b"
  muted: "#f3f4f6"
  border: "#e5e7eb"
  destructive: "#dc2626"
type:
  font-sans: "Inter, system-ui, sans-serif"
  font-mono: "ui-monospace, SFMono-Regular, monospace"
  font-accessible: "Atkinson Hyperlegible, OpenDyslexic, sans-serif"
  scale: "12 / 14 / 16 / 20 / 24 / 32 / 48 px"
  weights: "400 / 500 / 600 / 700"
  line-height: "1.5 body / 1.2 headings"
spacing:
  unit: "4px"
  scale: "4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px"
radii:
  sm: "4px"
  md: "8px"
  lg: "16px"
  full: "9999px"
shadow:
  sm: "0 1px 2px rgba(0,0,0,.05)"
  md: "0 4px 12px rgba(0,0,0,.1)"
---

# Design contract

> Design contract for the loopkit skills (`/loopkit:design`, `/loopkit:plan`,
> `/loopkit:implement`) — the single source for this project's design medium,
> rules, and handoff. Filled during inception for a design-surface project — one
> that renders a UI, or where a visualisation would materially clarify recurring
> decisions; the skills read it instead of hardcoding any tool. The sibling of
> `docs/workflow.md`. A project with neither surface records `none` and has no
> `docs/design.md`.

## Overview

The app is print-first and calm: a light, uncluttered single-screen editor whose
job is to get a parent or teacher from a word list to a print-ready A4 sheet
without friction or distraction. Density is low, controls are large and obvious,
and the visual weight sits on the puzzle preview — the thing the user actually
cares about. The indigo primary reads as trustworthy-but-friendly for a family/
classroom context; the amber accent marks the one primary action (generate /
download). Because the audience includes children and the tool is educational,
accessibility is a first-class constraint: **WCAG 2.1 AA** contrast on every
interactive element, plus a selectable **dyslexia-friendly font** (Atkinson
Hyperlegible / OpenDyslexic) that applies to both the on-screen preview and the
printed grid. The tokens above are the single source of truth; this prose is the
rationale.

## Design tool

- Tool / MCP: **Claude Artifacts** (HTML/React mockups) — the primary editor for
  quick UI exploration. No secondary tool.
- The tool is the **editor, never the source of truth.** The durable design
  state is the committed files in this repo (see Durable form), not anything
  living only inside the tool.
- Auth: in-session / subscription only — no headless run, no API key, no
  scheduler (constitution).

## Where designs live

- Source / working designs: a Claude Artifact (mockup) per screen/component
  iteration. This is the editing surface; it is NOT durable state on its own.
- Committed tokens: `docs/design.md` front-matter above (source of truth) plus
  `src/styles/tokens.css` generated from it and imported by the build.
- Committed assets: `docs/design/assets/` (exported mockup screenshots).

## Durable form

The durable design form is **a file committed to this repo** — the token
front-matter here, an exported image, or a screenshot — referenced from the spec
or the issue. An external-tool URL (a Claude Artifact share link) is NOT a valid
durable form: the tool is the editor, the committed file is the state
(constitution: GitHub-only durable state). When `/loopkit:design` finishes, the
design exists as a committed file at the location above, not as a link.

## Review path

- Reviewer: an in-session Agent reviewer running a design critique (token
  adherence + WCAG 2.1 AA contrast + dyslexia-font legibility on the printed
  grid).
- The design is reviewed **AT the spec-acceptance gate** as part of the spec
  package — never a separate stop after planning (constitution: exactly two
  human gates). Reference, do not restate.

## Handoff format

- Format the implementer consumes: `src/styles/tokens.css` imported by the
  build (Tailwind theme derived from the same tokens), plus a mockup screenshot
  in `docs/design/assets/` referenced from the design-surface issue.
- `/loopkit:implement` consumes the committed artifact referenced from the
  design-surface issue; it never reaches into the design tool.

## Components

- **Button** — variants: primary (amber accent, the single generate/download
  action), secondary (indigo outline), ghost. States default / hover / active /
  disabled / focus (visible focus ring using `primary`). Radius `md`, spacing
  scale for padding.
- **Word-list textarea** — one word per line; monospace or accessible font,
  `border` default, `primary` focus ring, `destructive` border + message for
  un-placeable-word warnings. Radius `md`.
- **Select / control** (grid size, direction toggles, difficulty preset,
  font choice) — consistent height, `border` token, `muted` background on
  disabled. Direction toggles are a labelled toggle group, not raw checkboxes.
- **Preview grid** — the visual centerpiece: fixed-pitch letter cells, high
  contrast (`foreground` on `background`), honors the selected accessible font,
  `border` between cells; solution view highlights placed words with `accent`.
- **Card / panel** — groups the editor controls; padding from the spacing
  scale, radius `lg`, `shadow.sm`, `border` token.

## Do's and Don'ts

**Do**

- Use the spacing scale above for every margin and padding.
- Meet WCAG 2.1 AA contrast on every interactive element and the printed grid.
- Reference only the named tokens — never a raw hex outside this file.
- Keep the dyslexia-friendly font applying to both preview and printed output.

**Don't**

- Introduce a color, font, or radius not in the front-matter.
- Treat a Claude Artifact share link as the design — commit the file.
- Add a third human gate — design is reviewed at spec-acceptance.
