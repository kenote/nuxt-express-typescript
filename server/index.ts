import * as path from 'path'
import * as http from 'http'
import * as express from 'express'
import { Request, Response, NextFunction } from 'express'
import * as nunjucks from 'nunjucks'
import * as bodyParser from 'body-parser'
import * as methodOverride from 'method-override'
import * as compress from 'compression'
import * as cookieParser from 'cookie-parser'
import * as errorhandler from 'errorhandler'
import * as cors from 'cors'
import * as passport from 'passport'
import { Nuxt, Builder } from 'nuxt'
import nuxtConfig from '../nuxt.config'
import controller from './controller'
import { nuxtHandler } from './middleware/nuxt'
import resuful from './middleware/restful'
import { startegy } from './middleware/auth'
import config, { sessionParser } from './config'

const { Host, Port, site_name, session_secret } = config
if (nuxtConfig.head) nuxtConfig.head.title = site_name
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
  const app: express.Express = express()

  // 设置模版
  app.set('view', path.resolve(process.cwd(), 'views'))
  app.set('view engine', 'njk')
  nunjucks.configure('views', { autoescape: true, express: app })

  // 设置 POST
  app.use(bodyParser.json({ limit: '1mb' }))
  app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }))

  // 让服务器能转发 PUT、DELETE 请求
  app.use(methodOverride())

  // 压缩数据
  app.use(compress())

  // Cookie
  app.use(cookieParser(session_secret))

  // Session
  app.use(sessionParser())

  // Passport
  passport.use(startegy)
  app.use(passport.initialize())
  app.use(passport.session())
  passport.serializeUser((user, done) => 
    done(null, user)
  )
  passport.deserializeUser((user, done) => 
    done(null, user)
  )

  // 自定义 Restful
  app.use(resuful)
  
  // Routing
  app.use('/api', cors(), controller)

  // Nuxt
  app.use(nuxtHandler, nuxt.render)

  // 404 Not Found.
  app.use('*', (req: Request, res: Response): void => {
    return res.status(404).render('error', { message: 'This page could not be found' })
  })

  // 500 Error
  if (process.env.NODE_ENV === 'development') {
    app.use(errorhandler)
  }
  else {
    app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
      console.error('server 500 error: ', err)
      return res.status(500).render('error', { message: 'This page could internal server error' })
    })
  }

  // Running ...
  http.createServer(app).listen(Port, Host, () => {
    console.log(`Service running in %s environment, PORT: %d ...`, process.env.NODE_ENV || 'development', Port)
  })
}

start()