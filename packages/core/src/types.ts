import type { OptimizeOptions } from 'svgo'

export interface SVGFile {
  name: string
  fileName: string
  path: string
  camelCaseName: string
  pascalCaseName: string
  raw?: string
  tpl?: string
  children?: any[]
  output?: string
}

export interface SVGFolder {
  name: string
  path: string
  pascalCaseName: string
  camelCaseName: string
  paramCaseName: string
  children: SVGFile[]
}

export interface SVGTVIFragment extends DocumentFragment {
  serialize: () => string
  find: (selector: string, attr?: string, value?: string) => {
    set: (prop: string, propValue: string) => void
  }
}

export interface TemplateParserOptions {
  fragment: SVGTVIFragment
  group: string
}

export type TemplateParser = (options: TemplateParserOptions) => string

export interface BuildPluginOptions {
  output: string
  folders: Array<SVGFile | SVGFolder>
}

export interface PluginBase {
  name: string
  apply?: string
  params?: Record<string, unknown>
  handler?: (options?: BuildPluginOptions) => void
}

export type FunctionalPlugin = (params?: Record<string, unknown>, options?: BuildPluginOptions) => PluginBase

export type Plugin = string | PluginBase | FunctionalPlugin

export interface ImportPlugin {
  apply?: string
  plugin?: Plugin
  error?: unknown
}

export interface SVGTVIConfig {
  input: string
  output?: string
  template?: TemplateParser
  prefix?: string
  suffix?: string
  svgoConfig?: OptimizeOptions
  plugins?: Plugin[]
}
