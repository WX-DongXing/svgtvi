import { join, resolve } from 'node:path'
import { remove, mkdirs } from 'fs-extra'
import {
  readFolder,
  generateTemplate,
  compiler,
  transformToCjs,
  generateFile,
  generateExportFile
} from './core'
import { SVGTVCConfig } from './types'

export default async function svgtvc(options?: SVGTVCConfig) {
  try {
    const {
      input,
      output = 'dist',
      clean = false,
      prefix = '',
      suffix = '',
      template,
      svgoConfig
    } = options ?? {}

    const outputPath = join(resolve(), output)

    if (!input) {
      console.error('svgtvc: miss "input" in options')
      return
    }

    if (clean) await remove(outputPath)

    await mkdirs(join(outputPath, 'esm'))

    const files = await readFolder(join(resolve(), input))

    for await (const file of files) {
      const tpl = await generateTemplate(file, template, svgoConfig)
      const esmCode = compiler({ ...file, tpl })
      const cjsCode = await transformToCjs(esmCode)
      await generateFile(
        outputPath,
        cjsCode,
        file.componentName,
        prefix,
        suffix
      )
      await generateFile(
        join(outputPath, 'esm'),
        esmCode,
        file.componentName,
        prefix,
        suffix
      )
    }

    await generateExportFile(outputPath, files, prefix, suffix)
  } catch (error) {
    console.error('svgtvc: an error occurred! ', error)
  }
}
