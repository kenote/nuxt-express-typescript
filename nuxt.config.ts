import NuxtConfiguration from '@nuxt/config'
const pkg = require('./package.json')

// buefy cause 'ReferenceError: HTMLElement is not defined'
// See https://github.com/buefy/buefy/issues/712
global['HTMLElement'] = typeof window === 'undefined' ? Object : window['HTMLElement']

const config: NuxtConfiguration = {
  env: {},
  srcDir: 'client',
  head: {
    title: pkg.name || '站点标题',
    meta: [
      { charset: 'utf-8' },
      // { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'description' }
    ]
  },
  css: [
    // 'element-ui/lib/theme-chalk/index.css',
    'animate.css/animate.css',
    '~/assets/iconfont/iconfont.css',
    '~/assets/scss/common.scss'
  ],
  /**
   * 目前 Element UI 最新版 v2.11.0 服务端渲染会出现 Window is Not Defined
   * 现将版本回退至 v2.10.1
   * issues: https://github.com/ElemeFE/element/issues/16743
   * 此问题官方已修复，修复版本为 v2.11.1
   */
  plugins: [
    '~/plugins/component',
    { src: '~/plugins/element-ui', ssr: true }
  ],
  loading: {
    color: 'rgb(238, 92, 73, .8)', 
    height: '3px'
  },
  /**
   * 优化编译：使程序按需引入 Element UI
   * 需要在 ~/plugins/element-ui.ts 文件中按如下引用
   * import Vue from 'vue'
   * import { Row, Button } from 'element-ui'
   * export default () => {
   *   Vue.use(Row)
   *   Vue.use(Button)
   * }
   */
  build: {
    babel: {
      plugins: [
        ['component', {
          libraryName: 'element-ui',
          styleLibraryName: 'theme-chalk'
        }]
      ],
      comments: true
    },
    extend (config, ctx) {
      config.resolve!.alias = {
        ...config.resolve!.alias,
        '@': process.cwd()
      }
    }
  }
}

/**
 * Element-ui 点击多次路由会报错:NavigationDuplicated {_name: “NavigationDuplicated”, name: “NavigationDuplicated”}
 * 解决方法:
 * yarn add vue-router@3.0.6
 */

export default config
