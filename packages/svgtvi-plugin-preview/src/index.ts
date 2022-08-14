import { join, resolve } from 'node:path'
import { writeFile, lstat } from 'fs/promises'
import fs from 'fs-extra'
import type { BuildPluginOptions } from '@svgtvi/core'

const { readJSON, copyFile } = fs

export interface PreviewPluginParams {
  name?: string
  version?: string
  description?: string
  repository?: string
  logo?: string
}

interface IconImports {
  maps: string[]
  imports: string[]
  groups: string[]
}

/**
 * read package.json
 */
async function readPkgJson(): Promise<Record<string, unknown>> {
  try {
    const path = join(resolve(), 'package.json')
    const json = await readJSON(path)
    return json ?? {}
  } catch (error) {
    console.error('@svgtvi/plugin-preview: "package.json" not found!')
    return {}
  }
}

/**
 * read logo and copy logo to output
 * @param logo 
 * @param output 
 * @returns 
 */
async function readLogo(logo: string, output: string): Promise<string> {
  const defaultLogo = `<svg width="84" height="84" viewBox="0 0 322 323" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" fill-rule="evenodd">
    <path fill="#3662EB" d="M67 131.25l20 40.25 138.25 23L322 3.25z" />
    <path fill-opacity=".5" fill="#3662EB" d="M98.75 196.75L162 322.5l53-106.75z" />
    <path stroke="#3662EB" stroke-width="5" d="M57 109L4.25 3.25H271.5z" />
  </g>
</svg>`
  try {
    const path = join(resolve(), logo)
    const stat = await lstat(path)
    if (!stat.isFile()) {
      return defaultLogo
    } else {
      await copyFile(path, output)
      const name = logo.split('/').pop()
      return `<img src="./${name}" width="84" height="84" />`
    }
  } catch (error) {
    console.error('@svgtvi/plugin-preview: logo not found, default logo will be used!')
    return defaultLogo
  }
}

/**
 * build preview page
 * @param output 
 * @param hasGroup 
 * @param name 
 * @param version 
 * @param description 
 * @param repository 
 * @param logo 
 * @param maps 
 * @param imports 
 * @param groups 
 */
async function buildPage(
  output,
  name,
  version,
  description,
  repository,
  logo,
  maps,
  imports,
  groups
) {
  const html = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Preview</title>
      <style>
      :root{--primary:0,131,255}html,body{position:relative;margin:0;padding:0;font-family:sans-serif;overflow-y:overlay}main{position:relative;display:flex;flex-flow:column nowrap;align-items:center;width:100vw;min-height:100vh;box-sizing:border-box;padding:64px 32px;z-index:1;background:rgba(250,250,250,0.5);backdrop-filter:saturate(50%) blur(10px)}.controls{position:absolute;display:flex;flex-flow:row-reverse nowrap;justify-content:space-evenly;align-items:center;width:200px;height:24px;right:36px}.controls a,.controls svg{width:24px;height:24px;cursor:pointer}.theme{display:flex;justify-content:center;align-items:center;width:24px;height:24px;overflow:hidden}.brand{display:flex;flex-flow:column nowrap;align-items:center}.brand h3{font-size:36px;color:transparent;background:linear-gradient(90deg,rgba(var(--primary),1),rgba(var(--primary),0.5));background-clip:text;-webkit-background-clip:text;margin:24px 0 12px}.brand h3 sup{font-size:18px;color:black}.brand p{color:black;font-size:14px;margin:0}.search{position:relative;height:48px;width:600px;box-sizing:border-box;margin-top:48px;padding:0 24px 0 42px;border-radius:16px;background:white;box-shadow:0 20px 60px -10px rgb(0 0 0 / 3%);transition:all .25s cubic-bezier(0.4,0,0.2,1)}.search svg{position:absolute;top:14px;left:14px;width:20px;height:20px;fill:#545657}.search input{width:100%;height:100%;border:0;outline:0;padding:0;font-size:16px}.search:hover{box-shadow:0 20px 60px 0 rgb(0 0 0 / 10%)}.tabs{display:flex;flex-flow:row nowrap;justify-content:center;align-items:center;margin:36px 0}.tab{margin:0;padding:4px 0;cursor:pointer;border-bottom:2px solid transparent}.tab+.tab{margin-left:48px}.tab-active{font-weight:bold;border-color:rgba(var(--primary),1)}section{width:1200px;box-sizing:border-box;padding:36px;display:grid;grid-template-columns:repeat(auto-fit,64px);grid-gap:24px}.icon{flex:none;display:flex;justify-content:center;align-items:center;width:64px;height:64px;color:black;cursor:pointer;border-radius:16px;background:rgba(255,255,255,1);filter:drop-shadow(0 0 8px rgba(0,0,0,0.1));transition:all .1s;font-size:32px}.icon:hover{color:white;background:rgba(var(--primary),1);filter:drop-shadow(0 0 16px rgba(var(--primary),0.2))}.ellipse{position:fixed;z-index:0;border-radius:50%;background-color:rgba(0,131,255,0.7);box-shadow:0 0 100px rgba(0,0,0,0.25);filter:blur(100px)}.ellipse-right{width:360px;height:360px;top:-120px;right:60px}.ellipse-left{width:360px;height:360px;left:-60px;bottom:-120px}.ellipse-center{width:450px;height:120px;top:60%;left:40%}
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
      <div class="controls">
        <a href="https://github.com/WX-DongXing/svgtvi" target="_blank">
          <svg width="20" height="20" viewBox="0 0 322 323" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path fill="#3662EB" d="M67 131.25l20 40.25 138.25 23L322 3.25z"/><path fill-opacity=".5" fill="#3662EB" d="M98.75 196.75L162 322.5l53-106.75z"/><path stroke="#3662EB" stroke-width="5" d="M57 109L4.25 3.25H271.5z"/></g></svg>
        </a>
        <a href="${repository}" target="_blank">
          <svg width="22" height="22" aria-hidden="true" viewBox="0 0 16 16" data-view-component="true">
            <path fill-rule="evenodd"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z">
            </path>
          </svg>
        </a>
        <div
          class="theme"
          @click="theme = theme === 'light' ? 'dark' : 'light'"
        >
          <svg v-if="theme === 'light'" width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M12 19.25C8 19.25 4.75 16 4.75 12C4.75 8 8 4.75 12 4.75C16 4.75 19.25 8 19.25 12C19.25 16 16 19.25 12 19.25ZM12 6.25C8.83 6.25 6.25 8.83 6.25 12C6.25 15.17 8.83 17.75 12 17.75C15.17 17.75 17.75 15.17 17.75 12C17.75 8.83 15.17 6.25 12 6.25Z"
                  fill="#292D32" />
              <path
                  d="M12 22.96C11.45 22.96 11 22.55 11 22V21.92C11 21.37 11.45 20.92 12 20.92C12.55 20.92 13 21.37 13 21.92C13 22.47 12.55 22.96 12 22.96ZM19.14 20.14C18.88 20.14 18.63 20.04 18.43 19.85L18.3 19.72C17.91 19.33 17.91 18.7 18.3 18.31C18.69 17.92 19.32 17.92 19.71 18.31L19.84 18.44C20.23 18.83 20.23 19.46 19.84 19.85C19.65 20.04 19.4 20.14 19.14 20.14ZM4.86 20.14C4.6 20.14 4.35 20.04 4.15 19.85C3.76 19.46 3.76 18.83 4.15 18.44L4.28 18.31C4.67 17.92 5.3 17.92 5.69 18.31C6.08 18.7 6.08 19.33 5.69 19.72L5.56 19.85C5.37 20.04 5.11 20.14 4.86 20.14ZM22 13H21.92C21.37 13 20.92 12.55 20.92 12C20.92 11.45 21.37 11 21.92 11C22.47 11 22.96 11.45 22.96 12C22.96 12.55 22.55 13 22 13ZM2.08 13H2C1.45 13 1 12.55 1 12C1 11.45 1.45 11 2 11C2.55 11 3.04 11.45 3.04 12C3.04 12.55 2.63 13 2.08 13ZM19.01 5.99C18.75 5.99 18.5 5.89 18.3 5.7C17.91 5.31 17.91 4.68 18.3 4.29L18.43 4.16C18.82 3.77 19.45 3.77 19.84 4.16C20.23 4.55 20.23 5.18 19.84 5.57L19.71 5.7C19.52 5.89 19.27 5.99 19.01 5.99ZM4.99 5.99C4.73 5.99 4.48 5.89 4.28 5.7L4.15 5.56C3.76 5.17 3.76 4.54 4.15 4.15C4.54 3.76 5.17 3.76 5.56 4.15L5.69 4.28C6.08 4.67 6.08 5.3 5.69 5.69C5.5 5.89 5.24 5.99 4.99 5.99ZM12 3.04C11.45 3.04 11 2.63 11 2.08V2C11 1.45 11.45 1 12 1C12.55 1 13 1.45 13 2C13 2.55 12.55 3.04 12 3.04Z"
                  fill="#292D32" />
          </svg>
          <svg v-if="theme === 'dark'" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M12.4604 22.7501C12.2904 22.7501 12.1204 22.7501 11.9504 22.7401C6.35044 22.4901 1.67044 17.9801 1.28044 12.4801C0.940437 7.76011 3.67044 3.35011 8.07044 1.50011C9.32044 0.980114 9.98044 1.38011 10.2604 1.67011C10.5404 1.95011 10.9304 2.60011 10.4104 3.79011C9.95044 4.85011 9.72044 5.98011 9.73044 7.14011C9.75044 11.5701 13.4304 15.3301 17.9204 15.5101C18.5704 15.5401 19.2104 15.4901 19.8304 15.3801C21.1504 15.1401 21.7004 15.6701 21.9104 16.0101C22.1204 16.3501 22.3604 17.0801 21.5604 18.1601C19.4404 21.0601 16.0704 22.7501 12.4604 22.7501ZM2.77044 12.3701C3.11044 17.1301 7.17044 21.0301 12.0104 21.2401C15.3004 21.4001 18.4204 19.9001 20.3404 17.2801C20.4904 17.0701 20.5604 16.9201 20.5904 16.8401C20.5004 16.8301 20.3404 16.8201 20.0904 16.8701C19.3604 17.0001 18.6004 17.0501 17.8504 17.0201C12.5704 16.8101 8.25044 12.3801 8.22044 7.16011C8.22044 5.78011 8.49044 4.45011 9.04044 3.20011C9.14044 2.98011 9.16044 2.83011 9.17044 2.75011C9.08044 2.75011 8.92044 2.77011 8.66044 2.88011C4.85044 4.48011 2.49044 8.30011 2.77044 12.3701Z"
                  fill="#292D32" />
          </svg>
        </div>
      </div>

      <div class="brand">
        ${logo}
        <h3>{{name}}<sup>{{version}}</sup></h3>
        <p>{{description}}</p>
      </div>

      <div class="search">
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M11.5 21.75C5.85 21.75 1.25 17.15 1.25 11.5C1.25 5.85 5.85 1.25 11.5 1.25C17.15 1.25 21.75 5.85 21.75 11.5C21.75 17.15 17.15 21.75 11.5 21.75ZM11.5 2.75C6.67 2.75 2.75 6.68 2.75 11.5C2.75 16.32 6.67 20.25 11.5 20.25C16.33 20.25 20.25 16.32 20.25 11.5C20.25 6.68 16.33 2.75 11.5 2.75Z"
                fill="curentColor" />
            <path
                d="M22.0004 22.7499C21.8104 22.7499 21.6204 22.6799 21.4704 22.5299L19.4704 20.5299C19.1804 20.2399 19.1804 19.7599 19.4704 19.4699C19.7604 19.1799 20.2404 19.1799 20.5304 19.4699L22.5304 21.4699C22.8204 21.7599 22.8204 22.2399 22.5304 22.5299C22.3804 22.6799 22.1904 22.7499 22.0004 22.7499Z"
                fill="curentColor" />
        </svg>
        <input type="text" v-model="search" placeholder="seach icon" />
      </div>

      <div class="tabs" v-if="tab">
        <p
          v-for="t in tabs"
          :key="t"
          @click="tab = t"
          :class="[
            'tab',
            tab === t ? 'tab-active' : ''
          ]"
        >
          {{ t }}
        </p>
      </div>
      <section class="icons">
        <div
          class="icon"
          v-for="([name, icon]) in icons"
          :key="name"
        >
          <component :is="icon"/>
        </div>
      </section>
    </main>
    <div class="ellipse ellipse-right"></div>
    <div class="ellipse ellipse-center"></div>
    <div class="ellipse ellipse-left"></div>
    <script type="module">
      import { createApp, computed, ref, unref, watch } from 'vue'
      ${imports.join('\n')}

      createApp({
        setup() {
          const theme = ref('light')
          const search = ref('')
          const groups = [${groups}]
          const tabs = groups.map(({ name }) => name)
          const tab = ref(unref(tabs)[0] ?? '')
          const group = computed(() => groups.find(group => group?.name === unref(tab)))
          const icons = computed(() => ((unref(group)?.icons) ? (unref(group)?.icons) : (groups ?? [])).filter(([name]) => (name.toLowerCase()).includes(unref(search).toLowerCase())))

          watch(theme, val => {
            document.body.setAttribute('color-schema', val)
          })

          return {
            name: "${name}",
            version: "${version}",
            description: "${description}",
            repository: "${repository}",
            search,
            theme,
            tab,
            tabs,
            icons
          }
        }
      }).mount('#app')
    </script>
  </body>
</html>
  `
  await writeFile(join(output, 'preview.html'), html)
}

const PreviewPlugin = (params?: PreviewPluginParams) => {
  return {
    name: 'preview',
    apply: 'build',
    handler: async ({ output, folders }: BuildPluginOptions) => {
      const pkgJson = await readPkgJson()
      const {
        name = 'Icon',
        version = '1.0.0',
        description = 'description',
        repository = '',
        logo = ''
      } = params ?? pkgJson

      const logoElement = await readLogo(logo as string, output)
      let maps = [`"@${name}/icons": "./esm/index.js"`]
      let imports = [`import * as Icons from "@${name}/icons"`]
      let groups = ['...Object.entries(Icons)']

      const hasGroup = folders.some(folder => !!folder.children)
      if (hasGroup) {
        const content = folders.reduce<IconImports>((acc, cur) => {
          const { maps, imports, groups } = acc
          if (cur.children) {
            const { camelCaseName, pascalCaseName } = cur
            maps.push(`"@${name}/${camelCaseName}": "./${camelCaseName}/esm/index.js"`)
            imports.push(`import * as ${pascalCaseName} from "@${name}/${camelCaseName}"`)
            groups.push(`{ name: "${camelCaseName}", icons: Object.entries(${pascalCaseName}) }`)
          }
          return acc
        }, { maps: [], imports: [], groups: [] })
        maps = content.maps
        imports = content.imports
        groups = content.groups
      }
      await buildPage(
        output,
        name,
        version,
        description,
        repository,
        logoElement,
        maps,
        imports,
        groups
      )
    }
  }
}

export default PreviewPlugin
