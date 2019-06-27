
import * as http from 'http'
import express, { Application } from 'express'
import { Nuxt, Builder } from 'nuxt'
import nuxtConfig from '../nuxt.config'

const dev: boolean = process.env.NODE_ENV !== 'production'
const nuxt: Nuxt = new Nuxt({ ...nuxtConfig, dev })

if (process.env.NODE_ENV === 'development') {
  const builder: Builder = new Builder(nuxt)
  builder.build()
}
else {
  nuxt.ready()
}

const app: Application = express()

app.use(nuxt.render)

const Host: string = '0.0.0.0'
const Port: number = 3000

// Starting Server
const server: http.Server = http.createServer(app)
server.listen(Port, Host, () => {
  console.log(`Service running in %s environment, Port: %d ...`, process.env.NODE_ENV || 'development', Port)
})

export default app