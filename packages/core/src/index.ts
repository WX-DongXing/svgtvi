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

    await remove(outputPath)

    await mkdirs(outputPath)

    const { buildPlugins } = await splitPlugins(plugins)

    let folders = await readFolders(join(resolve(), input), 2, prefix, suffix)

    const { hasFolder, hasFile } = folders.reduce(
      (acc, cur) => {
        if (!acc.hasFolder) {
          acc.hasFolder = (cur?.children ?? []).length > 0
        }
        if (!acc.hasFile) {
          acc.hasFile = !cur.children
        }
        return acc
      },
      { hasFolder: false, hasFile: false }
    )

    if (hasFolder) {
      const ungrouped = [
        {
          name: 'ungrounded',
          camelCaseName: 'ungrouped',
          paramCaseName: 'ungrouped',
          pascalCaseName: 'Ungrouped',
          path: join(resolve(), input, 'ungrouped'),
          children: []
        }
      ]

      folders = folders.reduce(
        (acc: SVGFolder[], folder: SVGFile | SVGFolder) => {
          if (folder.children) {
            acc.push(folder as SVGFolder)
          } else {
            acc[0].children.push(folder as SVGFile)
          }
          return acc
        },

        hasFile ? ungrouped : []
      )
    }

    for await (const folder of folders) {
      await generate(outputPath, folder, template, svgoConfig)
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
