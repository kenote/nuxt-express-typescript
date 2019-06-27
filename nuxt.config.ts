import NuxtConfiguration from '@nuxt/config'

// buefy cause 'ReferenceError: HTMLElement is not defined'
// See https://github.com/buefy/buefy/issues/712
global['HTMLElement'] = typeof window === 'undefined' ? Object : window['HTMLElement']

const config: NuxtConfiguration = {
  env: {},
  srcDir: 'client',
  head: {
    title: '站点标题',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'description' }
    ]
  },
  css: [
    'element-ui/lib/theme-chalk/index.css'
  ],
  plugins: [
    { src: '~/plugins/element-ui', ssr: true }
  ]
}

export default config