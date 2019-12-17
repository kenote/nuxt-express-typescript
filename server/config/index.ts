import { ServerConfiguration } from 'kenote-config-helper'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { Nuxt, Builder } from 'nuxt'
import nuxtConfig from '@/nuxt.config'

const config: ServerConfiguration = loadData('data/config') as ServerConfiguration

export default config

const dev: boolean = process.env.NODE_ENV !== 'production'
export const nuxt: Nuxt = new Nuxt({ ...nuxtConfig, dev })

if (process.env.NODE_ENV === 'development') {
  const builder: Builder = new Builder(nuxt)
  builder.build()
}
else {
  nuxt.ready()
}
