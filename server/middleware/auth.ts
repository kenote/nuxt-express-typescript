import { Request } from 'express'
import * as passportJWT from 'passport-jwt'
import * as jwt from 'jsonwebtoken'
import { Payload, JwtSign } from '../../types/resuful'
import config from '../config'

const { session_secret } = config
const { ExtractJwt, Strategy } = passportJWT

const jwtOptions: passportJWT.StrategyOptions = {
  jwtFromRequest            : ExtractJwt.fromAuthHeaderAsBearerToken(),
  passReqToCallback         : true,
  secretOrKey               : session_secret
}

const startegyVerify: passportJWT.VerifyCallbackWithRequest = async (req: Request, payload: Payload, done: passportJWT.VerifiedCallback): Promise<void> => {
  try {
    //
    return done(null, {})
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
