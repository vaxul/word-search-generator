// Word-list parsing helper (issue #32). Turns the raw textarea value — one word
// per line, paste-friendly — into a clean list before the config is built:
// trim each line, drop empties, de-duplicate. Case-folding and umlaut/ß
// normalization stay the ENGINE's job (spec Prior decision / src/core boundary),
// so this only removes obvious noise. Consumed at generate time (issue #33); it
// lives in the feature layer and imports no core / React.

/**
 * Parse the raw word-list textarea value into a clean, de-duplicated list.
 *
 * Splits on newlines, trims surrounding whitespace, drops empty lines, and
 * removes duplicates while preserving first-seen order. Normalization (case,
 * umlaut/ß) is deliberately NOT done here — that is the engine's responsibility.
 *
 * @param raw - The textarea value (one word per line).
 * @returns The cleaned words, in first-seen order, without duplicates.
 */
export function parseWords(raw: string): readonly string[] {
  const seen = new Set<string>();
  const words: string[] = [];
  for (const line of raw.split('\n')) {
    const word = line.trim();
    if (word.length === 0 || seen.has(word)) {
      continue;
    }
    seen.add(word);
    words.push(word);
  }
  return words;
}
