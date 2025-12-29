import { describe, it, expect } from 'vitest';
import { generateBoard, generateSvg, generatePng } from '../src/index.js';

const TEST_COLORS = ['#FAF5E9', '#392525', '#683226', '#B25D3E'];
const FULL_PALETTE = [
  '#FAF5E9',
  '#392525',
  '#683226',
  '#B25D3E',
  '#728383',
  '#3E4734',
  '#E3E890',
  '#B6B7A5',
  '#7E7B62',
];

describe('generateBoard', () => {
  it('generates SVG and palette for colors', () => {
    const result = generateBoard(TEST_COLORS);

    expect(result.svg).toBeTruthy();
    expect(result.svg).toContain('<svg');
    expect(result.svg).toContain('</svg>');
    expect(result.palette).toHaveLength(4);
    expect(result.layout).toBeDefined();
    expect(result.png).toBeUndefined();
  });

  it('generates PNG when format is png', () => {
    const result = generateBoard(TEST_COLORS, { format: 'png' });

    expect(result.svg).toBeTruthy();
    expect(result.png).toBeDefined();
    expect(result.png).toBeInstanceOf(Buffer);
    expect(result.png!.length).toBeGreaterThan(0);

    // PNG magic bytes
    expect(result.png![0]).toBe(0x89);
    expect(result.png![1]).toBe(0x50); // P
    expect(result.png![2]).toBe(0x4e); // N
    expect(result.png![3]).toBe(0x47); // G
  });

  it('includes color hex codes in SVG', () => {
    const result = generateBoard(TEST_COLORS);

    TEST_COLORS.forEach((color) => {
      expect(result.svg).toContain(color.toUpperCase());
    });
  });

  it('respects showHex option', () => {
    const withHex = generateBoard(TEST_COLORS, { showHex: true });
    const withoutHex = generateBoard(TEST_COLORS, { showHex: false });

    // With hex should have more text elements
    const hexMatches1 = (withHex.svg.match(/#[0-9A-F]{6}/g) || []).length;
    const hexMatches2 = (withoutHex.svg.match(/#[0-9A-F]{6}/g) || []).length;

    expect(hexMatches1).toBeGreaterThan(hexMatches2);
  });

  it('includes title when provided', () => {
    const result = generateBoard(TEST_COLORS, { title: 'My Palette' });

    expect(result.svg).toContain('My Palette');
  });

  it('includes footer text', () => {
    const result = generateBoard(TEST_COLORS, {
      footerLeft: 'LEFT',
      footerCenter: 'CENTER',
      footerRight: 'RIGHT',
    });

    expect(result.svg).toContain('LEFT');
    expect(result.svg).toContain('CENTER');
    expect(result.svg).toContain('RIGHT');
  });

  it('respects custom dimensions', () => {
    const result = generateBoard(TEST_COLORS, { width: 800, height: 600 });

    expect(result.svg).toContain('width="800"');
    expect(result.svg).toContain('height="600"');
  });

  it('uses default dimensions (640x480)', () => {
    const result = generateBoard(TEST_COLORS);

    expect(result.svg).toContain('width="640"');
    expect(result.svg).toContain('height="480"');
  });

  it('handles 9-color palette', () => {
    const result = generateBoard(FULL_PALETTE);

    expect(result.palette).toHaveLength(9);
    expect(result.layout.swatches).toHaveLength(9);
    FULL_PALETTE.forEach((color) => {
      expect(result.svg).toContain(color.toUpperCase());
    });
  });

  it('includes color names in SVG', () => {
    const result = generateBoard(TEST_COLORS, { showName: true });

    // Should contain at least one name (not hex, not empty)
    result.palette.forEach((color) => {
      if (color.name) {
        expect(result.svg).toContain(color.name);
      }
    });
  });

  it('has default footer text "palettd"', () => {
    const result = generateBoard(TEST_COLORS);

    expect(result.svg).toContain('palettd');
  });
});

describe('generateSvg', () => {
  it('returns SVG string directly', () => {
    const svg = generateSvg(TEST_COLORS);

    expect(typeof svg).toBe('string');
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('accepts all options', () => {
    const svg = generateSvg(TEST_COLORS, {
      width: 1024,
      height: 768,
      title: 'Test',
    });

    expect(svg).toContain('width="1024"');
    expect(svg).toContain('Test');
  });
});

describe('generatePng', () => {
  it('returns PNG buffer directly', () => {
    const png = generatePng(TEST_COLORS);

    expect(png).toBeInstanceOf(Buffer);
    expect(png.length).toBeGreaterThan(100);

    // Verify PNG signature
    expect(png[0]).toBe(0x89);
    expect(png[1]).toBe(0x50);
    expect(png[2]).toBe(0x4e);
    expect(png[3]).toBe(0x47);
  });
});

describe('deterministic output', () => {
  it('produces identical SVG for same inputs', () => {
    const svg1 = generateSvg(TEST_COLORS);
    const svg2 = generateSvg(TEST_COLORS);
    const svg3 = generateSvg(TEST_COLORS);

    expect(svg1).toBe(svg2);
    expect(svg2).toBe(svg3);
  });

  it('produces identical PNG for same inputs', () => {
    const png1 = generatePng(TEST_COLORS);
    const png2 = generatePng(TEST_COLORS);

    expect(png1.equals(png2)).toBe(true);
  });

  it('produces different output for different colors', () => {
    const svg1 = generateSvg(['#FF0000', '#00FF00']);
    const svg2 = generateSvg(['#0000FF', '#FFFF00']);

    expect(svg1).not.toBe(svg2);
  });

  it('produces different output for different options', () => {
    const svg1 = generateSvg(TEST_COLORS, { title: 'A' });
    const svg2 = generateSvg(TEST_COLORS, { title: 'B' });

    expect(svg1).not.toBe(svg2);
  });
});

describe('error handling', () => {
  it('throws for invalid colors', () => {
    expect(() => generateBoard(['not-a-color'])).toThrow();
    expect(() => generateBoard(['#GGG'])).toThrow();
  });

  it('handles empty array gracefully', () => {
    const result = generateBoard([]);

    expect(result.svg).toContain('<svg');
    expect(result.palette).toHaveLength(0);
  });

  it('handles single color', () => {
    const result = generateBoard(['#FF6600']);

    expect(result.palette).toHaveLength(1);
    expect(result.svg).toContain('#FF6600');
  });
});
