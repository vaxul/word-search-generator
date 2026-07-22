// Deterministic A4 layout math for the PDF export (Phase 4, docs/specs/
// spec-pdf-export.md). Pure geometry in millimetres — given a grid size and a
// copy count it yields the content box, per-block origins/sizes, the square
// cell pitch, and the page pagination. NO jsPDF calls and NO DOM APIs
// (constitution: src/core is UI-free); the puzzle/solution renderers (#39/#40)
// consume these boxes to place their marks. Every value here is a function of
// its inputs alone, so the whole module is unit-testable without a real PDF.

/**
 * An axis-aligned rectangle in millimetres. `x`/`y` are the top-left corner
 * measured from the page's top-left origin (jsPDF's coordinate convention);
 * `width`/`height` extend right and down.
 */
export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * The geometry of a single puzzle copy ("block") on a page: its full `box`, the
 * `header` strip (title / theme / date) at the top, the square `grid` area where
 * the `size`×`size` letter cells go (centred in the space between header and
 * word list), the `wordList` strip at the bottom, and the derived `cellPitch`
 * (mm per cell). Renderers draw into these boxes; they never recompute geometry.
 */
export interface BlockLayout {
  readonly box: Box;
  readonly header: Box;
  readonly grid: Box;
  readonly wordList: Box;
  readonly cellPitch: number;
}

/** One A4 page: its zero-based `pageIndex` and the blocks packed onto it. */
export interface PageLayout {
  readonly pageIndex: number;
  readonly blocks: readonly BlockLayout[];
}

/**
 * The full pagination for `copies` copies of one puzzle: how many fit per page,
 * the resulting page count, and every page's block layouts. The last page may be
 * partial — it simply carries fewer blocks in the same slots, never clipped.
 */
export interface PaginationResult {
  readonly puzzlesPerPage: number;
  readonly pageCount: number;
  readonly pages: readonly PageLayout[];
}

/** DIN A4 portrait page dimensions in millimetres. */
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;

/** Uniform page margin; the content box is the page inset by this on all sides. */
export const PAGE_MARGIN_MM = 15;

/** Gap between packed blocks, in millimetres. */
export const BLOCK_GUTTER_MM = 8;

/** Vertical space reserved at the top of a block for its header. */
export const BLOCK_HEADER_MM = 12;

/** Vertical space reserved at the bottom of a block for its word list. */
export const BLOCK_WORDLIST_MM = 14;

/**
 * Vertical breathing room between the header strip and the top of the grid, so
 * the header does not read as glued to the letters in print (QA finding, #54).
 * The grid region is inset by this below the header before the square is fitted.
 */
export const HEADER_GAP_MM = 4;

/**
 * Vertical breathing room between the bottom of the grid and the word-list strip
 * (QA finding, #54). The grid region is inset by this above the word list before
 * the square is fitted, so the words-to-find read as a clearly separate block.
 */
export const WORDLIST_GAP_MM = 4;

/**
 * Minimum legible cell pitch (mm). The packing tiers are chosen so that every
 * grid size, placed in its assigned tier, yields a pitch at or above this floor;
 * `paginate` guarantees it and the unit tests assert it across the size range.
 */
export const MIN_LEGIBLE_CELL_PITCH_MM = 5;

/** The fixed A4 content box: the page inset by {@link PAGE_MARGIN_MM}. ≈180×267 mm. */
export const CONTENT_BOX: Box = {
  x: PAGE_MARGIN_MM,
  y: PAGE_MARGIN_MM,
  width: A4_WIDTH_MM - 2 * PAGE_MARGIN_MM,
  height: A4_HEIGHT_MM - 2 * PAGE_MARGIN_MM,
};

function assertGridSize(size: number): void {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError(`grid size must be a positive integer, got ${size}`);
  }
}

/**
 * Puzzles packed per A4 page, keyed to grid size (spec Prior decisions):
 * `≤10 → 4-up`, `11–17 → 2-up`, `≥18 → 1-up`. Small grids share a page for paper
 * economy; large grids get the whole box to stay legible.
 */
export function puzzlesPerPage(size: number): number {
  assertGridSize(size);
  if (size <= 10) return 4;
  if (size <= 17) return 2;
  return 1;
}

/** Column/row split of a page for a given per-page count: 4-up=2×2, 2-up=1×2, 1-up=1×1. */
function blockGridShape(perPage: number): { cols: number; rows: number } {
  if (perPage === 4) return { cols: 2, rows: 2 };
  if (perPage === 2) return { cols: 1, rows: 2 };
  return { cols: 1, rows: 1 };
}

/** The box of the block at `indexInPage` within a `perPage`-packed content box. */
function blockBox(perPage: number, indexInPage: number): Box {
  const { cols, rows } = blockGridShape(perPage);
  const width = (CONTENT_BOX.width - (cols - 1) * BLOCK_GUTTER_MM) / cols;
  const height = (CONTENT_BOX.height - (rows - 1) * BLOCK_GUTTER_MM) / rows;
  const col = indexInPage % cols;
  const row = Math.floor(indexInPage / cols);
  return {
    x: CONTENT_BOX.x + col * (width + BLOCK_GUTTER_MM),
    y: CONTENT_BOX.y + row * (height + BLOCK_GUTTER_MM),
    width,
    height,
  };
}

/**
 * Resolves one block box into a {@link BlockLayout} for a `size`×`size` grid:
 * reserves the header and word-list strips plus a {@link HEADER_GAP_MM} /
 * {@link WORDLIST_GAP_MM} gap on either side of the grid, fits the largest square
 * grid into the remaining region, and centres it. The gaps guarantee visible
 * breathing room between the header/word-list and the grid (#54); the cell pitch
 * fills the square exactly, so the grid never overflows the block (nor the
 * content box).
 */
export function blockLayout(size: number, box: Box): BlockLayout {
  assertGridSize(size);
  const regionTop = box.y + BLOCK_HEADER_MM + HEADER_GAP_MM;
  const regionHeight =
    box.height - BLOCK_HEADER_MM - BLOCK_WORDLIST_MM - HEADER_GAP_MM - WORDLIST_GAP_MM;
  const side = Math.min(box.width, regionHeight);
  const cellPitch = side / size;
  const header: Box = { x: box.x, y: box.y, width: box.width, height: BLOCK_HEADER_MM };
  const grid: Box = {
    x: box.x + (box.width - side) / 2,
    y: regionTop + (regionHeight - side) / 2,
    width: side,
    height: side,
  };
  const wordList: Box = {
    x: box.x,
    y: box.y + box.height - BLOCK_WORDLIST_MM,
    width: box.width,
    height: BLOCK_WORDLIST_MM,
  };
  return { box, header, grid, wordList, cellPitch };
}

/** The layout of a single page holding `blockCount` blocks of a `size` grid. */
function pageLayout(size: number, pageIndex: number, perPage: number, blockCount: number): PageLayout {
  const blocks: BlockLayout[] = [];
  for (let i = 0; i < blockCount; i += 1) {
    blocks.push(blockLayout(size, blockBox(perPage, i)));
  }
  return { pageIndex, blocks };
}

/**
 * Paginates `copies` copies of one `size`×`size` puzzle across A4 pages, packing
 * per {@link puzzlesPerPage}. Deterministic in `(size, copies)`. The last page
 * is partial when `copies` is not a multiple of the per-page count — it carries
 * the remaining blocks in their normal slots, with no clipping.
 */
export function paginate(size: number, copies: number): PaginationResult {
  assertGridSize(size);
  if (!Number.isInteger(copies) || copies < 1) {
    throw new RangeError(`copies must be a positive integer, got ${copies}`);
  }
  const perPage = puzzlesPerPage(size);
  const pageCount = Math.ceil(copies / perPage);
  const pages: PageLayout[] = [];
  let remaining = copies;
  for (let p = 0; p < pageCount; p += 1) {
    const blockCount = Math.min(perPage, remaining);
    pages.push(pageLayout(size, p, perPage, blockCount));
    remaining -= blockCount;
  }
  return { puzzlesPerPage: perPage, pageCount, pages };
}
