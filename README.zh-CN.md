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

##### cjs
```
const svgtvi = require('@svgtvi/core')
```

##### esm
```
import svgtvi from '@svgtvi/core'
```


```javascript
svgtvi({
    input: './source',
    output: 'dist',
    clean: true,
    plugins: ['@svgtvi/plugin-preview']
})
.then(() => {
    console.log('Successfully!');
})
.catch(error => {
    console.error('Failed!');
})
```
