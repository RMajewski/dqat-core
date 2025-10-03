import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  platform: 'node',
  target: 'node22',
  treeshake: true,
  skipNodeModulesBundle: true,
});
