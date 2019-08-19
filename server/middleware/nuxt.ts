import { NextFunction } from 'express'
import { IRequest, IResponse, Register } from '@/types/resuful'
import * as singlepage from '@/types/singlepage'
import { loadData } from 'kenote-config-helper/dist/utils.server'

export function nuxtHandler (req: IRequest, res: IResponse, next: NextFunction): void {
  let isPage: boolean = !/^(\/\_nuxt|\/__webpack_hmr)|(\.ico|\.png)$/.test(req.path)
  if (isPage) {
    req.__register = loadData('data/register') as Register.Config
    req.__singlePages = loadData('data/singlepages', 'array') as singlepage.Item[]
  }
  return next()
}
