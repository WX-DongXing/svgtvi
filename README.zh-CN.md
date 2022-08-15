<div align="center">
    <img src="./assets/logo.svg" height="84" />
    <h1>svgtvi</h1>
    <p> 🔨 [ ✨ 🎉 🎊 ] -> 📦</p>
    <p>将 svgs 转为 vue icon 组件，十分简单生成图标库</p>
</div>

<p align='center'>
<b>简体中文</b> | <a href="https://github.com/WX-DongXing/svgtvi/blob/main/README.md">English</a>
</p>

## 特性
- ✨ 拥抱未来，只支持生成适配 [vue3](https://cn.vuejs.org/) 的图标组件
- ⚡️ 使用 [svgo](https://github.com/svg/svgo)，支持 svg 文件预处理、压缩等
- 📦️ 支持命令行，一行命令即可生成一个图标库
- 🌲 支持对多组 svg 进行处理和打包
- 🏗️ 支持编译模板，个性化构建图标组件
- 🔌 支持自定义插件，内置预览插件，生成预览页面

## 使用
### 命令行
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

### 代码
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

## 配置
```
await svgtvi(options)
```

### input
> 类型：`String`
> 必填

SVG 资源文件夹

### output
> 类型：`String`
> 默认值：dist

输出文件夹

### prefix
> 类型：`String`
> 默认值：''

输出 Icon 前缀，将与文件名和后缀一起转为 [pascalCase](https://github.com/blakeembrey/change-case) 格式

### suffix
> 类型：`String`
> 默认值：''

输出 Icon 后缀，将与前缀和文件名一起转为 [pascalCase](https://github.com/blakeembrey/change-case) 格式


### template
> 类型：`(options: TemplateParserOptions) => string`

编译模板，Vue 单文件组件 (SFC)，其核心便是将 SVG 转为 SFC，并使用 [@vue/compiler-sfc](https://github.com/vuejs/core/tree/main/packages/compiler-sfc) 将其编译为 JS

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
SVG Dom 对象，可使用 dom 原生方法，如 `getElementById`、`querySelectorAll` 等;

`serialize`：将 Dom 转为 string 并返回

`find`: querySelectorAll 简单封装，`find('path', 'fill', 'red').set('fill', 'currentColor')`

#### group
存在多文件夹 SVG 情况下的文件夹名称，可方便对不同文件夹配置不同的模板

#### 如果需要自定义图标，如双色图标，可自定义逻辑
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

将得到以下内容
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
[svgo 配置](https://github.com/svg/svgo#configuration)，可对 SVG 进行预处理，默认将使用以下[配置](https://blog.prototypr.io/align-svg-icons-to-text-and-say-goodbye-to-font-icons-d44b3d7b26b4)

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
> 类型：`Plugin[]`

支持自定义插件，目前仅支持 `build` 生命周期

`@svgtvi/plugin-preview`：创建预览页面

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

`params`: 默认使用当前文件夹 `package.json` 中的配置

- `logo`: Logo 文件地址, 将会复制到输出目录

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

