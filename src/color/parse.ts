import type { RGBA } from '../types.js';

/**
 * Parse a hex color string to RGBA
 * Supports: #RGB, #RGBA, #RRGGBB, #RRGGBBAA
 */
export function parseHex(hex: string): RGBA | null {
  const cleaned = hex.replace(/^#/, '');

  let r: number, g: number, b: number, a: number;

  switch (cleaned.length) {
    case 3: // #RGB
      r = parseInt(cleaned[0] + cleaned[0], 16);
      g = parseInt(cleaned[1] + cleaned[1], 16);
      b = parseInt(cleaned[2] + cleaned[2], 16);
      a = 1;
      break;
    case 4: // #RGBA
      r = parseInt(cleaned[0] + cleaned[0], 16);
      g = parseInt(cleaned[1] + cleaned[1], 16);
      b = parseInt(cleaned[2] + cleaned[2], 16);
      a = parseInt(cleaned[3] + cleaned[3], 16) / 255;
      break;
    case 6: // #RRGGBB
      r = parseInt(cleaned.slice(0, 2), 16);
      g = parseInt(cleaned.slice(2, 4), 16);
      b = parseInt(cleaned.slice(4, 6), 16);
      a = 1;
      break;
    case 8: // #RRGGBBAA
      r = parseInt(cleaned.slice(0, 2), 16);
      g = parseInt(cleaned.slice(2, 4), 16);
      b = parseInt(cleaned.slice(4, 6), 16);
      a = parseInt(cleaned.slice(6, 8), 16) / 255;
      break;
    default:
      return null;
  }

  if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
    return null;
  }

  return { r, g, b, a };
}

/**
 * Parse an rgb() or rgba() color string to RGBA
 * Supports: rgb(r, g, b), rgba(r, g, b, a), rgb(r g b), rgb(r g b / a)
 */
export function parseRgb(str: string): RGBA | null {
  // Match both comma-separated and space-separated formats
  const match = str.match(
    /^rgba?\(\s*(\d{1,3}(?:\.\d+)?%?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?%?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?%?)\s*(?:[,/]\s*(\d*\.?\d+%?))?\s*\)$/i
  );

  if (!match) {
    return null;
  }

  const parseComponent = (val: string, max: number = 255): number => {
    if (val.endsWith('%')) {
      return (parseFloat(val) / 100) * max;
    }
    return parseFloat(val);
  };

  const r = Math.min(255, Math.max(0, Math.round(parseComponent(match[1]))));
  const g = Math.min(255, Math.max(0, Math.round(parseComponent(match[2]))));
  const b = Math.min(255, Math.max(0, Math.round(parseComponent(match[3]))));

  let a = 1;
  if (match[4] !== undefined) {
    if (match[4].endsWith('%')) {
      a = parseFloat(match[4]) / 100;
    } else {
      a = parseFloat(match[4]);
    }
    a = Math.min(1, Math.max(0, a));
  }

  if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
    return null;
  }

  return { r, g, b, a };
}

/**
 * Parse an hsl() or hsla() color string to RGBA
 * Supports: hsl(h, s%, l%), hsla(h, s%, l%, a), hsl(h s% l%), hsl(h s% l% / a)
 */
export function parseHsl(str: string): RGBA | null {
  const match = str.match(
    /^hsla?\(\s*(\d{1,3}(?:\.\d+)?(?:deg|rad|turn)?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?%?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?%?)\s*(?:[,/]\s*(\d*\.?\d+%?))?\s*\)$/i
  );

  if (!match) {
    return null;
  }

  // Parse hue
  let h = parseFloat(match[1]);
  if (match[1].endsWith('rad')) {
    h = (h * 180) / Math.PI;
  } else if (match[1].endsWith('turn')) {
    h = h * 360;
  }
  h = ((h % 360) + 360) % 360;

  // Parse saturation and lightness (expect percentages)
  const parsePercent = (val: string): number => {
    const num = parseFloat(val);
    return Math.min(100, Math.max(0, num));
  };

  const s = parsePercent(match[2]) / 100;
  const l = parsePercent(match[3]) / 100;

  // Parse alpha
  let a = 1;
  if (match[4] !== undefined) {
    if (match[4].endsWith('%')) {
      a = parseFloat(match[4]) / 100;
    } else {
      a = parseFloat(match[4]);
    }
    a = Math.min(1, Math.max(0, a));
  }

  // Convert HSL to RGB
  const hueToRgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h / 360 + 1 / 3);
    g = hueToRgb(p, q, h / 360);
    b = hueToRgb(p, q, h / 360 - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a,
  };
}

/**
 * Parse any supported color string to RGBA
 */
export function parseColor(input: string): RGBA | null {
  const trimmed = input.trim();

  // Try hex first
  if (trimmed.startsWith('#')) {
    return parseHex(trimmed);
  }

  // Try rgb/rgba
  if (trimmed.toLowerCase().startsWith('rgb')) {
    return parseRgb(trimmed);
  }

  // Try hsl/hsla
  if (trimmed.toLowerCase().startsWith('hsl')) {
    return parseHsl(trimmed);
  }

  // Try as hex without #
  if (/^[0-9a-f]{3,8}$/i.test(trimmed)) {
    return parseHex('#' + trimmed);
  }

  return null;
}

/**
 * Convert RGBA to normalized hex string (#RRGGBB or #RRGGBBAA)
 */
export function rgbaToHex(rgba: RGBA): string {
  const toHex = (n: number): string => Math.round(n).toString(16).padStart(2, '0').toUpperCase();

  const hex = `#${toHex(rgba.r)}${toHex(rgba.g)}${toHex(rgba.b)}`;

  if (rgba.a < 1) {
    return `${hex}${toHex(rgba.a * 255)}`;
  }

  return hex;
}
