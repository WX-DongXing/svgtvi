import type { OptimizeOptions } from 'svgo'

export type TemplateParser = (fragment: SVGTVCFragement) => string

export interface SVGTVCConfig {
  input: string
  output?: string
  clean?: boolean
  template?: TemplateParser
  prefix?: string
  suffix?: string
  svgoConfig?: OptimizeOptions
}

export interface SVGFile {
  name: string
  componentName: string
  path: string
  raw?: string
  tpl?: string
}

export interface SVGTVCFragement extends DocumentFragment {
  serialize: () => string
}