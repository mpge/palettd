import { describe, it, expect } from 'vitest';
import { nameColor, nameColors, normalizeColor } from '../src/index.js';

describe('nameColor', () => {
  it('names white correctly', () => {
    const color = normalizeColor('#FFFFFF');
    expect(nameColor(color, 'auto')).toBe('White');
  });

  it('names black correctly', () => {
    const color = normalizeColor('#000000');
    expect(nameColor(color, 'auto')).toBe('Black');
  });

  it('names common colors correctly', () => {
    expect(nameColor(normalizeColor('#FF0000'), 'auto')).toBe('Red');
    expect(nameColor(normalizeColor('#00FF00'), 'auto')).toBe('Lime');
    expect(nameColor(normalizeColor('#0000FF'), 'auto')).toBe('Blue');
  });

  it('returns empty string for none strategy', () => {
    const color = normalizeColor('#FF6600');
    expect(nameColor(color, 'none')).toBe('');
  });

  it('uses provided names when strategy is provided', () => {
    const color = normalizeColor('#FF6600');
    const names = { '#FF6600': 'Custom Orange' };
    expect(nameColor(color, 'provided', names)).toBe('Custom Orange');
  });

  it('falls back to auto when provided name not found', () => {
    const color = normalizeColor('#FF6600');
    const names = { '#000000': 'Custom Black' };
    const result = nameColor(color, 'provided', names);
    expect(result).not.toBe('');
    expect(result).not.toBe('Custom Black');
  });

  it('generates descriptive names for unknown colors', () => {
    // A color that might not have an exact match
    const color = normalizeColor('#7A3B2E');
    const name = nameColor(color, 'auto');
    expect(name).toBeTruthy();
    expect(typeof name).toBe('string');
  });
});

describe('nameColors', () => {
  it('names multiple colors', () => {
    const colors = [
      normalizeColor('#FF0000'),
      normalizeColor('#00FF00'),
      normalizeColor('#0000FF'),
    ];
    const names = nameColors(colors, 'auto');

    expect(names).toHaveLength(3);
    expect(names[0]).toBe('Red');
    expect(names[1]).toBe('Lime');
    expect(names[2]).toBe('Blue');
  });

  it('handles duplicate colors with numbering', () => {
    const colors = [
      normalizeColor('#FF0000'),
      normalizeColor('#FF0000'),
      normalizeColor('#FF0000'),
    ];
    const names = nameColors(colors, 'auto');

    expect(names[0]).toBe('Red');
    expect(names[1]).toBe('Red 2');
    expect(names[2]).toBe('Red 3');
  });

  it('returns empty strings for none strategy', () => {
    const colors = [
      normalizeColor('#FF0000'),
      normalizeColor('#00FF00'),
    ];
    const names = nameColors(colors, 'none');

    expect(names).toEqual(['', '']);
  });
});

describe('deterministic naming', () => {
  it('produces the same name for the same color across calls', () => {
    const color = normalizeColor('#B25D3E');

    const name1 = nameColor(color, 'auto');
    const name2 = nameColor(color, 'auto');
    const name3 = nameColor(color, 'auto');

    expect(name1).toBe(name2);
    expect(name2).toBe(name3);
  });

  it('produces consistent names for palette colors', () => {
    const paletteColors = [
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

    const colors = paletteColors.map(normalizeColor);
    const names1 = nameColors(colors, 'auto');
    const names2 = nameColors(colors, 'auto');

    expect(names1).toEqual(names2);
  });
});
