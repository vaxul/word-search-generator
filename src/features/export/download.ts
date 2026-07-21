// Browser download helper for the export feature. This is the ONE place the app
// touches DOM / browser APIs to save a file — the download is a FEATURE-layer
// concern, never `src/core` (constitution / docs/architecture.md). It performs
// NO network call: a jsPDF document is turned into an in-memory `Blob`, exposed
// via `URL.createObjectURL`, and saved through a transient `<a download>` click,
// then the object URL is revoked. `src/features` may import `src/core`; this
// module imports only the jsPDF type from there. No `any`; named exports.
import type { jsPDF } from 'jspdf';

/**
 * Saves `blob` to disk as `filename` via a temporary object URL and a
 * programmatically clicked `<a download>` anchor. The object URL is always
 * revoked afterwards (even if the click throws) so no blob reference leaks. No
 * network is touched — the blob lives entirely in memory.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Renders `doc` to a `Blob` (jsPDF's in-memory output — no network) and saves it
 * as `filename` via {@link downloadBlob}.
 */
export function downloadPdf(doc: jsPDF, filename: string): void {
  downloadBlob(doc.output('blob'), filename);
}
