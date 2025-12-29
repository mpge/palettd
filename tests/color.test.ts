import { describe, it, expect } from 'vitest';
import {
  parseColor,
  parseHex,
  parseRgb,
  parseHsl,
  rgbaToHex,
  normalizeColor,
  rgbaToHsla,
  rgbaToOklab,
  colorDistance,
} from '../src/color/index.js';

describe('parseHex', () => {
  it('parses 3-digit hex', () => {
    expect(parseHex('#F00')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseHex('#0F0')).toEqual({ r: 0, g: 255, b: 0, a: 1 });
    expect(parseHex('#00F')).toEqual({ r: 0, g: 0, b: 255, a: 1 });
    expect(parseHex('#FFF')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
  });

  it('parses 4-digit hex with alpha', () => {
    expect(parseHex('#F00F')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseHex('#F008')).toEqual({ r: 255, g: 0, b: 0, a: expect.closeTo(0.533, 2) });
  });

  it('parses 6-digit hex', () => {
    expect(parseHex('#FF6600')).toEqual({ r: 255, g: 102, b: 0, a: 1 });
    expect(parseHex('#FAF5E9')).toEqual({ r: 250, g: 245, b: 233, a: 1 });
    expect(parseHex('#392525')).toEqual({ r: 57, g: 37, b: 37, a: 1 });
  });

  it('parses 8-digit hex with alpha', () => {
    expect(parseHex('#FF660080')).toEqual({ r: 255, g: 102, b: 0, a: expect.closeTo(0.502, 2) });
    expect(parseHex('#000000FF')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
  });

  it('handles lowercase and without hash', () => {
    expect(parseHex('ff6600')).toEqual({ r: 255, g: 102, b: 0, a: 1 });
    expect(parseHex('#ff6600')).toEqual({ r: 255, g: 102, b: 0, a: 1 });
  });

  it('returns null for invalid hex', () => {
    expect(parseHex('#GGG')).toBeNull();
    expect(parseHex('#12345')).toBeNull();
    expect(parseHex('')).toBeNull();
  });
});

describe('parseRgb', () => {
  it('parses rgb() with commas', () => {
    expect(parseRgb('rgb(255, 102, 0)')).toEqual({ r: 255, g: 102, b: 0, a: 1 });
    expect(parseRgb('rgb(0, 0, 0)')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
  });

  it('parses rgb() with spaces', () => {
    expect(parseRgb('rgb(255 102 0)')).toEqual({ r: 255, g: 102, b: 0, a: 1 });
  });

  it('parses rgba() with alpha', () => {
    expect(parseRgb('rgba(255, 102, 0, 0.5)')).toEqual({ r: 255, g: 102, b: 0, a: 0.5 });
    expect(parseRgb('rgba(255, 102, 0, 1)')).toEqual({ r: 255, g: 102, b: 0, a: 1 });
  });

  it('parses rgb() with slash alpha', () => {
    expect(parseRgb('rgb(255 102 0 / 0.5)')).toEqual({ r: 255, g: 102, b: 0, a: 0.5 });
  });

  it('clamps values', () => {
    expect(parseRgb('rgb(300, 102, 0)')).toEqual({ r: 255, g: 102, b: 0, a: 1 });
  });

  it('returns null for invalid rgb', () => {
    expect(parseRgb('rgb()')).toBeNull();
    expect(parseRgb('rgb(255, 102)')).toBeNull();
  });
});

describe('parseHsl', () => {
  it('parses hsl() with commas', () => {
    const result = parseHsl('hsl(0, 100%, 50%)');
    expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it('parses hsl() with spaces', () => {
    const result = parseHsl('hsl(120 100% 50%)');
    expect(result).toEqual({ r: 0, g: 255, b: 0, a: 1 });
  });

  it('parses hsla() with alpha', () => {
    const result = parseHsl('hsla(240, 100%, 50%, 0.5)');
    expect(result).toEqual({ r: 0, g: 0, b: 255, a: 0.5 });
  });

  it('handles grayscale (s=0)', () => {
    const result = parseHsl('hsl(0, 0%, 50%)');
    expect(result?.r).toBeCloseTo(128, 0);
    expect(result?.g).toBeCloseTo(128, 0);
    expect(result?.b).toBeCloseTo(128, 0);
  });
});

describe('parseColor', () => {
  it('parses hex colors', () => {
    expect(parseColor('#FF6600')).toEqual({ r: 255, g: 102, b: 0, a: 1 });
  });

  it('parses rgb colors', () => {
    expect(parseColor('rgb(255, 102, 0)')).toEqual({ r: 255, g: 102, b: 0, a: 1 });
  });

  it('parses hsl colors', () => {
    const result = parseColor('hsl(0, 100%, 50%)');
    expect(result).toEqual({ r: 255, g: 0, b: 0, a: 1 });
  });

  it('parses hex without hash', () => {
    expect(parseColor('FF6600')).toEqual({ r: 255, g: 102, b: 0, a: 1 });
  });
});

describe('rgbaToHex', () => {
  it('converts RGBA to hex', () => {
    expect(rgbaToHex({ r: 255, g: 102, b: 0, a: 1 })).toBe('#FF6600');
    expect(rgbaToHex({ r: 0, g: 0, b: 0, a: 1 })).toBe('#000000');
    expect(rgbaToHex({ r: 255, g: 255, b: 255, a: 1 })).toBe('#FFFFFF');
  });

  it('includes alpha when < 1', () => {
    expect(rgbaToHex({ r: 255, g: 102, b: 0, a: 0.5 })).toBe('#FF660080');
  });
});

describe('normalizeColor', () => {
  it('normalizes hex to all color spaces', () => {
    const result = normalizeColor('#FF6600');

    expect(result.input).toBe('#FF6600');
    expect(result.hex).toBe('#FF6600');
    expect(result.rgba).toEqual({ r: 255, g: 102, b: 0, a: 1 });
    expect(result.hsla.h).toBe(24);
    expect(result.hsla.s).toBe(100);
    expect(result.hsla.l).toBe(50);
    expect(result.oklab.L).toBeGreaterThan(0);
    expect(result.oklch.C).toBeGreaterThan(0);
  });

  it('throws for invalid colors', () => {
    expect(() => normalizeColor('not-a-color')).toThrow();
  });
});

describe('rgbaToHsla', () => {
  it('converts red', () => {
    const result = rgbaToHsla({ r: 255, g: 0, b: 0, a: 1 });
    expect(result.h).toBe(0);
    expect(result.s).toBe(100);
    expect(result.l).toBe(50);
  });

  it('converts gray', () => {
    const result = rgbaToHsla({ r: 128, g: 128, b: 128, a: 1 });
    expect(result.s).toBe(0);
    expect(result.l).toBe(50);
  });
});

describe('rgbaToOklab', () => {
  it('converts white', () => {
    const result = rgbaToOklab({ r: 255, g: 255, b: 255, a: 1 });
    expect(result.L).toBeCloseTo(1, 1);
    expect(result.a).toBeCloseTo(0, 2);
    expect(result.b).toBeCloseTo(0, 2);
  });

  it('converts black', () => {
    const result = rgbaToOklab({ r: 0, g: 0, b: 0, a: 1 });
    expect(result.L).toBeCloseTo(0, 1);
  });
});

describe('colorDistance', () => {
  it('returns 0 for identical colors', () => {
    const color = rgbaToOklab({ r: 255, g: 102, b: 0, a: 1 });
    expect(colorDistance(color, color)).toBe(0);
  });

  it('returns positive distance for different colors', () => {
    const red = rgbaToOklab({ r: 255, g: 0, b: 0, a: 1 });
    const blue = rgbaToOklab({ r: 0, g: 0, b: 255, a: 1 });
    expect(colorDistance(red, blue)).toBeGreaterThan(0);
  });

  it('returns larger distance for more different colors', () => {
    const black = rgbaToOklab({ r: 0, g: 0, b: 0, a: 1 });
    const white = rgbaToOklab({ r: 255, g: 255, b: 255, a: 1 });
    const gray = rgbaToOklab({ r: 128, g: 128, b: 128, a: 1 });

    expect(colorDistance(black, white)).toBeGreaterThan(colorDistance(black, gray));
  });
});
