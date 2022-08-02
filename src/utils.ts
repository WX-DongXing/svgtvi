import { readdir, readFile } from 'fs/promises'
import { join } from 'node:path'
import { JSDOM } from 'jsdom'
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
  const a = ''
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
      .map((fileName: string) => ({
        name: fileName,
        path: join(path, fileName)
      }))
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
  if (!svgFile.code) return ''
  let code = ''
  const sfc = /<script>/.test(svgFile.code)
  if (sfc) {
    const { descriptor } = parse(svgFile.code)
    const result = compileScript(descriptor, {
      inlineTemplate: true,
      id: svgFile.name,
      isProd: true
    })
    code = result.content
  } else {
    const result = compileTemplate({
      source: svgFile.code,
      filename: svgFile.name,
      id: svgFile.name,
      isProd: true
    })
    code = result.code
  }
  return code
}
