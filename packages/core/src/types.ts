import type { OptimizeOptions } from 'svgo'
import { PLIGINS } from './constants'

export type TemplateParser = (fragment: SVGTVIFragement) => string

export interface FunctionalPluginBase {
  name: string
  apply: string
}

export interface FunctionalBuildPlugin extends FunctionalPluginBase {
  excutor: () => void
}

export type FunctionalPlugin = (options: Record<string, unknown>) => FunctionalBuildPlugin

export type Plugin = typeof PLIGINS[number] | FunctionalPlugin

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
  componentName: string
  path: string
  raw?: string
  tpl?: string
}

export interface SVGTVIFragement extends DocumentFragment {
  serialize: () => string
}
