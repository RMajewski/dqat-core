import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/callback/index.ts',
    'src/setup/index.ts',
    'src/step/index.ts',
    'src/util/index.ts',
  ],
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
  tsconfig: './tsconfig.framework.json',
});
