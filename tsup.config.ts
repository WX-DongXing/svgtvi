import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  outDir: 'lib',
  format: ['cjs', 'esm'],
  splitting: true,
  sourcemap: false,
  clean: true,
  dts: true
})
