import { join, resolve } from 'node:path'
import { remove, mkdirs } from 'fs-extra'
import { readFolders, generate } from './core'
import { BUILD_PLUGINS } from './constants'
import {
  FunctionalBuildPlugin,
  PluginBase,
  SVGFile,
  SVGFolder,
  SVGTVIConfig
} from './types'

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

    const buildPlugins = plugins.filter(plugin => {
      if (typeof plugin === 'string') {
        return BUILD_PLUGINS.includes(plugin)
      } else if (typeof plugin === 'object' && typeof plugin !== 'function') {
        return (plugin as PluginBase).apply === 'build'
      } else if (typeof plugin === 'function') {
        return (plugin as FunctionalBuildPlugin)({}).apply === 'build'
      }
      return false
    })

    console.log('plugins: ', buildPlugins)
  } catch (error) {
    console.error('svgtvi: an error occurred! ', error)
  }
}

svgtvi({
  input: '../../svgs',
  clean: true
})
