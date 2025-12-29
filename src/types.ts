/**
 * RGBA color values (0-255 for RGB, 0-1 for alpha)
 */
export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * HSLA color values (h: 0-360, s/l: 0-100, a: 0-1)
 */
export interface HSLA {
  h: number;
  s: number;
  l: number;
  a: number;
}

/**
 * OKLab color values
 */
export interface OKLab {
  L: number;
  a: number;
  b: number;
}

/**
 * OKLCH color values
 */
export interface OKLCH {
  L: number;
  C: number;
  h: number;
}

/**
 * Normalized color with all representations
 */
export interface NormalizedColor {
  /** Original input string */
  input: string;
  /** RGBA values */
  rgba: RGBA;
  /** Normalized hex string (#RRGGBB or #RRGGBBAA) */
  hex: string;
  /** HSLA values */
  hsla: HSLA;
  /** OKLab values for perceptual operations */
  oklab: OKLab;
  /** OKLCH values for perceptual operations */
  oklch: OKLCH;
}

/**
 * Palette color with name and display information
 */
export interface PaletteColor extends NormalizedColor {
  /** Human-friendly color name */
  name: string;
  /** Text color for readability on this background */
  textColor: string;
  /** Index in the palette (0-based) */
  index: number;
}

/**
 * Layout swatch position and size
 */
export interface SwatchLayout {
  /** X position within the card */
  x: number;
  /** Y position within the card */
  y: number;
  /** Width of the swatch */
  width: number;
  /** Height of the swatch */
  height: number;
  /** Border radius for rounded corners */
  radius: number;
  /** Font size for the name */
  nameFontSize: number;
  /** Font size for the hex */
  hexFontSize: number;
}

/**
 * Complete layout with all swatches
 */
export interface Layout {
  /** Card dimensions (inner content area) */
  card: {
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
  };
  /** Individual swatch layouts */
  swatches: SwatchLayout[];
  /** Footer area */
  footer: {
    y: number;
    height: number;
  };
}

/**
 * Naming strategy for colors
 */
export type NamingStrategy = 'auto' | 'none' | 'provided';

/**
 * Color ordering strategy
 */
export type OrderStrategy = 'input' | 'lch';

/**
 * Output format
 */
export type OutputFormat = 'svg' | 'png';

/**
 * Board generation options
 */
export interface BoardOptions {
  /** Output format */
  format?: OutputFormat;
  /** Canvas width */
  width?: number;
  /** Canvas height */
  height?: number;
  /** Outer background color */
  outerBg?: string;
  /** Card background color */
  cardBg?: string;
  /** Card border radius */
  cardRadius?: number;
  /** Padding inside card */
  padding?: number;
  /** Gap between swatches */
  gap?: number;
  /** Stroke color for card border */
  stroke?: string;
  /** Stroke opacity (0-1) */
  strokeOpacity?: number;
  /** Font family stack */
  font?: string;
  /** Optional title */
  title?: string;
  /** Footer left text */
  footerLeft?: string;
  /** Footer center text */
  footerCenter?: string;
  /** Footer right text */
  footerRight?: string;
  /** Show hex codes on swatches */
  showHex?: boolean;
  /** Show color names on swatches */
  showName?: boolean;
  /** Naming strategy */
  names?: NamingStrategy;
  /** Provided names map (color hex -> name) */
  providedNames?: Record<string, string>;
  /** Color ordering strategy */
  order?: OrderStrategy;
}

/**
 * Result from board generation
 */
export interface BoardResult {
  /** Generated SVG string */
  svg: string;
  /** Generated PNG buffer (if format is png) */
  png?: Buffer;
  /** Layout metadata */
  layout: Layout;
  /** Processed palette colors */
  palette: PaletteColor[];
}

/**
 * Input JSON file format
 */
export interface InputFile {
  colors: string[];
  names?: Record<string, string>;
}

/**
 * Metadata output format
 */
export interface MetadataOutput {
  /** Original colors */
  colors: string[];
  /** Processed palette */
  palette: Array<{
    input: string;
    hex: string;
    name: string;
    textColor: string;
    index: number;
    position: { x: number; y: number };
    size: { width: number; height: number };
  }>;
  /** Options used */
  options: BoardOptions;
}
