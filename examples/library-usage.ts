/**
 * Example: Using palettd as a library
 *
 * Run with: npx tsx examples/library-usage.ts
 */

import { writeFileSync } from 'node:fs';
import {
  generateBoard,
  generateSvg,
  generatePng,
  normalizeColor,
  nameColor,
  computeTextColor,
} from '../src/index.js';

// Example 1: Generate a complete palette board
console.log('Example 1: Generate complete board');
const colors = ['#FAF5E9', '#392525', '#683226', '#B25D3E', '#728383'];

const result = generateBoard(colors, {
  title: 'Autumn Collection',
  footerRight: '2024',
  format: 'png',
});

// Access all outputs
console.log('  SVG length:', result.svg.length);
console.log('  PNG size:', result.png?.length, 'bytes');
console.log('  Palette:');
result.palette.forEach((color) => {
  console.log(`    ${color.hex} - ${color.name} (text: ${color.textColor})`);
});

// Save outputs
writeFileSync('examples/output-board.svg', result.svg);
writeFileSync('examples/output-board.png', result.png!);
console.log('  Saved to examples/output-board.svg and examples/output-board.png\n');

// Example 2: Generate just SVG
console.log('Example 2: Generate SVG only');
const svg = generateSvg(['#FF6600', '#0B1320', '#00A86B'], {
  width: 800,
  height: 400,
});
writeFileSync('examples/output-simple.svg', svg);
console.log('  Saved to examples/output-simple.svg\n');

// Example 3: Generate just PNG
console.log('Example 3: Generate PNG only');
const png = generatePng(['#E74C3C', '#3498DB', '#2ECC71', '#F39C12'], {
  width: 1024,
  height: 768,
});
writeFileSync('examples/output-large.png', png);
console.log('  Saved to examples/output-large.png\n');

// Example 4: Use color utilities
console.log('Example 4: Color utilities');
const normalized = normalizeColor('#FF6600');
console.log('  Normalized color:');
console.log('    Input:', normalized.input);
console.log('    Hex:', normalized.hex);
console.log('    RGBA:', normalized.rgba);
console.log('    HSLA:', normalized.hsla);
console.log('    OKLCH:', normalized.oklch);

const name = nameColor(normalized, 'auto');
console.log('    Name:', name);

const textColor = computeTextColor('#FF6600');
console.log('    Best text color:', textColor);
console.log();

// Example 5: Custom styling
console.log('Example 5: Custom styling');
const customResult = generateBoard(['#1A1A2E', '#16213E', '#0F3460', '#E94560'], {
  outerBg: '#0A0A0A',
  cardBg: '#1A1A1A',
  stroke: '#333333',
  footerLeft: 'DARK THEME',
  footerCenter: 'UI COLORS',
  footerRight: 'v1.0',
  format: 'png',
});
writeFileSync('examples/output-dark.png', customResult.png!);
console.log('  Saved to examples/output-dark.png\n');

// Example 6: With provided names
console.log('Example 6: With provided names');
const namedResult = generateBoard(['#FF0000', '#00FF00', '#0000FF'], {
  names: 'provided',
  providedNames: {
    '#FF0000': 'Danger',
    '#00FF00': 'Success',
    '#0000FF': 'Info',
  },
});
console.log('  Named palette:');
namedResult.palette.forEach((color) => {
  console.log(`    ${color.hex} - ${color.name}`);
});

console.log('\nAll examples completed!');
