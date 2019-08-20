import { NextFunction } from 'express'
import { IRequest, IResponse, Register, ConsoleSettings } from '@/types/resuful'
import * as singlepage from '@/types/singlepage'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { KenoteConfig } from 'kenote-config-helper'

export function nuxtHandler (req: IRequest, res: IResponse, next: NextFunction): void {
  let isPage: boolean = !/^(\/\_nuxt|\/__webpack_hmr)|(\.ico|\.png)$/.test(req.path)
  if (isPage) {
    req.__register = loadData('data/register') as Register.Config
    req.__singlePages = loadData('data/singlepages', 'array') as singlepage.Item[]
    let { userEntrance } = loadData('data/console') as ConsoleSettings
    req.__userEntrance = userEntrance
    req.__channels = loadData('data/channels', 'array') as KenoteConfig.Channel[]
  }
  return next()
}
