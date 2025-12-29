import type { RGBA, HSLA, OKLab, OKLCH, NormalizedColor } from '../types.js';
import { parseColor, rgbaToHex } from './parse.js';

/**
 * Convert RGBA to HSLA
 */
export function rgbaToHsla(rgba: RGBA): HSLA {
  const r = rgba.r / 255;
  const g = rgba.g / 255;
  const b = rgba.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: rgba.a,
  };
}

/**
 * Convert sRGB to linear RGB
 */
function srgbToLinear(c: number): number {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/**
 * Convert linear RGB to sRGB
 */
function linearToSrgb(c: number): number {
  const clamped = Math.max(0, Math.min(1, c));
  return clamped <= 0.0031308
    ? Math.round(clamped * 12.92 * 255)
    : Math.round((1.055 * Math.pow(clamped, 1 / 2.4) - 0.055) * 255);
}

/**
 * Convert RGBA to OKLab
 * Based on Björn Ottosson's OKLab implementation
 */
export function rgbaToOklab(rgba: RGBA): OKLab {
  const r = srgbToLinear(rgba.r);
  const g = srgbToLinear(rgba.g);
  const b = srgbToLinear(rgba.b);

  const l_ = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m_ = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s_ = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l = Math.cbrt(l_);
  const m = Math.cbrt(m_);
  const s = Math.cbrt(s_);

  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

/**
 * Convert OKLab to RGBA
 */
export function oklabToRgba(oklab: OKLab, alpha: number = 1): RGBA {
  const l_ = oklab.L + 0.3963377774 * oklab.a + 0.2158037573 * oklab.b;
  const m_ = oklab.L - 0.1055613458 * oklab.a - 0.0638541728 * oklab.b;
  const s_ = oklab.L - 0.0894841775 * oklab.a - 1.291485548 * oklab.b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  return {
    r: linearToSrgb(r),
    g: linearToSrgb(g),
    b: linearToSrgb(b),
    a: alpha,
  };
}

/**
 * Convert OKLab to OKLCH
 */
export function oklabToOklch(oklab: OKLab): OKLCH {
  const C = Math.sqrt(oklab.a * oklab.a + oklab.b * oklab.b);
  let h = (Math.atan2(oklab.b, oklab.a) * 180) / Math.PI;
  if (h < 0) h += 360;

  return {
    L: oklab.L,
    C,
    h,
  };
}

/**
 * Convert OKLCH to OKLab
 */
export function oklchToOklab(oklch: OKLCH): OKLab {
  const hRad = (oklch.h * Math.PI) / 180;
  return {
    L: oklch.L,
    a: oklch.C * Math.cos(hRad),
    b: oklch.C * Math.sin(hRad),
  };
}

/**
 * Calculate perceptual distance between two colors using OKLab Delta E
 */
export function colorDistance(a: OKLab, b: OKLab): number {
  const dL = a.L - b.L;
  const da = a.a - b.a;
  const db = a.b - b.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Normalize a color string to a full NormalizedColor object
 */
export function normalizeColor(input: string): NormalizedColor {
  const rgba = parseColor(input);

  if (!rgba) {
    throw new Error(`Invalid color format: ${input}`);
  }

  const hex = rgbaToHex(rgba);
  const hsla = rgbaToHsla(rgba);
  const oklab = rgbaToOklab(rgba);
  const oklch = oklabToOklch(oklab);

  return {
    input,
    rgba,
    hex,
    hsla,
    oklab,
    oklch,
  };
}
