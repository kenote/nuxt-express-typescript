import { RequestHandler} from 'express'
import * as session from 'express-session'
import * as connectRedis from 'connect-redis'
import { ServerConfiguration } from 'kenote-config-helper'
import { loadData } from 'kenote-config-helper/dist/utils.server'

const config: ServerConfiguration = <ServerConfiguration> loadData('data/config')

export default config

export function sessionParser (): RequestHandler {
  let { session_secret, redis } = config
  let RedisStore: connectRedis.RedisStore = connectRedis(session)
  return session({
    secret: session_secret || '',
    store: new RedisStore(redis || {}),
    resave: true,
    saveUninitialized: true
  })
}