import { join } from 'node:path'
import { writeFile } from 'fs/promises'
import type { BuildPluginOptions } from '@svgtvi/core'

export interface PreviewPluginParams {
  name?: string
  version?: string
  description?: string
  repository?: string
}

interface IconImports {
  maps: string[]
  imports: string[]
  groups: string[]
}

async function buildPage(
  output, hasGroup, name, version,
  description, repository, maps, imports, groups
) {
  const template = hasGroup
    ? `
    <div class="group"
      v-for="{ name, icons } in groups"
      :key="name"
    >
      <h3 class="title">{{ name }}</h3>
      <div class="icons">
        <div class="icon"
          v-for="(icon, index) in icons"
          :key="index"
        >
          <component :is="icon" />
        </div>
      </div>
    </div>`
    : `
    <div class="group">
      <div
        class="icons"
        v-for="(icon, index) in groups"
        :key="index"
      >
        <div class="icon">
          <component :is="icon"/>
        </div>
      </div>
    </div>
    `
  const html = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Preview</title>
      <style>
        :root{--primary:0,131,255}html,body{position:relative;margin:0;padding:0;font-family:sans-serif}main{position:relative;display:flex;flex-flow:row nowrap;width:100vw;height:100vh;z-index:1;background:rgba(250,250,250,0.5);backdrop-filter:saturate(50%) blur(10px)}aside{position:relative;flex:none;display:flex;flex-flow:column nowrap;justify-content:space-between;align-items:center;width:340px;height:100vh;box-sizing:border-box;padding:72px 36px}aside::after{position:absolute;content:'';top:120px;right:0;height:calc(100vh - 240px);border-right:1px solid rgba(0,0,0,0.05)}aside .brand{display:flex;flex-flow:column nowrap;align-items:center}.brand h3{font-size:36px;color:transparent;background:linear-gradient(90deg,rgba(var(--primary),1),rgba(var(--primary),0.5));background-clip:text;-webkit-background-clip:text;margin:24px 0 12px}.brand h3 sup{font-size:18px;color:black}.brand p{color:black;font-size:14px;margin:0}section{width:100%;height:100vh;box-sizing:border-box;padding:72px 36px;overflow:auto}.group{width:100%}.icons{display:grid;grid-template-columns:repeat(auto-fit,64px);grid-gap:24px}.icon{flex:none;display:flex;justify-content:center;align-items:center;width:64px;height:64px;color:black;cursor:pointer;border-radius:16px;background:rgba(255,255,255,1);filter:drop-shadow(0 0 8px rgba(0,0,0,0.1));transition:all .1s;font-size:32px}.icon:hover{color:white;background:rgba(var(--primary),1);filter:drop-shadow(0 0 16px rgba(var(--primary),0.2))}.ellipse{position:fixed;z-index:0;border-radius:50%;background-color:rgba(0,131,255,0.7);box-shadow:0 0 100px rgba(0,0,0,0.25);filter:blur(100px)}.ellipse-right{width:360px;height:360px;top:-120px;right:60px}.ellipse-left{width:360px;height:360px;left:-60px;bottom:-120px}.ellipse-center{width:450px;height:120px;top:60%;left:40%}
      </style>
      <script type="importmap">
        {
          "imports": {
            "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js",
            ${maps.join(',\n')}
          }
        }
      </script>
    </head>
    <body>
      <main id="app">
        <aside>
          <div class="brand">
            Icon
            <h3>{{name}}<sup>{{version}}</sup></h3>
            <p>{{description}}</p>
          </div>
          <a href="${repository}"target="_blank"><svg height="32"aria-hidden="true"viewBox="0 0 16 16"version="1.1"width="32"data-view-component="true"class="octicon octicon-mark-github v-align-middle"><path fill-rule="evenodd"d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg></a>
        </aside>
        <section>
          ${template}
        </section>
      </main>
      <div class="ellipse ellipse-right"></div>
      <div class="ellipse ellipse-center"></div>
      <div class="ellipse ellipse-left"></div>
      <script type="module">
        import { createApp, computed } from 'vue'
        ${imports.join('\n')}

        const app = createApp({
          setup() {
            return {
              name: "${name}",
              version: "${version}",
              description: "${description}",
              repository: "${repository}",
              groups: [${groups}]
            }
          }
        })
      // app.component()
      app.mount('#app')
    </script>
  </body>
</html>
  `
  await writeFile(join(output, 'preview.html'), html)
}

const PreviewPlugin = (params: PreviewPluginParams) => {
  const {
    name = 'Icon',
    version = '1.0.0',
    description = 'description',
    repository = '',
  } = params ?? {}
  return {
    name: 'preview',
    apply: 'build',
    handler: async ({ output, folders }: BuildPluginOptions) => {
      let maps = [`"@${name}/icons": "./esm/index.js"`]
      let imports = [`import * as icons from "@${name}/icons"`]
      let groups = ['...Object.values(icons)']

      const hasGroup = folders.some(folder => !!folder.children)
      if (hasGroup) {
        const content = folders.reduce<IconImports>((acc, cur) => {
          const { maps, imports, groups } = acc
          if (cur.children) {
            maps.push(`"@${name}/${cur.name}": "./${cur.name}/esm/index.js"`)
            imports.push(`import * as ${cur.name} from "@${name}/${cur.name}"`)
            groups.push(`{ name: "${cur.name}", icons: Object.values(${cur.name}) }`)
          }
          return acc
        }, { maps: [], imports: [], groups: [] })
        maps = content.maps
        imports = content.imports
        groups = content.groups
      }
      await buildPage(
        output,
        hasGroup,
        name,
        version,
        description,
        repository,
        maps,
        imports,
        groups
      )
    }
  }
}

export default PreviewPlugin
