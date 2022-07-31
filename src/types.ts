export interface SVGTVCConfig {
  input: string;
  output?: string;
  clear?: boolean;
  template?: string;
  svgoConfig?: any;
}

export interface SVGFile {
  name: string;
  path: string;
  raw?: string;
}
