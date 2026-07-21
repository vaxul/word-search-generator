import { describe, expect, it } from 'vitest';

import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  BLOCK_GUTTER_MM,
  BLOCK_HEADER_MM,
  BLOCK_WORDLIST_MM,
  CONTENT_BOX,
  MIN_LEGIBLE_CELL_PITCH_MM,
  PAGE_MARGIN_MM,
  blockLayout,
  paginate,
  puzzlesPerPage,
  type Box,
} from './layout';

// A box is inside the content box iff none of its four edges cross the margins.
function isWithin(inner: Box, outer: Box): boolean {
  return (
    inner.x >= outer.x - 1e-9 &&
    inner.y >= outer.y - 1e-9 &&
    inner.x + inner.width <= outer.x + outer.width + 1e-9 &&
    inner.y + inner.height <= outer.y + outer.height + 1e-9
  );
}

describe('content box', () => {
  it('insets the A4 page by the margin on all sides (≈180×267 mm)', () => {
    expect(CONTENT_BOX).toEqual({
      x: PAGE_MARGIN_MM,
      y: PAGE_MARGIN_MM,
      width: A4_WIDTH_MM - 2 * PAGE_MARGIN_MM,
      height: A4_HEIGHT_MM - 2 * PAGE_MARGIN_MM,
    });
    expect(CONTENT_BOX.width).toBe(180);
    expect(CONTENT_BOX.height).toBe(267);
  });
});

describe('puzzlesPerPage', () => {
  it('maps grid size to the gate-resolved packing tiers', () => {
    // ≤10 → 4-up (incl. boundary 10), 11–17 → 2-up (boundaries 11 & 17),
    // ≥18 → 1-up (boundary 18).
    expect(puzzlesPerPage(8)).toBe(4);
    expect(puzzlesPerPage(10)).toBe(4);
    expect(puzzlesPerPage(11)).toBe(2);
    expect(puzzlesPerPage(15)).toBe(2);
    expect(puzzlesPerPage(17)).toBe(2);
    expect(puzzlesPerPage(18)).toBe(1);
    expect(puzzlesPerPage(30)).toBe(1);
  });

  it('rejects a non-positive or non-integer size', () => {
    expect(() => puzzlesPerPage(0)).toThrow(RangeError);
    expect(() => puzzlesPerPage(-4)).toThrow(RangeError);
    expect(() => puzzlesPerPage(12.5)).toThrow(RangeError);
  });
});

describe('paginate — packing, origins and page count per tier', () => {
  it('4-up (size ≤10) lays out a full page as a 2×2 grid of blocks', () => {
    const { puzzlesPerPage: per, pageCount, pages } = paginate(10, 4);
    expect(per).toBe(4);
    expect(pageCount).toBe(1);
    const boxes = pages[0].blocks.map((b) => b.box);
    expect(boxes).toHaveLength(4);
    // Two distinct columns, two distinct rows.
    expect(new Set(boxes.map((b) => b.x)).size).toBe(2);
    expect(new Set(boxes.map((b) => b.y)).size).toBe(2);
    // Block width/height sum + one gutter equals the content box extents.
    expect(boxes[0].width * 2 + BLOCK_GUTTER_MM).toBeCloseTo(CONTENT_BOX.width);
    expect(boxes[0].height * 2 + BLOCK_GUTTER_MM).toBeCloseTo(CONTENT_BOX.height);
  });

  it('2-up (11–17) stacks a single column of two blocks', () => {
    const { pages } = paginate(15, 2);
    const boxes = pages[0].blocks.map((b) => b.box);
    expect(boxes).toHaveLength(2);
    expect(new Set(boxes.map((b) => b.x)).size).toBe(1); // one column
    expect(new Set(boxes.map((b) => b.y)).size).toBe(2); // two rows
    expect(boxes[0].width).toBeCloseTo(CONTENT_BOX.width);
    expect(boxes[0].height * 2 + BLOCK_GUTTER_MM).toBeCloseTo(CONTENT_BOX.height);
  });

  it('1-up (≥18) fills the whole content box with one block', () => {
    const { pages } = paginate(30, 1);
    expect(pages[0].blocks).toHaveLength(1);
    expect(pages[0].blocks[0].box).toEqual(CONTENT_BOX);
  });

  it('spreads copies across pages and numbers them sequentially', () => {
    const { pageCount, pages } = paginate(10, 9); // 4-up → ceil(9/4)=3 pages
    expect(pageCount).toBe(3);
    expect(pages.map((p) => p.pageIndex)).toEqual([0, 1, 2]);
    expect(pages.map((p) => p.blocks.length)).toEqual([4, 4, 1]);
  });

  it('rejects a non-positive or non-integer copy count', () => {
    expect(() => paginate(10, 0)).toThrow(RangeError);
    expect(() => paginate(10, 2.5)).toThrow(RangeError);
  });
});

describe('paginate — partial last page', () => {
  it('3 copies at 4-up → one page carrying exactly 3 blocks, none clipped', () => {
    const { pageCount, pages } = paginate(8, 3);
    expect(pageCount).toBe(1);
    expect(pages[0].blocks).toHaveLength(3);
    for (const block of pages[0].blocks) {
      expect(isWithin(block.box, CONTENT_BOX)).toBe(true);
    }
  });

  it('places the partial-page blocks in the first slots (top-left first)', () => {
    const full = paginate(8, 4).pages[0].blocks.map((b) => b.box);
    const partial = paginate(8, 3).pages[0].blocks.map((b) => b.box);
    // The 3 blocks occupy the first three of the four full-page slots.
    expect(partial).toEqual(full.slice(0, 3));
  });
});

describe('cell pitch fits the block without overflowing the content box', () => {
  const sizes = [5, 8, 10, 11, 15, 17, 18, 24, 30];

  it('keeps every grid square inside its block and inside the content box', () => {
    for (const size of sizes) {
      const block = paginate(size, 1).pages[0].blocks[0];
      // The grid square exactly equals pitch × size (fills, never overflows).
      expect(block.grid.width).toBeCloseTo(block.cellPitch * size);
      expect(block.grid.height).toBeCloseTo(block.cellPitch * size);
      // Grid sits between header and word-list strips within the block.
      const innerH = block.box.height - BLOCK_HEADER_MM - BLOCK_WORDLIST_MM;
      expect(block.grid.width).toBeLessThanOrEqual(block.box.width + 1e-9);
      expect(block.grid.height).toBeLessThanOrEqual(innerH + 1e-9);
      expect(isWithin(block.grid, CONTENT_BOX)).toBe(true);
      expect(isWithin(block.header, CONTENT_BOX)).toBe(true);
      expect(isWithin(block.wordList, CONTENT_BOX)).toBe(true);
    }
  });

  it('yields a legible pitch (≥ floor) for every size in its assigned tier', () => {
    for (const size of sizes) {
      const block = paginate(size, 1).pages[0].blocks[0];
      expect(block.cellPitch).toBeGreaterThanOrEqual(MIN_LEGIBLE_CELL_PITCH_MM);
    }
  });

  it('is deterministic — identical inputs give identical geometry', () => {
    expect(paginate(17, 5)).toEqual(paginate(17, 5));
    expect(blockLayout(12, CONTENT_BOX)).toEqual(blockLayout(12, CONTENT_BOX));
  });
});
