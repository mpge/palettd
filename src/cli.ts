#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { generateBoard, DEFAULT_OPTIONS } from './index.js';
import type { BoardOptions, InputFile, MetadataOutput, OutputFormat, NamingStrategy, OrderStrategy } from './types.js';

const VERSION = '1.0.0';

const HELP = `
palettd v${VERSION}
Generate beautiful brand palette images from colors

USAGE
  palettd [colors...] [options]
  palettd --input colors.json [options]

COLORS
  Accepts hex (#RGB, #RRGGBB, #RRGGBBAA), rgb(), rgba(), hsl(), hsla()

OPTIONS
  Input/Output
    --input, -i <path>      Read colors from JSON file
    --format, -f <format>   Output format: svg (default) or png
    --out, -o <path>        Output file path (default: stdout for svg, ./palettd.png for png)
    --metadata <path>       Write layout metadata JSON to file

  Dimensions
    --width <n>             Canvas width (default: ${DEFAULT_OPTIONS.width})
    --height <n>            Canvas height (default: ${DEFAULT_OPTIONS.height})

  Colors
    --outer-bg <color>      Outer background color (default: ${DEFAULT_OPTIONS.outerBg})
    --card-bg <color>       Card background color (default: ${DEFAULT_OPTIONS.cardBg})
    --stroke <color>        Card stroke color (default: ${DEFAULT_OPTIONS.stroke})
    --stroke-opacity <n>    Stroke opacity 0-1 (default: ${DEFAULT_OPTIONS.strokeOpacity})

  Layout
    --card-radius <n>       Card border radius (default: ${DEFAULT_OPTIONS.cardRadius})
    --padding <n>           Card padding (default: ${DEFAULT_OPTIONS.padding})
    --gap <n>               Gap between swatches (default: ${DEFAULT_OPTIONS.gap})

  Typography
    --font <family>         Font family stack
    --title <text>          Optional title above swatches
    --footer-left <text>    Footer left text (default: ${DEFAULT_OPTIONS.footerLeft})
    --footer-center <text>  Footer center text (default: ${DEFAULT_OPTIONS.footerCenter})
    --footer-right <text>   Footer right text (default: ${DEFAULT_OPTIONS.footerRight})

  Display
    --show-hex              Show hex codes on swatches (default: ${DEFAULT_OPTIONS.showHex})
    --no-hex                Hide hex codes
    --show-name             Show color names on swatches (default: ${DEFAULT_OPTIONS.showName})
    --no-name               Hide color names

  Naming
    --names <strategy>      auto (default), none, or provided
    --order <strategy>      input (default) or lch (sort by hue/lightness)

  Help
    --help, -h              Show this help message
    --version, -v           Show version number

EXAMPLES
  palettd "#FAF5E9" "#392525" "#683226" --format png --out palette.png
  palettd --input colors.json --format svg > palette.svg
  palettd "#ff6600" "#0b1320" --title "Acme Palette" --footer-right "01"

INPUT FILE FORMAT
  {
    "colors": ["#ff6600", "#0b1320", ...],
    "names": { "#FF6600": "Safety Orange", "#0B1320": "Rich Black" }
  }
`;

interface CliOptions {
  colors: string[];
  input?: string;
  format: OutputFormat;
  out?: string;
  metadata?: string;
  width: number;
  height: number;
  outerBg: string;
  cardBg: string;
  stroke: string;
  strokeOpacity: number;
  cardRadius: number;
  padding: number;
  gap: number;
  font: string;
  title?: string;
  footerLeft: string;
  footerCenter: string;
  footerRight: string;
  showHex: boolean;
  showName: boolean;
  names: NamingStrategy;
  order: OrderStrategy;
  providedNames?: Record<string, string>;
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    colors: [],
    format: DEFAULT_OPTIONS.format,
    width: DEFAULT_OPTIONS.width,
    height: DEFAULT_OPTIONS.height,
    outerBg: DEFAULT_OPTIONS.outerBg,
    cardBg: DEFAULT_OPTIONS.cardBg,
    stroke: DEFAULT_OPTIONS.stroke,
    strokeOpacity: DEFAULT_OPTIONS.strokeOpacity,
    cardRadius: DEFAULT_OPTIONS.cardRadius,
    padding: DEFAULT_OPTIONS.padding,
    gap: DEFAULT_OPTIONS.gap,
    font: DEFAULT_OPTIONS.font,
    footerLeft: DEFAULT_OPTIONS.footerLeft,
    footerCenter: DEFAULT_OPTIONS.footerCenter,
    footerRight: DEFAULT_OPTIONS.footerRight,
    showHex: DEFAULT_OPTIONS.showHex,
    showName: DEFAULT_OPTIONS.showName,
    names: DEFAULT_OPTIONS.names,
    order: DEFAULT_OPTIONS.order,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    // Handle flags
    if (arg === '--help' || arg === '-h') {
      process.stdout.write(HELP);
      process.exit(0);
    }

    if (arg === '--version' || arg === '-v') {
      process.stdout.write(`palettd v${VERSION}\n`);
      process.exit(0);
    }

    // Boolean flags
    if (arg === '--show-hex') {
      options.showHex = true;
      i++;
      continue;
    }
    if (arg === '--no-hex') {
      options.showHex = false;
      i++;
      continue;
    }
    if (arg === '--show-name') {
      options.showName = true;
      i++;
      continue;
    }
    if (arg === '--no-name') {
      options.showName = false;
      i++;
      continue;
    }

    // Options with values
    if (arg === '--input' || arg === '-i') {
      options.input = args[++i];
      i++;
      continue;
    }
    if (arg === '--format' || arg === '-f') {
      const fmt = args[++i];
      if (fmt !== 'svg' && fmt !== 'png') {
        console.error(`Error: Invalid format "${fmt}". Use svg or png.`);
        process.exit(1);
      }
      options.format = fmt;
      i++;
      continue;
    }
    if (arg === '--out' || arg === '-o') {
      options.out = args[++i];
      i++;
      continue;
    }
    if (arg === '--metadata') {
      options.metadata = args[++i];
      i++;
      continue;
    }
    if (arg === '--width') {
      options.width = parseInt(args[++i], 10);
      i++;
      continue;
    }
    if (arg === '--height') {
      options.height = parseInt(args[++i], 10);
      i++;
      continue;
    }
    if (arg === '--outer-bg') {
      options.outerBg = args[++i];
      i++;
      continue;
    }
    if (arg === '--card-bg') {
      options.cardBg = args[++i];
      i++;
      continue;
    }
    if (arg === '--stroke') {
      options.stroke = args[++i];
      i++;
      continue;
    }
    if (arg === '--stroke-opacity') {
      options.strokeOpacity = parseFloat(args[++i]);
      i++;
      continue;
    }
    if (arg === '--card-radius') {
      options.cardRadius = parseInt(args[++i], 10);
      i++;
      continue;
    }
    if (arg === '--padding') {
      options.padding = parseInt(args[++i], 10);
      i++;
      continue;
    }
    if (arg === '--gap') {
      options.gap = parseInt(args[++i], 10);
      i++;
      continue;
    }
    if (arg === '--font') {
      options.font = args[++i];
      i++;
      continue;
    }
    if (arg === '--title') {
      options.title = args[++i];
      i++;
      continue;
    }
    if (arg === '--footer-left') {
      options.footerLeft = args[++i];
      i++;
      continue;
    }
    if (arg === '--footer-center') {
      options.footerCenter = args[++i];
      i++;
      continue;
    }
    if (arg === '--footer-right') {
      options.footerRight = args[++i];
      i++;
      continue;
    }
    if (arg === '--names') {
      const val = args[++i] as NamingStrategy;
      if (val !== 'auto' && val !== 'none' && val !== 'provided') {
        console.error(`Error: Invalid naming strategy "${val}". Use auto, none, or provided.`);
        process.exit(1);
      }
      options.names = val;
      i++;
      continue;
    }
    if (arg === '--order') {
      const val = args[++i] as OrderStrategy;
      if (val !== 'input' && val !== 'lch') {
        console.error(`Error: Invalid order strategy "${val}". Use input or lch.`);
        process.exit(1);
      }
      options.order = val;
      i++;
      continue;
    }

    // Unknown flag
    if (arg.startsWith('-')) {
      console.error(`Error: Unknown option "${arg}"`);
      console.error('Run "palettd --help" for usage information.');
      process.exit(1);
    }

    // Positional argument (color)
    options.colors.push(arg);
    i++;
  }

  return options;
}

function loadInputFile(path: string): { colors: string[]; names?: Record<string, string> } {
  const fullPath = resolve(path);

  if (!existsSync(fullPath)) {
    console.error(`Error: Input file not found: ${path}`);
    process.exit(1);
  }

  try {
    const content = readFileSync(fullPath, 'utf-8');
    const data: InputFile = JSON.parse(content);

    if (!Array.isArray(data.colors) || data.colors.length === 0) {
      console.error('Error: Input file must contain a non-empty "colors" array.');
      process.exit(1);
    }

    return {
      colors: data.colors,
      names: data.names,
    };
  } catch (err) {
    console.error(`Error: Failed to parse input file: ${(err as Error).message}`);
    process.exit(1);
  }
}

function run(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    process.stdout.write(HELP);
    process.exit(0);
  }

  const options = parseArgs(args);

  // Load colors from input file if specified
  if (options.input) {
    const { colors, names } = loadInputFile(options.input);
    options.colors = colors;
    if (names && options.names === 'provided') {
      options.providedNames = names;
    } else if (names) {
      // Auto-enable provided names if file has names
      options.names = 'provided';
      options.providedNames = names;
    }
  }

  // Validate we have colors
  if (options.colors.length === 0) {
    console.error('Error: No colors provided.');
    console.error('Usage: palettd <color1> <color2> ... [options]');
    console.error('       palettd --input colors.json [options]');
    process.exit(1);
  }

  // Build board options
  const boardOptions: BoardOptions = {
    format: options.format,
    width: options.width,
    height: options.height,
    outerBg: options.outerBg,
    cardBg: options.cardBg,
    cardRadius: options.cardRadius,
    padding: options.padding,
    gap: options.gap,
    stroke: options.stroke,
    strokeOpacity: options.strokeOpacity,
    font: options.font,
    title: options.title,
    footerLeft: options.footerLeft,
    footerCenter: options.footerCenter,
    footerRight: options.footerRight,
    showHex: options.showHex,
    showName: options.showName,
    names: options.names,
    providedNames: options.providedNames,
    order: options.order,
  };

  // Generate board
  let result;
  try {
    result = generateBoard(options.colors, boardOptions);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }

  // Write metadata if requested
  if (options.metadata) {
    const metadata: MetadataOutput = {
      colors: options.colors,
      palette: result.palette.map((p, i) => ({
        input: p.input,
        hex: p.hex,
        name: p.name,
        textColor: p.textColor,
        index: p.index,
        position: {
          x: result.layout.swatches[i]?.x ?? 0,
          y: result.layout.swatches[i]?.y ?? 0,
        },
        size: {
          width: result.layout.swatches[i]?.width ?? 0,
          height: result.layout.swatches[i]?.height ?? 0,
        },
      })),
      options: boardOptions,
    };

    writeFileSync(resolve(options.metadata), JSON.stringify(metadata, null, 2));
  }

  // Output result
  if (options.format === 'png') {
    const outPath = options.out || './palettd.png';
    writeFileSync(resolve(outPath), result.png!);
    console.error(`PNG written to ${outPath}`);
  } else {
    // SVG output
    if (options.out) {
      writeFileSync(resolve(options.out), result.svg);
      console.error(`SVG written to ${options.out}`);
    } else {
      // Output to stdout
      process.stdout.write(result.svg);
    }
  }
}

run();
