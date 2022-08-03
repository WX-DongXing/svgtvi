import { JSDOM } from 'jsdom'
import { join } from 'node:path'
import { transformAsync } from '@babel/core'
import { readdir, readFile, writeFile } from 'fs/promises'
import { pascalCase } from 'change-case'
import TransformModulesCommonJSPlugin from '@babel/plugin-transform-modules-commonjs'
import { compileTemplate, compileScript, parse } from '@vue/compiler-sfc'
import { TemplateParser, SVGFile, SVGTVCFragement } from './types'

export const createSVGTVCFragment = (
  fragment: DocumentFragment
): SVGTVCFragement => {
  const serialize = () =>
    Array.from(fragment.children).reduce((acc: string, element: Element) => {
      return (acc += element.outerHTML)
    }, '')

  return Object.assign(fragment, { serialize })
}

export const defaultTemplate: TemplateParser = (fragment: SVGTVCFragement) => {
  return `<script setup>
  </script>
  <template>
    ${fragment.serialize()}
  </template>
  `
}

/**
 * get folder svg files
 * @param path
 * @returns
 */
export async function readFolder(path: string): Promise<SVGFile[]> {
  try {
    const fileNames = await readdir(path)
    return fileNames
      .filter((fileName: string) => /.svg$/.test(fileName))
      .map((fileName: string) => {
        const name = fileName.replace(/(.+).svg/, '$1')
        return {
          name,
          componentName: pascalCase(name),
          path: join(path, fileName)
        }
      })
  } catch (error) {
    console.error('svgtvc: read folder error! ', error)
    throw error
  }
}

export async function generateTemplate(
  svgFile: SVGFile,
  template?: TemplateParser
): Promise<string> {
  try {
    const raw = await readFile(svgFile.path, { encoding: 'utf-8' })
    const templateParser = template ?? defaultTemplate
    const fragment = JSDOM.fragment(raw)

    if (!fragment.firstChild) {
      throw new TypeError('svgtvc: Parse file error!')
    }

    const svgtvcFragment = createSVGTVCFragment(fragment)

    return templateParser(svgtvcFragment)
  } catch (error) {
    console.error(error)
    throw error
  }
}

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
      source: svgFile.tpl,
      filename: svgFile.name,
      id: svgFile.name,
      isProd: true
    })
    code = result.code += '\nexport default { render }'
  }
  return code
}

export async function transformToCjs(code: string): Promise<string> {
  const result = await transformAsync(code, {
    plugins: [TransformModulesCommonJSPlugin]
  })
  return result?.code ?? ''
}

export async function generateFile(
  outputPath: string,
  code: string,
  componentName: string,
  prefix?: string,
  suffix?: string,
  customPropsType?: string
) {
  const name = prefix + componentName + suffix
  const type = `import { FunctionalComponent, HTMLAttributes, VNodeProps } from "vue"
declare const ${name}: FunctionalComponent<HTMLAttributes & VNodeProps>
export default ${name}`
  await writeFile(join(outputPath, `${name}.js`), code)
  await writeFile(join(outputPath, `${name}.d.ts`), type)
}

export async function generateExportFile(
  outputPath: string,
  svgFiles: SVGFile[],
  prefix?: string,
  suffix?: string
) {
  const { cjs, esm } = svgFiles.reduce(
    (acc, { componentName }: SVGFile) => {
      const name = prefix + componentName + suffix
      acc.cjs += `module.exports.${name} = require('./${name}.js')\n`
      acc.esm += `export { default as ${name} } from './${name}'\n`
      return acc
    },
    { cjs: '', esm: '', type: '' }
  )
  await writeFile(join(outputPath, 'index.js'), cjs)
  await writeFile(join(outputPath, 'index.d.ts'), esm)
  await writeFile(join(outputPath, 'esm/index.js'), esm)
  await writeFile(join(outputPath, 'esm/index.d.ts'), esm)
}
