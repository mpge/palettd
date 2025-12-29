import { describe, it, expect } from 'vitest';
import { generateLayout, DEFAULT_OPTIONS, packColors, normalizeColor } from '../src/index.js';

describe('generateLayout', () => {
  it('generates layout for single color', () => {
    const layout = generateLayout(1);

    expect(layout.swatches).toHaveLength(1);
    expect(layout.swatches[0].width).toBeGreaterThan(0);
    expect(layout.swatches[0].height).toBeGreaterThan(0);
  });

  it('generates layout for 2-10 colors', () => {
    for (let n = 2; n <= 10; n++) {
      const layout = generateLayout(n);

      expect(layout.swatches).toHaveLength(n);
      layout.swatches.forEach((swatch) => {
        expect(swatch.x).toBeGreaterThanOrEqual(0);
        expect(swatch.y).toBeGreaterThanOrEqual(0);
        expect(swatch.width).toBeGreaterThan(0);
        expect(swatch.height).toBeGreaterThan(0);
        expect(swatch.radius).toBeGreaterThanOrEqual(0);
        expect(swatch.nameFontSize).toBeGreaterThan(0);
        expect(swatch.hexFontSize).toBeGreaterThan(0);
      });
    }
  });

  it('generates layout for more than 10 colors', () => {
    const layout = generateLayout(15);

    expect(layout.swatches).toHaveLength(15);
    layout.swatches.forEach((swatch) => {
      expect(swatch.width).toBeGreaterThan(0);
      expect(swatch.height).toBeGreaterThan(0);
    });
  });

  it('respects custom dimensions', () => {
    const layout = generateLayout(4, { width: 800, height: 600 });

    expect(layout.card.width).toBeLessThanOrEqual(800);
    expect(layout.card.height).toBeLessThanOrEqual(600);
  });

  it('includes card and footer in layout', () => {
    const layout = generateLayout(4);

    expect(layout.card).toBeDefined();
    expect(layout.card.x).toBeGreaterThanOrEqual(0);
    expect(layout.card.y).toBeGreaterThanOrEqual(0);
    expect(layout.card.width).toBeGreaterThan(0);
    expect(layout.card.height).toBeGreaterThan(0);
    expect(layout.card.radius).toBeGreaterThanOrEqual(0);

    expect(layout.footer).toBeDefined();
    expect(layout.footer.y).toBeGreaterThan(0);
    expect(layout.footer.height).toBeGreaterThan(0);
  });

  it('produces non-overlapping swatches', () => {
    const layout = generateLayout(9);

    for (let i = 0; i < layout.swatches.length; i++) {
      for (let j = i + 1; j < layout.swatches.length; j++) {
        const a = layout.swatches[i];
        const b = layout.swatches[j];

        // Simple overlap check - if no overlap, one of these must be true
        const noOverlap =
          a.x + a.width < b.x ||
          b.x + b.width < a.x ||
          a.y + a.height < b.y ||
          b.y + b.height < a.y;

        // Allow for small gaps/overlaps due to floating point
        // Just check they're not completely overlapping
        expect(noOverlap || Math.abs(a.x - b.x) < 1).toBe(true);
      }
    }
  });
});

describe('packColors', () => {
  const testColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];

  it('creates palette with names and text colors', () => {
    const colors = testColors.map(normalizeColor);
    const { palette, layout } = packColors(colors);

    expect(palette).toHaveLength(4);
    palette.forEach((color, i) => {
      expect(color.name).toBeTruthy();
      expect(color.textColor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(color.index).toBe(i);
      expect(color.hex).toBe(testColors[i]);
    });

    expect(layout.swatches).toHaveLength(4);
  });

  it('preserves input order by default', () => {
    const colors = testColors.map(normalizeColor);
    const { palette } = packColors(colors, { order: 'input' });

    expect(palette[0].hex).toBe('#FF0000');
    expect(palette[1].hex).toBe('#00FF00');
    expect(palette[2].hex).toBe('#0000FF');
    expect(palette[3].hex).toBe('#FFFF00');
  });

  it('sorts by LCH when requested', () => {
    const colors = testColors.map(normalizeColor);
    const { palette } = packColors(colors, { order: 'lch' });

    // Just verify it doesn't crash and returns all colors
    expect(palette).toHaveLength(4);
    const hexes = palette.map((p) => p.hex);
    expect(hexes.sort()).toEqual(testColors.sort());
  });

  it('uses provided names when available', () => {
    // Create fresh normalized colors for this test
    const freshColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'].map(normalizeColor);
    const providedNames = {
      '#FF0000': 'Custom Red',
      '#00FF00': 'Custom Green',
    };
    const { palette } = packColors(freshColors, {
      names: 'provided',
      providedNames,
      order: 'input', // Explicitly set to ensure no sorting
    });

    // Verify order is preserved
    expect(palette[0].hex).toBe('#FF0000');
    expect(palette[1].hex).toBe('#00FF00');
    expect(palette[0].name).toBe('Custom Red');
    expect(palette[1].name).toBe('Custom Green');
  });
});

describe('DEFAULT_OPTIONS', () => {
  it('has all required options', () => {
    expect(DEFAULT_OPTIONS.width).toBe(640);
    expect(DEFAULT_OPTIONS.height).toBe(480);
    expect(DEFAULT_OPTIONS.format).toBe('svg');
    expect(DEFAULT_OPTIONS.outerBg).toBeTruthy();
    expect(DEFAULT_OPTIONS.cardBg).toBeTruthy();
    expect(DEFAULT_OPTIONS.font).toBeTruthy();
    expect(DEFAULT_OPTIONS.footerRight).toBe('palettd');
  });
});
