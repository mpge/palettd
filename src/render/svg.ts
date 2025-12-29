import type { PaletteColor, Layout, BoardOptions } from '../types.js';
import { DEFAULT_OPTIONS } from '../layout/templates.js';

/**
 * Escape special XML characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Render a single swatch with color, name, and hex
 */
function renderSwatch(
  color: PaletteColor,
  swatch: Layout['swatches'][0],
  options: {
    showName: boolean;
    showHex: boolean;
    font: string;
  }
): string {
  const { x, y, width, height, radius, nameFontSize, hexFontSize } = swatch;
  const { showName, showHex, font } = options;

  const lines: string[] = [];

  // Swatch background
  lines.push(
    `    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${color.hex}" />`
  );

  // Calculate text positions - bottom-left aligned with padding
  const textPadding = Math.min(12, width * 0.08);
  const textX = x + textPadding;
  let textY = y + height - textPadding;

  // Hex code (bottom line)
  if (showHex) {
    lines.push(
      `    <text x="${textX}" y="${textY}" font-family="${escapeXml(font)}" font-size="${hexFontSize}" fill="${color.textColor}" opacity="0.85">${color.hex}</text>`
    );
    textY -= hexFontSize + 4;
  }

  // Color name (above hex)
  if (showName && color.name) {
    lines.push(
      `    <text x="${textX}" y="${textY}" font-family="${escapeXml(font)}" font-size="${nameFontSize}" font-weight="600" fill="${color.textColor}">${escapeXml(color.name)}</text>`
    );
  }

  return lines.join('\n');
}

/**
 * Render footer with left, center, and right text
 */
function renderFooter(
  layout: Layout,
  options: {
    footerLeft?: string;
    footerCenter?: string;
    footerRight?: string;
    font: string;
    cardBg: string;
  }
): string {
  const { card, footer } = layout;
  const { footerLeft, footerCenter, footerRight, font } = options;
  const fontSize = 10;
  const textColor = '#666666';

  const y = card.y + footer.y + footer.height / 2 + fontSize / 3;
  const padding = 20;
  const lines: string[] = [];

  // Footer separator line
  lines.push(
    `    <line x1="${card.x + padding}" y1="${card.y + footer.y}" x2="${card.x + card.width - padding}" y2="${card.y + footer.y}" stroke="#E0E0E0" stroke-width="1" />`
  );

  // Left text
  if (footerLeft) {
    lines.push(
      `    <text x="${card.x + padding}" y="${y}" font-family="${escapeXml(font)}" font-size="${fontSize}" fill="${textColor}" letter-spacing="0.5">${escapeXml(footerLeft)}</text>`
    );
  }

  // Center text
  if (footerCenter) {
    lines.push(
      `    <text x="${card.x + card.width / 2}" y="${y}" font-family="${escapeXml(font)}" font-size="${fontSize}" fill="${textColor}" text-anchor="middle" letter-spacing="0.5">${escapeXml(footerCenter)}</text>`
    );
  }

  // Right text
  if (footerRight) {
    lines.push(
      `    <text x="${card.x + card.width - padding}" y="${y}" font-family="${escapeXml(font)}" font-size="${fontSize}" fill="${textColor}" text-anchor="end" letter-spacing="0.5">${escapeXml(footerRight)}</text>`
    );
  }

  return lines.join('\n');
}

/**
 * Render the complete SVG board
 */
export function renderSvg(
  palette: PaletteColor[],
  layout: Layout,
  options: Partial<BoardOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { width, height, outerBg, cardBg, stroke, strokeOpacity, font } = opts;
  const { card } = layout;

  const lines: string[] = [];

  // SVG header
  lines.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
  );

  // Outer background
  lines.push(`  <rect width="${width}" height="${height}" fill="${outerBg}" />`);

  // Card background with stroke
  lines.push(
    `  <rect x="${card.x}" y="${card.y}" width="${card.width}" height="${card.height}" rx="${card.radius}" fill="${cardBg}" stroke="${stroke}" stroke-opacity="${strokeOpacity}" stroke-width="1" />`
  );

  // Render swatches
  lines.push('  <g>');
  palette.forEach((color, i) => {
    const swatch = layout.swatches[i];
    if (swatch) {
      // Offset swatches to be inside the card
      const offsetSwatch = {
        ...swatch,
        x: card.x + swatch.x,
        y: card.y + swatch.y,
      };
      lines.push(
        renderSwatch(color, offsetSwatch, {
          showName: opts.showName,
          showHex: opts.showHex,
          font,
        })
      );
    }
  });
  lines.push('  </g>');

  // Footer
  lines.push(
    renderFooter(layout, {
      footerLeft: opts.footerLeft,
      footerCenter: opts.footerCenter,
      footerRight: opts.footerRight,
      font,
      cardBg,
    })
  );

  // Close SVG
  lines.push('</svg>');

  return lines.join('\n');
}
