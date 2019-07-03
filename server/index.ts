import * as http from 'http'
import * as express from 'express'
import { Nuxt, Builder } from 'nuxt'
import nuxtConfig from '../nuxt.config'
import controller from './controller'

const dev: boolean = process.env.NODE_ENV !== 'production'
const nuxt: Nuxt = new Nuxt({ ...nuxtConfig, dev })

if (process.env.NODE_ENV === 'development') {
  const builder: Builder = new Builder(nuxt)
  builder.build()
}
else {
  nuxt.ready()
}

const start = () => {
  const app: express.Express = (<any> express)()
  
  app.use('/api', controller)
  app.use(nuxt.render)

  http.createServer(app).listen(3000)
}

start()