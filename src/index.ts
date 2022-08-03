import { join, resolve } from 'node:path'
import { remove, mkdirs } from 'fs-extra'
import {
  readFolder,
  generateTemplate,
  compiler,
  transformToCjs,
  generateFile,
  generateExportFile
} from './utils'
import { SVGTVCConfig } from './types'

export default async function svgtvc(options?: SVGTVCConfig) {
  try {
    const { input, output = 'dist', clean = false, template } = options ?? {}

    const outputPath = join(resolve(), output)

    if (!input) {
      console.error('svgtvc: miss "input" in options')
      return
    }

    if (clean) await remove(outputPath)

    await mkdirs(join(outputPath, 'esm'))

    const files = await readFolder(join(resolve(), input))

    for await (const file of files) {
      const tpl = await generateTemplate(file, template)
      const esmCode = compiler({ ...file, tpl })
      const cjsCode = await transformToCjs(esmCode)
      await generateFile(outputPath, cjsCode, file.componentName)
      await generateFile(join(outputPath, 'esm'), esmCode, file.componentName)
    }

    await generateExportFile(outputPath, files)
  } catch (error) {
    console.error('svgtvc: an error occurred! ', error)
  }
}
