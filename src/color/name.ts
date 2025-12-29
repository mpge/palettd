import type { NormalizedColor, NamingStrategy } from '../types.js';
import { normalizeColor, colorDistance } from './convert.js';
import { COLOR_NAMES, HUE_FAMILIES, LIGHTNESS_MODIFIERS, CHROMA_MODIFIERS } from '../data/colors.js';

/**
 * Pre-computed color entries with OKLab values for fast matching
 */
interface ColorEntry {
  hex: string;
  name: string;
  color: NormalizedColor;
}

let colorCache: ColorEntry[] | null = null;

/**
 * Initialize the color cache (lazy loading)
 */
function getColorCache(): ColorEntry[] {
  if (colorCache === null) {
    colorCache = COLOR_NAMES.map(([hex, name]) => ({
      hex,
      name,
      color: normalizeColor(hex),
    }));
  }
  return colorCache;
}

/**
 * Find the nearest named color using OKLab perceptual distance
 */
function findNearestColor(color: NormalizedColor): { name: string; distance: number } {
  const cache = getColorCache();
  let nearest = { name: 'Unknown', distance: Infinity };

  for (const entry of cache) {
    const dist = colorDistance(color.oklab, entry.color.oklab);
    if (dist < nearest.distance) {
      nearest = { name: entry.name, distance: dist };
    }
  }

  return nearest;
}

/**
 * Get hue family name from OKLCH hue
 */
function getHueFamily(hue: number): string {
  // Handle achromatic colors
  for (const [family, [start, end]] of Object.entries(HUE_FAMILIES)) {
    if (hue >= start && hue < end) {
      return family.replace('2', '');
    }
  }
  return 'Red'; // Default for hue 360
}

/**
 * Get lightness modifier from OKLab L value
 */
function getLightnessModifier(L: number): string {
  for (const [min, max, modifier] of LIGHTNESS_MODIFIERS) {
    if (L >= min && L < max) {
      return modifier;
    }
  }
  return '';
}

/**
 * Get chroma modifier from OKLCH C value
 */
function getChromaModifier(C: number): string {
  for (const [min, max, modifier] of CHROMA_MODIFIERS) {
    if (C >= min && C < max) {
      return modifier;
    }
  }
  return '';
}

/**
 * Generate a fallback color name based on OKLCH values
 * Used when no close match is found in the dataset
 */
function generateFallbackName(color: NormalizedColor): string {
  const { L, C, h } = color.oklch;

  // Handle achromatic colors (very low chroma)
  if (C < 0.02) {
    if (L < 0.15) return 'Black';
    if (L > 0.95) return 'White';
    const lMod = getLightnessModifier(L);
    return lMod ? `${lMod} Gray` : 'Gray';
  }

  const hueFamily = getHueFamily(h);
  const lightMod = getLightnessModifier(L);
  const chromaMod = getChromaModifier(C);

  // Build the name from modifiers
  const parts: string[] = [];

  // Add lightness modifier if not neutral
  if (lightMod) {
    parts.push(lightMod);
  }

  // Add chroma modifier if not neutral
  if (chromaMod && chromaMod !== 'Gray') {
    parts.push(chromaMod);
  }

  // Add hue family
  parts.push(hueFamily);

  return parts.join(' ');
}

/**
 * Distance threshold for using dataset names
 * Above this, we use the generated fallback name
 */
const MATCH_THRESHOLD = 0.15;

/**
 * Name a color using the specified strategy
 */
export function nameColor(
  color: NormalizedColor,
  strategy: NamingStrategy = 'auto',
  providedNames?: Record<string, string>
): string {
  // Handle 'none' strategy
  if (strategy === 'none') {
    return '';
  }

  // Handle 'provided' strategy
  if (strategy === 'provided' && providedNames) {
    const normalized = color.hex.toUpperCase();
    // Check for exact match first
    if (providedNames[normalized]) {
      return providedNames[normalized];
    }
    // Case-insensitive fallback
    for (const [key, value] of Object.entries(providedNames)) {
      if (key.toUpperCase() === normalized) {
        return value;
      }
    }
    // Fallback to auto if no provided name
  }

  // Auto strategy: find nearest match or generate
  const nearest = findNearestColor(color);

  // If close enough, use the dataset name
  if (nearest.distance < MATCH_THRESHOLD) {
    return nearest.name;
  }

  // Generate a descriptive name based on color properties
  return generateFallbackName(color);
}

/**
 * Batch name multiple colors, ensuring uniqueness when possible
 */
export function nameColors(
  colors: NormalizedColor[],
  strategy: NamingStrategy = 'auto',
  providedNames?: Record<string, string>
): string[] {
  const names = colors.map((c) => nameColor(c, strategy, providedNames));

  // Track name occurrences for uniqueness
  const nameCounts = new Map<string, number>();
  const result: string[] = [];

  for (let i = 0; i < names.length; i++) {
    const baseName = names[i];

    if (!baseName) {
      result.push('');
      continue;
    }

    const count = nameCounts.get(baseName) || 0;
    nameCounts.set(baseName, count + 1);

    if (count === 0) {
      result.push(baseName);
    } else {
      // Append a number for duplicates
      result.push(`${baseName} ${count + 1}`);
    }
  }

  return result;
}
