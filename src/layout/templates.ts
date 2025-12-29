import type { SwatchLayout, Layout, BoardOptions } from '../types.js';

/**
 * Template definition for swatch positions
 * Values are relative (0-1) to the available content area
 */
interface TemplateCell {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Template definitions for different color counts
 * Each template defines relative positions and sizes for swatches
 */
const TEMPLATES: Record<number, TemplateCell[]> = {
  // 2 colors: large left, large right
  2: [
    { x: 0, y: 0, w: 0.48, h: 1 },
    { x: 0.52, y: 0, w: 0.48, h: 1 },
  ],

  // 3 colors: large left, two stacked right
  3: [
    { x: 0, y: 0, w: 0.55, h: 1 },
    { x: 0.58, y: 0, w: 0.42, h: 0.48 },
    { x: 0.58, y: 0.52, w: 0.42, h: 0.48 },
  ],

  // 4 colors: 2x2 grid
  4: [
    { x: 0, y: 0, w: 0.48, h: 0.48 },
    { x: 0.52, y: 0, w: 0.48, h: 0.48 },
    { x: 0, y: 0.52, w: 0.48, h: 0.48 },
    { x: 0.52, y: 0.52, w: 0.48, h: 0.48 },
  ],

  // 5 colors: large left, 2x2 grid right
  5: [
    { x: 0, y: 0, w: 0.45, h: 1 },
    { x: 0.48, y: 0, w: 0.25, h: 0.48 },
    { x: 0.75, y: 0, w: 0.25, h: 0.48 },
    { x: 0.48, y: 0.52, w: 0.25, h: 0.48 },
    { x: 0.75, y: 0.52, w: 0.25, h: 0.48 },
  ],

  // 6 colors: 3x2 grid
  6: [
    { x: 0, y: 0, w: 0.32, h: 0.48 },
    { x: 0.34, y: 0, w: 0.32, h: 0.48 },
    { x: 0.68, y: 0, w: 0.32, h: 0.48 },
    { x: 0, y: 0.52, w: 0.32, h: 0.48 },
    { x: 0.34, y: 0.52, w: 0.32, h: 0.48 },
    { x: 0.68, y: 0.52, w: 0.32, h: 0.48 },
  ],

  // 7 colors: large left top, medium left bottom, 5 stacked right
  7: [
    { x: 0, y: 0, w: 0.45, h: 0.55 },
    { x: 0, y: 0.58, w: 0.45, h: 0.42 },
    { x: 0.48, y: 0, w: 0.52, h: 0.18 },
    { x: 0.48, y: 0.205, w: 0.52, h: 0.18 },
    { x: 0.48, y: 0.41, w: 0.52, h: 0.18 },
    { x: 0.48, y: 0.615, w: 0.52, h: 0.18 },
    { x: 0.48, y: 0.82, w: 0.52, h: 0.18 },
  ],

  // 8 colors: brand board style - large left, tall middle, stacked right
  8: [
    { x: 0, y: 0, w: 0.35, h: 0.65 },
    { x: 0, y: 0.68, w: 0.35, h: 0.32 },
    { x: 0.38, y: 0, w: 0.25, h: 0.48 },
    { x: 0.38, y: 0.52, w: 0.25, h: 0.48 },
    { x: 0.66, y: 0, w: 0.34, h: 0.32 },
    { x: 0.66, y: 0.35, w: 0.34, h: 0.32 },
    { x: 0.66, y: 0.68, w: 0.16, h: 0.32 },
    { x: 0.84, y: 0.68, w: 0.16, h: 0.32 },
  ],

  // 9 colors: full brand board - large left, tall middle-left, medium middle, stacked right
  9: [
    { x: 0, y: 0, w: 0.3, h: 0.55 },
    { x: 0, y: 0.58, w: 0.3, h: 0.42 },
    { x: 0.33, y: 0, w: 0.22, h: 1 },
    { x: 0.58, y: 0, w: 0.2, h: 0.48 },
    { x: 0.58, y: 0.52, w: 0.2, h: 0.48 },
    { x: 0.81, y: 0, w: 0.19, h: 0.24 },
    { x: 0.81, y: 0.27, w: 0.19, h: 0.24 },
    { x: 0.81, y: 0.52, w: 0.19, h: 0.24 },
    { x: 0.81, y: 0.76, w: 0.19, h: 0.24 },
  ],

  // 10 colors: extended brand board
  10: [
    { x: 0, y: 0, w: 0.28, h: 0.48 },
    { x: 0, y: 0.52, w: 0.28, h: 0.48 },
    { x: 0.31, y: 0, w: 0.2, h: 1 },
    { x: 0.54, y: 0, w: 0.2, h: 0.48 },
    { x: 0.54, y: 0.52, w: 0.2, h: 0.48 },
    { x: 0.77, y: 0, w: 0.23, h: 0.24 },
    { x: 0.77, y: 0.27, w: 0.23, h: 0.22 },
    { x: 0.77, y: 0.52, w: 0.11, h: 0.48 },
    { x: 0.89, y: 0.52, w: 0.11, h: 0.24 },
    { x: 0.89, y: 0.76, w: 0.11, h: 0.24 },
  ],
};

/**
 * Get the template for a given color count
 * For counts outside 2-10, adapt the closest template
 */
function getTemplate(count: number): TemplateCell[] {
  // Handle edge cases
  if (count <= 1) {
    return [{ x: 0, y: 0, w: 1, h: 1 }];
  }

  // Use exact template if available
  if (TEMPLATES[count]) {
    return TEMPLATES[count];
  }

  // For counts > 10, use grid layout
  if (count > 10) {
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const cellW = 1 / cols;
    const cellH = 1 / rows;
    const gap = 0.02;

    const cells: TemplateCell[] = [];
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      cells.push({
        x: col * cellW + gap / 2,
        y: row * cellH + gap / 2,
        w: cellW - gap,
        h: cellH - gap,
      });
    }
    return cells;
  }

  // Should never reach here, but fallback to grid
  return TEMPLATES[Math.min(Math.max(count, 2), 10)];
}

/**
 * Default board options
 */
export const DEFAULT_OPTIONS: Required<
  Omit<BoardOptions, 'title' | 'providedNames' | 'format'>
> & { format: 'svg' } = {
  format: 'svg',
  width: 640,
  height: 480,
  outerBg: '#FFFFFF',
  cardBg: '#FAFAFA',
  cardRadius: 12,
  padding: 28,
  gap: 10,
  stroke: '#E5E5E5',
  strokeOpacity: 0.6,
  font: 'Inter, "SF Pro Display", system-ui, -apple-system, sans-serif',
  footerLeft: 'PALETTE',
  footerCenter: '',
  footerRight: 'palettd',
  showHex: true,
  showName: true,
  names: 'auto',
  order: 'input',
};

/**
 * Compute font sizes based on swatch dimensions
 */
function computeFontSizes(
  width: number,
  height: number
): { nameFontSize: number; hexFontSize: number } {
  const minDim = Math.min(width, height);
  const nameFontSize = Math.max(10, Math.min(18, minDim * 0.12));
  const hexFontSize = Math.max(8, Math.min(12, minDim * 0.08));
  return { nameFontSize, hexFontSize };
}

/**
 * Generate layout from template cells
 */
export function generateLayout(
  colorCount: number,
  options: Partial<BoardOptions> = {}
): Layout {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const template = getTemplate(colorCount);

  // Calculate card dimensions with outer padding
  const outerPadding = opts.padding;
  const cardX = outerPadding;
  const cardY = outerPadding;
  const cardWidth = opts.width - outerPadding * 2;
  const cardHeight = opts.height - outerPadding * 2;

  // Footer takes up bottom portion of the card
  const footerHeight = 28;
  const contentPadding = opts.padding * 0.6;

  // Title takes up top portion if present
  const titleHeight = opts.title ? 32 : 0;

  // Content area within the card (excluding padding, title, and footer)
  const contentX = contentPadding;
  const contentY = contentPadding + titleHeight;
  const contentWidth = cardWidth - contentPadding * 2;
  const contentHeight = cardHeight - contentPadding * 2 - footerHeight - titleHeight;

  // Convert template cells to absolute positions
  const swatches: SwatchLayout[] = template.slice(0, colorCount).map((cell) => {
    const x = contentX + cell.x * contentWidth;
    const y = contentY + cell.y * contentHeight;
    const width = cell.w * contentWidth - opts.gap / 2;
    const height = cell.h * contentHeight - opts.gap / 2;

    const { nameFontSize, hexFontSize } = computeFontSizes(width, height);

    return {
      x,
      y,
      width,
      height,
      radius: Math.min(12, Math.min(width, height) * 0.08),
      nameFontSize,
      hexFontSize,
    };
  });

  return {
    card: {
      x: cardX,
      y: cardY,
      width: cardWidth,
      height: cardHeight,
      radius: opts.cardRadius,
    },
    swatches,
    footer: {
      y: cardHeight - footerHeight,
      height: footerHeight,
    },
  };
}
