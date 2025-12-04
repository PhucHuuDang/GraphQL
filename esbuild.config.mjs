import * as esbuild from 'esbuild';
import { glob } from 'node:fs/promises';
import path from 'node:path';

// Get all TypeScript files from src directory
const entryPoints = ['src/main.ts'];

await esbuild.build({
  entryPoints,
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outdir: 'dist',
  sourcemap: true,
  minify: false,
  keepNames: true,

  // Handle external packages (node_modules)
  packages: 'external',

  // Required for NestJS decorators
  define: {
    'process.env.NODE_ENV': '"production"',
  },

  // Banner to enable ESM features
  banner: {
    js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
`,
  },
});

console.log('✅ Build completed successfully!');
