import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'lib',
  format: ['cjs', 'esm'],
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: true,
  esbuildOptions(options) {
    if (options.format === 'cjs') {
      options.footer = {
        js: 'module.exports = module.exports.default'
      }
    }
  }
})
