/**
 * palettd - Generate beautiful brand palette images from colors
 *
 * @packageDocumentation
 */

// Re-export types
export type {
  RGBA,
  HSLA,
  OKLab,
  OKLCH,
  NormalizedColor,
  PaletteColor,
  SwatchLayout,
  Layout,
  NamingStrategy,
  OrderStrategy,
  OutputFormat,
  BoardOptions,
  BoardResult,
  InputFile,
  MetadataOutput,
} from './types.js';

// Re-export color utilities
export {
  parseColor,
  parseHex,
  parseRgb,
  parseHsl,
  rgbaToHex,
  normalizeColor,
  rgbaToHsla,
  rgbaToOklab,
  oklabToRgba,
  oklabToOklch,
  oklchToOklab,
  colorDistance,
  nameColor,
  nameColors,
  getRelativeLuminance,
  getContrastRatio,
  computeTextColor,
  meetsWcagAA,
  meetsWcagAAA,
} from './color/index.js';

// Re-export layout utilities
export { generateLayout, DEFAULT_OPTIONS, packColors } from './layout/index.js';

// Re-export render utilities
export { renderSvg, renderPng, getPngDimensions, type PngRenderOptions } from './render/index.js';

// Import for generateBoard
import type { BoardOptions, BoardResult, NormalizedColor } from './types.js';
import { normalizeColor } from './color/index.js';
import { packColors, DEFAULT_OPTIONS } from './layout/index.js';
import { renderSvg } from './render/svg.js';
import { renderPng } from './render/png.js';

/**
 * Generate a complete palette board from a list of color strings
 *
 * This is the main entry point for generating palette images.
 *
 * @param colors - Array of color strings (hex, rgb, hsl)
 * @param options - Board generation options
 * @returns Board result with SVG, optional PNG, layout, and palette data
 *
 * @example
 * ```ts
 * import { generateBoard } from 'palettd';
 *
 * const result = generateBoard(
 *   ['#FAF5E9', '#392525', '#683226', '#B25D3E'],
 *   { format: 'png' }
 * );
 *
 * // Write PNG to file
 * fs.writeFileSync('palette.png', result.png);
 * ```
 */
export function generateBoard(
  colors: string[],
  options: Partial<BoardOptions> = {}
): BoardResult {
  // Normalize all colors
  const normalizedColors: NormalizedColor[] = colors.map((c) => normalizeColor(c));

  // Pack colors into palette with layout
  const { palette, layout } = packColors(normalizedColors, options);

  // Merge with defaults
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Render SVG
  const svg = renderSvg(palette, layout, opts);

  // Optionally render PNG
  let png: Buffer | undefined;
  if (opts.format === 'png') {
    png = renderPng(svg);
  }

  return {
    svg,
    png,
    layout,
    palette,
  };
}

/**
 * Generate only the SVG string from colors
 *
 * @param colors - Array of color strings
 * @param options - Board options
 * @returns SVG string
 */
export function generateSvg(
  colors: string[],
  options: Partial<BoardOptions> = {}
): string {
  const result = generateBoard(colors, { ...options, format: 'svg' });
  return result.svg;
}

/**
 * Generate only the PNG buffer from colors
 *
 * @param colors - Array of color strings
 * @param options - Board options
 * @returns PNG buffer
 */
export function generatePng(
  colors: string[],
  options: Partial<BoardOptions> = {}
): Buffer {
  const result = generateBoard(colors, { ...options, format: 'png' });
  return result.png!;
}
