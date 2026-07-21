// Public entry point for the export feature module (src/features/export). The
// download trigger that lives with the editor: renders the puzzle + a separate
// solution PDF via `src/core` and downloads two files in the browser. This is
// the feature layer, so the DOM/download lives here — never in `src/core`
// (constitution / docs/architecture.md).
export { ExportAction } from './ExportAction';
export { exportPuzzlePdfs, sanitizeFilenameStem } from './exportPuzzle';
export type { ExportFilenameParts } from './exportPuzzle';
export { downloadBlob, downloadPdf } from './download';
