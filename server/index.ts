import * as path from 'path'
import * as http from 'http'
import * as express from 'express'
import * as nunjucks from 'nunjucks'
import * as errorhandler from 'errorhandler'
import * as bodyParser from 'body-parser'
import * as methodOverride from 'method-override'
import * as compress from 'compression'
import * as cookieParser from 'cookie-parser'
import * as session from 'express-session'
import * as connectRedis from 'connect-redis'
import * as passport from 'passport'
import * as cors from 'cors'
import config, { nuxt } from '~/config'
import resuful from './middleware/restful'
import { nuxtHandler } from '~/middleware/nuxt'
import { startegy } from '~/middleware/auth'
import controller from '~/controller'
import api_v1 from '~/api/v1'
import logger from '@/utils/logger'

const { Host, Port, session_secret, redis } = config
const RedisStore: connectRedis.RedisStore = connectRedis(session)

async function start (): Promise<void> {
  let app: express.Application = express()

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
  app.use(session({
    secret: session_secret || '',
    store: new RedisStore(redis || {}),
    resave: true,
    saveUninitialized: true
  }))

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
  app.use('/', controller)
  // api_v1
  app.use('/api/v1', cors(), api_v1)

  // Nuxt
  app.use(nuxtHandler, nuxt.render)

  // 404 Not Found.
  app.use('*', (req: express.Request, res: express.Response): void => {
    return res.status(404).render('error', { message: 'This page could not be found' })
  })

  // 500 Error
  if (process.env.NODE_ENV === 'development') {
    app.use(errorhandler)
  }
  else {
    app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction): void => {
      console.error('server 500 error: ', err)
      return res.status(500).render('error', { message: 'This page could internal server error' })
    })
  }

  // Running ...
  http.createServer(app).listen(Port, Host, () => {
    logger.info(`Service running in %s environment, PORT: %d ...`, process.env.NODE_ENV || 'development', Port)
  })
}

start()
