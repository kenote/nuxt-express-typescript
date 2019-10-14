import { Request, NextFunction } from 'express'
import { IResponse } from '@/types/resuful'
import * as passportJWT from 'passport-jwt'
import * as jwt from 'jsonwebtoken'
import { Payload, JwtSign } from '@/types/resuful'
import config from '~/config'
import userProxy from '~/proxys/user'
import { responseDocument } from '@/types/proxys/user'
import { pick } from 'lodash'
import * as passport from 'passport'
import { loadError } from '@/utils/error'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { Maps } from 'kenote-config-helper'

const { session_secret, language } = config
const { ExtractJwt, Strategy } = passportJWT
const { ErrorInfo, CustomError, __ErrorCode } = loadError(language)

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

type FlagTag = 'access' | 'save' | 'create' | 'edit' | 'remove' | 'list'

export const permission = (key: string, tag: FlagTag): (req: Request, res: IResponse, next: NextFunction) => any => {
  return function (req: Request, res: IResponse, next: NextFunction): any {
    let user: responseDocument = req.user as responseDocument
    if (!isFlag(user.group.level, key, tag)) {
      return res.api(null, tag === 'access' ? __ErrorCode.ERROR_AUTH_FLAG_ACCESS : __ErrorCode.ERROR_AUTH_FLAG_OPERATE)
    }
    return next()
  }
}

function isFlag (level: number, key: string, tag: FlagTag = 'access'): boolean {
  let __flags: Maps<Record<FlagTag, number>> = loadData('data/flags') as Maps<Record<FlagTag, number>>
  if (__flags[key] && __flags[key][tag]) {
    let __level: number = Number(__flags[key][tag])
    return level >= __level
  }
  return true
}
