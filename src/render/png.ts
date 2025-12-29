import { Resvg } from '@resvg/resvg-js';

/**
 * Options for PNG rendering
 */
export interface PngRenderOptions {
  /** Width of output PNG (defaults to SVG width) */
  width?: number;
  /** Height of output PNG (defaults to SVG height) */
  height?: number;
  /** Background color (defaults to transparent) */
  background?: string;
  /** DPI scaling factor (1 = 72dpi, 2 = 144dpi, etc.) */
  dpi?: number;
}

/**
 * Default font configuration for resvg
 * Uses system fonts that are commonly available
 */
const DEFAULT_FONT_CONFIG = {
  loadSystemFonts: true,
  defaultFontFamily: 'Arial',
};

/**
 * Render SVG string to PNG buffer
 */
export function renderPng(
  svg: string,
  options: PngRenderOptions = {}
): Buffer {
  const { dpi = 1, background } = options;

  // Create resvg instance with font configuration
  const resvg = new Resvg(svg, {
    font: DEFAULT_FONT_CONFIG,
    fitTo: dpi !== 1
      ? { mode: 'zoom' as const, value: dpi }
      : undefined,
    background,
  });

  // Render to PNG
  const pngData = resvg.render();
  return Buffer.from(pngData.asPng());
}

/**
 * Get PNG dimensions from SVG
 */
export function getPngDimensions(
  svg: string,
  options: PngRenderOptions = {}
): { width: number; height: number } {
  const { dpi = 1 } = options;

  const resvg = new Resvg(svg, {
    font: DEFAULT_FONT_CONFIG,
    fitTo: dpi !== 1
      ? { mode: 'zoom' as const, value: dpi }
      : undefined,
  });

  const { width, height } = resvg;
  return { width, height };
}
