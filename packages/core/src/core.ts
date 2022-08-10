import { JSDOM } from 'jsdom'
import { join } from 'node:path'
import { statSync } from 'node:fs'
import { mkdirs } from 'fs-extra'
import { transformAsync } from '@babel/core'
import { readdir, readFile, writeFile } from 'fs/promises'
import { pascalCase } from 'change-case'
import { optimize, OptimizedSvg, OptimizeOptions } from 'svgo'
import { compileTemplate, compileScript, parse } from '@vue/compiler-sfc'
import TransformModulesCommonJSPlugin from '@babel/plugin-transform-modules-commonjs'
import {
  TemplateParser,
  SVGFile,
  SVGTVIFragement,
  SVGFolder,
  Plugin,
  PluginBase,
  ImportPlugin,
  FunctionalPlugin
} from './types'

/**
 * serialize fragment
 * @param fragment
 * @returns
 */
export const createSVGTVIFragment = (
  fragment: DocumentFragment
): SVGTVIFragement => {
  const serialize = () =>
    Array.from(fragment.children).reduce((acc: string, element: Element) => {
      return (acc += element.outerHTML)
    }, '')

  return Object.assign(fragment, { serialize })
}

/**
 * default sfc template
 * @param fragment
 * @returns
 */
export const defaultTemplate: TemplateParser = (fragment: SVGTVIFragement) => {
  return `<script setup>
  </script>
  <template>
    ${fragment.serialize()}
  </template>
  `
}

/**
 * read two level folders
 * @param path
 * @param level
 * @returns
 */
export async function readFolders(
  path: string,
  level = 2
): Promise<Array<SVGFolder | SVGFile>> {
  if (!level) return []
  level--
  const fileNames = await readdir(path)
  const folders: Array<SVGFolder | SVGFile> = []
  for await (const fileName of fileNames) {
    if (/^\./.test(fileName)) continue
    const filePath = join(path, fileName)
    const isDirectory = statSync(filePath).isDirectory()
    if (isDirectory && !level) continue
    if (isDirectory) {
      const directory = await readFolders(filePath, level)
      folders.push({
        name: fileName,
        path: filePath,
        children: directory as SVGFile[]
      })
    } else {
      folders.push({
        name: fileName.replace(/(.+).svg/, '$1'),
        fileName: fileName,
        path: filePath
      })
    }
  }
  return folders
}

/**
 * import plugin by name
 * @param name
 * @returns
 */
export async function importPluign(name: string): Promise<ImportPlugin> {
  try {
    const plugin = await import(name)
    return { apply: plugin.default().apply, plugin: plugin.default }
  } catch (error) {
    console.error('svgtci: ', error)
    return { error }
  }
}

/**
 * split plugins
 * @param plugins
 * @returns
 */
export async function splitPlugins(
  plugins: Plugin[]
): Promise<Record<string, Plugin[]>> {
  const buildPlugins: Plugin[] = []

  for await (const plugin of plugins) {
    if (typeof plugin === 'string') {
      const { error, apply, plugin: importedPlugin } = await importPluign(
        plugin
      )
      if (error) continue
      if (apply === 'build' && typeof importPluign === 'function') {
        buildPlugins.push((importedPlugin as FunctionalPlugin)({}))
      }
    } else if (typeof plugin === 'object') {
      const { name, apply, params, handler } = plugin as PluginBase
      if (!handler) {
        const {
          error,
          apply: importedApply,
          plugin: importedPlugin
        } = await importPluign(`@svgtvi/plugin-${name}`)
        if (error) continue
        if (importedApply === 'build' && typeof importPluign === 'function') {
          buildPlugins.push((importedPlugin as FunctionalPlugin)(params))
        }
      } else if (apply === 'build') {
        buildPlugins.push(plugin)
      }
    } else if (typeof plugin === 'function') {
      buildPlugins.push(plugin({}))
    }
  }

  return {
    buildPlugins
  }
}

/**
 * optimize svg by svgo
 * @param raw
 * @param svgoConfig
 * @returns
 */
export function optimizeSvg(raw: string, svgoConfig?: OptimizeOptions): string {
  const config = svgoConfig ?? {
    plugins: [
      'preset-default',
      {
        name: 'addAttributesToSVGElement',
        params: {
          attributes: [
            { width: '1em' },
            { height: '1em' },
            { fill: 'currentColor' },
            { 'aria-hidden': 'true' },
            { focusable: 'false' }
          ]
        }
      }
    ]
  }
  const { error, ...optimized } = optimize(raw, config)
  if (error) console.error('svgtvi: optimize svg error ', error)
  return error ? raw : (optimized as OptimizedSvg).data
}

/**
 * generate scf template
 * @param svgFile
 * @param template
 * @param svgoConfig
 * @returns
 */
export async function generateTemplate(
  svgFile: SVGFile,
  template?: TemplateParser,
  svgoConfig?: OptimizeOptions
): Promise<string> {
  try {
    const raw = await readFile(svgFile.path, { encoding: 'utf-8' })
    const optimizedRaw = optimizeSvg(raw, svgoConfig)
    const templateParser = template ?? defaultTemplate
    const fragment = JSDOM.fragment(optimizedRaw)

    if (!fragment.firstChild) {
      throw new TypeError('svgtvi: Parse file error!')
    }
    const svgtviFragment = createSVGTVIFragment(fragment)
    return templateParser(svgtviFragment)
  } catch (error) {
    console.error(error)
    throw error
  }
}

/**
 * compiler raw template to code
 * @param svgFile
 * @returns
 */
export function compiler(svgFile: SVGFile): string {
  if (!svgFile.tpl) return ''
  let code = ''
  const { descriptor } = parse(svgFile.tpl)

  if (descriptor.scriptSetup) {
    const result = compileScript(descriptor, {
      inlineTemplate: true,
      id: svgFile.name,
      isProd: true
    })
    code = result.content
  } else {
    const result = compileTemplate({
      source:
        descriptor?.template?.type === 'template'
          ? descriptor?.template?.content
          : svgFile.tpl,
      filename: svgFile.name,
      id: svgFile.name,
      isProd: true
    })
    code = result.code += '\nexport default { render }'
  }
  return code
}

/**
 * transform esm to cjs
 * @param code
 * @returns
 */
export async function transformToCjs(code: string): Promise<string> {
  const result = await transformAsync(code, {
    plugins: [TransformModulesCommonJSPlugin]
  })
  return result?.code ?? ''
}

/**
 * generate type and code file
 * @param outputPath
 * @param code
 * @param componentName
 * @param customPropsType
 */
export async function generateFile(
  outputPath: string,
  code: string,
  componentName: string,
  customPropsType?: string
) {
  const type = `import { FunctionalComponent, HTMLAttributes, VNodeProps } from "vue"
declare const ${componentName}: FunctionalComponent<HTMLAttributes & VNodeProps>
export default ${componentName}`
  await writeFile(join(outputPath, `${componentName}.js`), code)
  await writeFile(join(outputPath, `${componentName}.d.ts`), type)
}

/**
 * generate export file
 * @param outputPath
 * @param svgFiles
 */
export async function generateExportFile(
  outputPath: string,
  svgFiles: SVGFile[]
) {
  const { cjs, esm, type } = svgFiles.reduce(
    (acc, { componentName }: SVGFile) => {
      acc.cjs += `module.exports.${componentName} = require('./${componentName}.js')\n`
      acc.esm += `export { default as ${componentName} } from './${componentName}.js'\n`
      acc.type += `export { default as ${componentName} } from './${componentName}'\n`
      return acc
    },
    { cjs: '', esm: '', type: '' }
  )
  await writeFile(join(outputPath, 'index.js'), cjs)
  await writeFile(join(outputPath, 'index.d.ts'), type)
  await writeFile(join(outputPath, 'esm/index.js'), esm)
  await writeFile(join(outputPath, 'esm/index.d.ts'), type)
}

export async function generate(
  path: string,
  folder: SVGFile | SVGFolder,
  template?: TemplateParser,
  svgoConfig?: OptimizeOptions,
  prefix?: string,
  suffix?: string
) {
  const files = (folder.children || [folder]) as SVGFile[]
  const outputPath = join(path, folder.children ? folder.name : '')
  for await (const file of files) {
    await mkdirs(join(outputPath, 'esm'))
    const tpl = await generateTemplate(file, template, svgoConfig)
    const componentName = prefix + pascalCase(file.name) + suffix
    const esmCode = compiler({ ...file, tpl })
    const cjsCode = await transformToCjs(esmCode)
    await generateFile(outputPath, cjsCode, componentName)
    await generateFile(join(outputPath, 'esm'), esmCode, componentName)
    Object.assign(file, { componentName, output: outputPath })
  }
  await generateExportFile(outputPath, files)
}
