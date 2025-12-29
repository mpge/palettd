import type { NormalizedColor, PaletteColor, Layout, BoardOptions, OrderStrategy } from '../types.js';
import { computeTextColor } from '../color/contrast.js';
import { nameColors } from '../color/name.js';
import { generateLayout, DEFAULT_OPTIONS } from './templates.js';

/**
 * Sort colors by OKLCH hue then lightness
 */
function sortByLch(colors: NormalizedColor[]): NormalizedColor[] {
  return [...colors].sort((a, b) => {
    // First sort by hue
    const hueDiff = a.oklch.h - b.oklch.h;
    if (Math.abs(hueDiff) > 10) {
      return hueDiff;
    }
    // Then by lightness
    return b.oklch.L - a.oklch.L;
  });
}

/**
 * Order colors according to strategy
 */
function orderColors(
  colors: NormalizedColor[],
  strategy: OrderStrategy
): NormalizedColor[] {
  if (strategy === 'lch') {
    return sortByLch(colors);
  }
  return colors;
}

/**
 * Pack colors into a complete palette with names and text colors
 */
export function packColors(
  colors: NormalizedColor[],
  options: Partial<BoardOptions> = {}
): { palette: PaletteColor[]; layout: Layout } {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Order colors
  const orderedColors = orderColors(colors, opts.order);

  // Generate names
  const names = nameColors(orderedColors, opts.names, opts.providedNames);

  // Create palette with computed text colors
  const palette: PaletteColor[] = orderedColors.map((color, index) => ({
    ...color,
    name: names[index],
    textColor: computeTextColor(color.hex),
    index,
  }));

  // Generate layout
  const layout = generateLayout(palette.length, opts);

  return { palette, layout };
}
