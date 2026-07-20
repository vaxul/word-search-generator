# Vision

> Normative. What and why only — no implementation detail. Keep to ~1 page;
> this file is permanently loaded via CLAUDE.md. No status marker — foundation
> docs carry none.

## Problem

Parents and teachers want to give children word-search puzzles built from their
own words (weekly vocabulary, names, themes) and print them cleanly. Existing
generators are ad-heavy or paywalled, US-Letter-centric, allow only shallow
difficulty control, and append the answer key rather than producing a genuinely
separate solution sheet.

## Why now

Sustained demand for printable learning material (homeschooling, tutoring,
weekly practice). The market is full of generic tools but leaves a clear gap for
an A4-first, ballast-free generator that combines custom words, controlled
difficulty, and truly print-ready output.

## Target users

- **Primary (create & print):** parents and teachers — not technical, want a
  finished sheet fast.
- **Secondary (solve):** children — search and mark words on the printed sheet.

## Goal

An ad-free browser web-app that turns a custom word list into print-ready DIN A4
puzzle sheets — with separate solution sheets — in under ~2 minutes, with
difficulty controlled through grid size and allowed directions.

## USP / differentiation

A4-first, multiple puzzles per page keyed to grid size, genuinely separate
solution sheets, and no account / ads / paywall. The one thing prior art does
not cover: clean A4 print fidelity with separated solutions for self-defined
words. Differentiation evidence and the per-alternative ADOPT/AVOID harvest live
in `docs/prior-art.md` — not restated here.

## Success criteria

- From an empty word list to a finished A4 PDF (puzzle **plus** separate
  solution) in **under ~2 minutes**, without instructions.
- The generator places **all** entered words, or clearly reports which do not
  fit — never a silent omission.
- Difficulty is controllable via **grid size** and **direction set**
  (horizontal / vertical / diagonal, optional reverse).
- **Multiple puzzles per A4 page** depending on grid size; clean layout with no
  clipping when printed.
- Solution sheets are printable **separately** from the puzzle.

## Scope

### In

- Enter custom words (paste / one per line).
- Grid size and direction control (H / V / D, reverse); difficulty presets
  (Easy / Medium / Hard).
- Clear reporting of words that cannot be placed.
- Live preview before printing.
- A4 PDF export: puzzle + separate solution, multiple puzzles per page by size.
- Per-puzzle title / header (name, theme, date) and printed word list to find.
- Correct handling of German umlauts / ß.
- Accessible / dyslexia-friendly font and adjustable font size.

### Out

- Batch / book mode (many puzzles at once).
- Themed word-list templates.
- Grid shapes / masks (heart, star).
- Save / load configuration (JSON, no account).
- Seed / reproducibility (regenerate the same puzzle).
- "Blind" mode (show only the count, not the word list).

## Non-goals

- On-screen solving / marking — this is a print tool, not a game (MVP).
- A general worksheet suite — word search only, to stay focused.
- Accounts / cloud storage — no login; the app stays local and privacy-friendly.
- Ads / paywalls — free and unobstructed by design.
