import type { OptimizeOptions } from 'svgo'
import { PLIGINS } from './constants'

export type TemplateParser = (fragment: SVGTVIFragement) => string

export interface PluginBase {
  name: string
  apply: string
}

export interface BuildPlugin extends PluginBase {
  excutor: () => void
}

export type FunctionalBuildPlugin = (options: Record<string, unknown>) => BuildPlugin

export type FunctionalPlugin = FunctionalBuildPlugin

export type Plugin = typeof PLIGINS[number] | BuildPlugin | FunctionalPlugin

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

export interface SVGFile {
  name: string
  fileName: string
  path: string
  raw?: string
  tpl?: string
  children?: unknown
}

export interface SVGFolder {
  name: string
  path: string
  children: SVGFile[]
}

export interface SVGTVIFragement extends DocumentFragment {
  serialize: () => string
}
