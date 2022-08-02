import { readdir } from 'fs/promises'
import { join, resolve } from 'node:path'
import { remove, mkdirs } from 'fs-extra'
import { readFolder } from './utils'
import { SVGTVCConfig } from './types'

export default async function svgtvc(options?: SVGTVCConfig) {
  try {
    const { input, output = 'dist', clear = true } = options ?? {}

    const outputPath = join(resolve(), output)

    if (!input) {
      console.error('svgtvc: miss "input" in options')
      return
    }

    if (options?.clear) await remove(outputPath)

    await mkdirs(outputPath)

    const files = await readFolder(join(resolve(), input))

    console.log(files)
  } catch (error) {
    console.error('svgtvc: an error occurred! ', error)
  }
}

svgtvc({
  input: './svgs'
})
