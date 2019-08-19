import { Request } from 'express'
import * as passportJWT from 'passport-jwt'
import * as jwt from 'jsonwebtoken'
import { Payload, JwtSign } from '@/types/resuful'
import config from '~/config'
import userProxy from '~/proxys/user'
import { responseDocument } from '@/types/proxys/user'
import { pick } from 'lodash'
import * as passport from 'passport'

const { session_secret } = config
const { ExtractJwt, Strategy } = passportJWT

const jwtOptions: passportJWT.StrategyOptions = {
  jwtFromRequest            : ExtractJwt.fromAuthHeaderAsBearerToken(),
  passReqToCallback         : true,
  secretOrKey               : session_secret
}

const startegyVerify: passportJWT.VerifyCallbackWithRequest = async (req, payload: Payload, done): Promise<void> => {
  try {
    let user: responseDocument = await userProxy.Dao.findOne({ _id: payload._id }) as responseDocument
    return done(null, pick(user, [
      '_id', 
      'id', 
      'username', 
      'email', 
      'mobile', 
      'nickname', 
      'avatar', 
      'sex', 
      'binds', 
      'group', 
      'teams', 
      'access', 
      'create_at', 
      'update_at', 
      'jw_token'
    ]))
  } catch (error) {
    return done(error, false)
  }
}

export const startegy: passportJWT.Strategy = new Strategy(jwtOptions, startegyVerify)

export const setToken: JwtSign = (payload: Payload, options?: jwt.SignOptions): string => jwt.sign(
  payload, 
  <jwt.Secret> jwtOptions.secretOrKey, 
  options
)

export const authenticate = passport.authenticate('jwt', { session: false })
