import type { RGBA } from '../types.js';
import { parseColor } from './parse.js';

/**
 * Convert sRGB channel to relative luminance component
 */
function srgbToLuminanceChannel(c: number): number {
  const srgb = c / 255;
  return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 definition
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function getRelativeLuminance(rgba: RGBA): number {
  const r = srgbToLuminanceChannel(rgba.r);
  const g = srgbToLuminanceChannel(rgba.g);
  const b = srgbToLuminanceChannel(rgba.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Based on WCAG 2.1 definition
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1: RGBA, color2: RGBA): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Dark text color for light backgrounds
 */
const DARK_TEXT = '#111111';

/**
 * Light text color for dark backgrounds
 */
const LIGHT_TEXT = '#FFFFFF';

/**
 * Parse helper for cached colors
 */
const darkTextRgba: RGBA = { r: 17, g: 17, b: 17, a: 1 };
const lightTextRgba: RGBA = { r: 255, g: 255, b: 255, a: 1 };

/**
 * Compute the best text color for readability on a given background
 * Returns either dark (#111111) or light (#FFFFFF) text color
 * based on WCAG contrast ratio guidelines
 */
export function computeTextColor(bgHex: string): string {
  const bg = parseColor(bgHex);
  if (!bg) {
    // Default to dark text if parsing fails
    return DARK_TEXT;
  }

  const darkContrast = getContrastRatio(bg, darkTextRgba);
  const lightContrast = getContrastRatio(bg, lightTextRgba);

  // Choose the color with better contrast
  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  // We prefer the higher contrast option
  return lightContrast > darkContrast ? LIGHT_TEXT : DARK_TEXT;
}

/**
 * Check if a contrast ratio meets WCAG AA requirements
 * @param ratio - The contrast ratio to check
 * @param largeText - Whether this is for large text (>= 18pt or >= 14pt bold)
 */
export function meetsWcagAA(ratio: number, largeText: boolean = false): boolean {
  return ratio >= (largeText ? 3 : 4.5);
}

/**
 * Check if a contrast ratio meets WCAG AAA requirements
 * @param ratio - The contrast ratio to check
 * @param largeText - Whether this is for large text (>= 18pt or >= 14pt bold)
 */
export function meetsWcagAAA(ratio: number, largeText: boolean = false): boolean {
  return ratio >= (largeText ? 4.5 : 7);
}
