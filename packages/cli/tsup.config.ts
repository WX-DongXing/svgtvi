import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'lib',
  format: ['cjs'],
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: true
})
