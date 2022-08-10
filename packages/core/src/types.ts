import type { OptimizeOptions } from 'svgo'

export interface SVGFile {
  name: string
  fileName: string
  path: string
  componentName?: string
  raw?: string
  tpl?: string
  children?: unknown
  output?: string
}

export interface SVGFolder {
  name: string
  path: string
  children: SVGFile[]
}

export interface SVGTVIFragement extends DocumentFragment {
  serialize: () => string
}

export type TemplateParser = (fragment: SVGTVIFragement) => string

export interface PluginBase {
  name: string
  apply: string
  params?: Record<string, unknown>
  handler?: (options?: BuildPluginOptions) => void
}

export interface BuildPluginOptions {
  folders: Array<SVGFile | SVGFolder>
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
  clean?: boolean
  template?: TemplateParser
  prefix?: string
  suffix?: string
  svgoConfig?: OptimizeOptions
  plugins?: Plugin[]
}
