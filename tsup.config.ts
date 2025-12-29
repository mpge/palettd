import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  target: 'node20',
  shims: true,
  banner: ({ format }) => {
    if (format === 'esm') {
      return {
        js: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
      };
    }
    return {};
  },
});
