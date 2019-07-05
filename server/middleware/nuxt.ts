import { NextFunction } from 'express'
import { IRequest, IResponse } from '../../types/resuful'

export function nuxtHandler (req: IRequest, res: IResponse, next: NextFunction): void {
  let isPage: boolean = !/^(\/\_nuxt|\/__webpack_hmr)|(\.ico|\.png)$/.test(req.path)
  if (isPage) {

  }
  return next()
}