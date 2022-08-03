export type TemplateParser = (fragment: SVGTVCFragement) => string

export interface SVGTVCConfig {
  input: string
  output?: string
  clear?: boolean
  template?: TemplateParser
  svgoConfig?: any
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
