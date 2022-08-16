<div align="center">
    <img src="./assets/logo.svg" height="84" />
    <h1>svgtvi</h1>
    <p> 🔨 [ ✨ 🎉 🎊 ] -> 📦</p>
    <p>Transform svgs to vue icon, easy to generate an icon package.</p>
</div>

<p align='center'>
<b>English</b> | <a href="https://github.com/WX-DongXing/svgtvi/blob/main/README.zh-CN.md">简体中文</a>
</p>

## Features

- ✨ Embracing the future, only supports the generation of icon components adapted to [vue3](https://cn.vuejs.org/)
- ⚡️ Used [svgo](https://github.com/svg/svgo)，support preprocessing, compression, etc
- 📦️ Support command line, one line of command can generate an icon library
- 🌲 Support processing and packaging of multiple groups
- 🏗️ Supports compiling templates and personalized icon components
- 🔌 Support custom plugins, built-in preview plugin, and generate preview page

## Example
[svgtvi-example-icons](https://github.com/WX-DongXing/svgtvi-example-icons): the example icons created by svgtvi

## Use
### Command Line
```
pnpm install @svgtvi/cli -g
```

```
svgtvi <cmd> [args]

Options:
  -i, --input    Input directory relative to the root directory
  -o, --output   Output directory
  -p, --prefix   Icon name prefix
  -s, --suffix   Icon name suffix
  -v, --version  Show version number                                   [boolean]
  -h, --help     Show help                                             [boolean]
```

### Code
```
pnpm install @svgtvi/core --dev
```

#### cjs
```
const svgtvi = require('@svgtvi/core')
```

#### esm
```
import svgtvi from '@svgtvi/core'
```


```javascript
svgtvi({
  input: './source',
  output: 'dist',
  plugins: ['@svgtvi/plugin-preview']
})
.then(() => {
    console.log('Successfully!');
})
.catch(error => {
    console.error('Failed!');
})
```

## Options
```
await svgtvi(options)
```

### input
> Types: `String`
> Required

SVG resource folder path

### output
> Types: `String`
> Default Value: 'dist'

output folder path

### prefix
> Types: `String`
> Default Value: 

Output icon prefix, which will be converted to [pascalCase](https://github.com/blakeembrey/change-case) format together with file name and suffix

### suffix
> Types: `String`
> Default Value: ''

Output icon suffix, which will be converted to [pascalCase](https://github.com/blakeembrey/change-case) format together with prefix and file name


### template
> Types: `(options: TemplateParserOptions) => string`

Compile template, Vue single file component (SFC), whose core is to convert SVG to SFC and compile it into JS using [@vue/compiler-sfc](https://github.com/vuejs/core/tree/main/packages/compiler-sfc)


```
await svgtvi({
  input: './source',
  template: ({ fragment, group }) => {
      return fragment.serialize()
  }
})
```

```
interface SVGTVIFragment extends DocumentFragment {
  serialize: () => string
  find: (selector: string, attr?: string, value?: string) => {
    set: (prop: string, propValue: string) => void
  }
}

interface TemplateParserOptions {
  fragment: SVGTVIFragment
  group: string
}
```

#### fragment
SVG Dom Object，can use DOM native methods，such as `getElementById`、`querySelectorAll`

`serialize`：Convert DOM to string and return

`find`: `querySelectorAll` Simple packaging，use `find('path', 'fill', 'red').set('fill', 'currentColor')`

#### group
The folder name in the case of multi folder SVG can facilitate the configuration of different templates for different folders

##### If you need to customize icons, such as two-color icons, you can customize logic
```
await svgtvi({
  input: './source',
  template: ({ fragment, group }) => {

    fragment
        .find('path', 'fill', '#eee')
        .set('fill', 'theme')

    return `<script setup>
    import { computed } from 'vue'

    const props = defineProps({
        theme: 'light'
    })

    const color = computed(() => props.theme === 'light' ? 'black' : 'white')

    </script>
    <template>
    ${fragment.serialize()}
    </template>
      `
  }
})
```

will get the following
```
<script setup>
import { computed } from 'vue'

const props = defineProps({
  theme: 'light'
})

const color = computed(() => props.theme === 'light' ? 'black' : 'white')

</script>
<template>
  <svg ...>
      <path fill="grey" ...>
      <path :fill="theme" ...>
  </svg>
</template>
```

### svgoConfig
[svgo config](https://github.com/svg/svgo#configuration), preprocessed SVGs, and the following will be used by default [options](https://blog.prototypr.io/align-svg-icons-to-text-and-say-goodbye-to-font-icons-d44b3d7b26b4)

```
{
  plugins: [
    'preset-default',
    {
      name: 'addAttributesToSVGElement',
      params: {
        attributes: [
          { width: '1em' },
          { height: '1em' },
          { fill: 'currentColor' },
          { 'aria-hidden': 'true' },
          { focusable: 'false' }
        ]
      }
    }
  ]
}
```

### plugins
> Types: `Plugin[]`

Support custom plugin. Currently, only 'build' life cycle is supported

 `@svgtvi/plugin-preview`：Generate preview page

```
interface BuildPluginOptions {
  output: string
  folders: Array<SVGFile | SVGFolder>
}

interface PluginBase {
  name: string
  apply?: string
  params?: Record<string, unknown>
  handler?: (options?: BuildPluginOptions) => void
}

export type FunctionalPlugin = (params?: Record<string, unknown>, options?: BuildPluginOptions) => PluginBase

export type Plugin = string | PluginBase | FunctionalPlugin
```

```
await svgtvi({
  input: 'source',
  output: 'dist',
  plugins: ['@svgtvi/plugin-preview']
})

// or

await svgtvi({
  input: 'source',
  output: 'dist',
  plugins: [{
    name: 'preview',
    params: {
      name: ''
    }
  }]
})

// custom plugin

await svgtvi({
  input: 'source',
  output: 'dist',
  plugins: [
    {
      name: 'custom-plugin',
      apply: 'build',
      handler: (options: BuildPluginOptions) => {
        // ...
      }
    }
  ]
})
```

#### `@svgtvi/plugin-preview`

`params`: Use `package.json` configuration by default

- `logo`: Logo file path, will be copied to the output folder

```
interface PreviewPluginParams {
  name?: string
  version?: string
  description?: string
  repository?: string
  logo?: string
}

```

## License
[MIT](https://github.com/WX-DongXing/svgtvi/blob/main/LICENSE)

Copyright (c) 2022 Dong Xing



