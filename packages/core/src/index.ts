import { join, resolve } from 'node:path'
import { remove, mkdirs } from 'fs-extra'
import { readFolders, generate, splitPlugins } from './core'
import { SVGFile, SVGFolder, SVGTVIConfig, PluginBase } from './types'

export * from './types'

export default async function svgtvi(options?: SVGTVIConfig) {
  try {
    const {
      input,
      output = 'dist',
      clean = false,
      prefix = '',
      suffix = '',
      plugins = [],
      template,
      svgoConfig
    } = options ?? {}

    const outputPath = join(resolve(), output)

    if (!input) {
      console.error('svgtvi: miss "input" in options')
      return
    }

    if (!Array.isArray(plugins)) {
      console.error('svgtvi: "pligins" should be an array')
      return
    }

    if (clean) {
      await remove(outputPath)
      await mkdirs(outputPath)
    }

    const { buildPlugins } = await splitPlugins(plugins)

    let folders = await readFolders(join(resolve(), input))

    const hasFolder = folders.some(folder => !!folder.children)

    if (hasFolder) {
      folders = folders.reduce(
        (acc: SVGFolder[], folder: SVGFile | SVGFolder) => {
          if (folder.children) {
            acc.push(folder as SVGFolder)
          } else {
            acc[0].children.push(folder as SVGFile)
          }
          return acc
        },
        [
          {
            name: 'ungrounped',
            path: join(resolve(), input, 'ungrounped'),
            children: []
          }
        ]
      )
    }

    for await (const folder of folders) {
      await generate(outputPath, folder, template, svgoConfig, prefix, suffix)
    }

    // mount plugins after build
    for await (const plugin of buildPlugins) {
      const { handler } = plugin as PluginBase
      handler && handler({ output, folders })
    }
  } catch (error) {
    console.error('svgtvi: an error occurred! ', error)
  }
}
