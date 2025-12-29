import { describe, it, expect } from 'vitest';
import {
  getRelativeLuminance,
  getContrastRatio,
  computeTextColor,
  meetsWcagAA,
  meetsWcagAAA,
} from '../src/color/contrast.js';

describe('getRelativeLuminance', () => {
  it('returns 1 for white', () => {
    expect(getRelativeLuminance({ r: 255, g: 255, b: 255, a: 1 })).toBeCloseTo(1, 2);
  });

  it('returns 0 for black', () => {
    expect(getRelativeLuminance({ r: 0, g: 0, b: 0, a: 1 })).toBe(0);
  });

  it('returns ~0.5 for middle gray', () => {
    // Pure middle gray in sRGB isn't 0.5 luminance due to gamma
    const result = getRelativeLuminance({ r: 128, g: 128, b: 128, a: 1 });
    expect(result).toBeGreaterThan(0.1);
    expect(result).toBeLessThan(0.3);
  });

  it('weights green more than red more than blue', () => {
    const red = getRelativeLuminance({ r: 255, g: 0, b: 0, a: 1 });
    const green = getRelativeLuminance({ r: 0, g: 255, b: 0, a: 1 });
    const blue = getRelativeLuminance({ r: 0, g: 0, b: 255, a: 1 });

    expect(green).toBeGreaterThan(red);
    expect(red).toBeGreaterThan(blue);
  });
});

describe('getContrastRatio', () => {
  it('returns 21 for black and white', () => {
    const black = { r: 0, g: 0, b: 0, a: 1 };
    const white = { r: 255, g: 255, b: 255, a: 1 };

    expect(getContrastRatio(black, white)).toBeCloseTo(21, 0);
    expect(getContrastRatio(white, black)).toBeCloseTo(21, 0);
  });

  it('returns 1 for identical colors', () => {
    const red = { r: 255, g: 0, b: 0, a: 1 };
    expect(getContrastRatio(red, red)).toBe(1);
  });

  it('returns values between 1 and 21', () => {
    const colors = [
      { r: 255, g: 0, b: 0, a: 1 },
      { r: 0, g: 128, b: 0, a: 1 },
      { r: 100, g: 100, b: 255, a: 1 },
    ];

    for (const c1 of colors) {
      for (const c2 of colors) {
        const ratio = getContrastRatio(c1, c2);
        expect(ratio).toBeGreaterThanOrEqual(1);
        expect(ratio).toBeLessThanOrEqual(21);
      }
    }
  });
});

describe('computeTextColor', () => {
  it('returns white text for dark backgrounds', () => {
    expect(computeTextColor('#000000')).toBe('#FFFFFF');
    expect(computeTextColor('#1A1A1A')).toBe('#FFFFFF');
    expect(computeTextColor('#333333')).toBe('#FFFFFF');
    expect(computeTextColor('#2B1B1B')).toBe('#FFFFFF');
    expect(computeTextColor('#392525')).toBe('#FFFFFF');
  });

  it('returns dark text for light backgrounds', () => {
    expect(computeTextColor('#FFFFFF')).toBe('#111111');
    expect(computeTextColor('#F7F2E7')).toBe('#111111');
    expect(computeTextColor('#FAF5E9')).toBe('#111111');
    expect(computeTextColor('#E3E890')).toBe('#111111');
  });

  it('handles mid-tones appropriately', () => {
    // Should return valid text color
    const result = computeTextColor('#808080');
    expect([('#FFFFFF'), '#111111']).toContain(result);
  });

  it('handles invalid colors gracefully', () => {
    expect(computeTextColor('invalid')).toBe('#111111');
  });
});

describe('meetsWcagAA', () => {
  it('requires 4.5:1 for normal text', () => {
    expect(meetsWcagAA(4.5)).toBe(true);
    expect(meetsWcagAA(4.49)).toBe(false);
    expect(meetsWcagAA(7)).toBe(true);
    expect(meetsWcagAA(3)).toBe(false);
  });

  it('requires 3:1 for large text', () => {
    expect(meetsWcagAA(3, true)).toBe(true);
    expect(meetsWcagAA(2.99, true)).toBe(false);
    expect(meetsWcagAA(4.5, true)).toBe(true);
  });
});

describe('meetsWcagAAA', () => {
  it('requires 7:1 for normal text', () => {
    expect(meetsWcagAAA(7)).toBe(true);
    expect(meetsWcagAAA(6.99)).toBe(false);
    expect(meetsWcagAAA(10)).toBe(true);
  });

  it('requires 4.5:1 for large text', () => {
    expect(meetsWcagAAA(4.5, true)).toBe(true);
    expect(meetsWcagAAA(4.49, true)).toBe(false);
    expect(meetsWcagAAA(7, true)).toBe(true);
  });
});
