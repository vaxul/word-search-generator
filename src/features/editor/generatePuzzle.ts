// Generate wiring (issue #33). The feature-layer glue between the editor store
// and the pure Phase 2 engine: build the core PuzzleConfig from the collected
// config INPUTS, mint a fresh per-run seed, and call generate(). The seed is
// created HERE (feature layer) — Math.random is banned in src/core ONLY — and is
// never surfaced or persisted (spec Prior decision / docs/vision.md:
// reproducibility is out of scope). Generation runs only when the button is
// clicked; there is no live auto-regeneration. This module imports src/core
// (never the reverse) and holds no React/DOM dependency.

import type { ConfigInputs } from '../../app/state';
import { generate } from '../../core';
import type { GenerationResult, PuzzleConfig } from '../../core';
import { parseWords } from './parseWords';

/**
 * Build the core {@link PuzzleConfig} directly from the editor's config INPUTS
 * plus the cleaned word list.
 *
 * Built DIRECTLY — not via `configFromDifficulty` — so the manual path is
 * covered: {@link ConfigInputs} already holds the resolved size / directions /
 * reverse (a preset seeds them and manual edits override, so the current values
 * are authoritative for both the preset and manual paths — spec Prior decision).
 * The square `size` becomes both width and height; the engine clamps it into the
 * 5–30 bound. The difficulty / header / font view-model fields are intentionally
 * NOT copied here — the core config's sole role is generation input.
 */
export function buildPuzzleConfig(
  config: ConfigInputs,
  words: readonly string[],
): PuzzleConfig {
  return {
    width: config.size,
    height: config.size,
    directions: config.directions,
    reverse: config.reverse,
    words,
  };
}

/**
 * Mint a fresh, non-negative 32-bit seed for one generation run.
 *
 * Lives in the feature layer: `Math.random` is allowed outside `src/core`
 * (constitution / spec), keeping the engine deterministic given the seed it is
 * handed. The value is returned only to be passed straight into
 * {@link generate} — never stored or shown to the user.
 */
export function nextSeed(): number {
  return Math.floor(Math.random() * 2 ** 32);
}

/**
 * Run one generation: clean the raw word-list text, build the config, and invoke
 * the engine with a per-run seed.
 *
 * @param rawWords - The raw textarea value (one word per line).
 * @param config - The editor's current config inputs (preset-seeded or manually
 *   overridden — both resolved into the same {@link ConfigInputs}).
 * @param seed - The generate-time seed; injectable for deterministic tests but
 *   defaults to a fresh {@link nextSeed} value in the app.
 * @returns The {@link GenerationResult} to store in the app state.
 */
export function runGeneration(
  rawWords: string,
  config: ConfigInputs,
  seed: number = nextSeed(),
): GenerationResult {
  return generate(buildPuzzleConfig(config, parseWords(rawWords)), seed);
}
