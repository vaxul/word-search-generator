// Aggregate entry point for the React feature modules (docs/architecture.md).
// Each feature owns its own folder + barrel; the export feature lands in Phase 4.
// UI text always comes from src/strings/, never inline.
export { EditorPanel } from './editor';
export { PreviewPanel } from './preview';
