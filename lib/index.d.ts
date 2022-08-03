declare type TemplateParser = (fragment: SVGTVCFragement) => string;
interface SVGTVCConfig {
    input: string;
    output?: string;
    clean?: boolean;
    template?: TemplateParser;
    svgoConfig?: any;
}
interface SVGTVCFragement extends DocumentFragment {
    serialize: () => string;
}

declare function svgtvc(options?: SVGTVCConfig): Promise<void>;

export { svgtvc as default };
