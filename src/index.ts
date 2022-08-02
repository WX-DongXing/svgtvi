import { join, resolve } from 'node:path'
import { remove, mkdirs } from 'fs-extra'
import { readFolder, generateTemplate, compiler } from './utils'
import { SVGTVCConfig } from './types'

export default async function svgtvc(options?: SVGTVCConfig) {
  try {
    const { input, output = 'dist', clear = true, template } = options ?? {}

    const outputPath = join(resolve(), output)

    if (!input) {
      console.error('svgtvc: miss "input" in options')
      return
    }

    if (clear) await remove(outputPath)

    await mkdirs(outputPath)

    const files = await readFolder(join(resolve(), input))

    for await (const file of [files[0]]) {
      const code = await generateTemplate(file, template)
      const content = compiler({ ...file, code })
    }
  } catch (error) {
    console.error('svgtvc: an error occurred! ', error)
  }
}

svgtvc({
  input: './svgs'
})
