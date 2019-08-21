import { NextFunction } from 'express'
import { IRequest, IResponse, Register, ConsoleSettings, FlagItem } from '@/types/resuful'
import * as singlepage from '@/types/singlepage'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { KenoteConfig, Maps } from 'kenote-config-helper'

export function nuxtHandler (req: IRequest, res: IResponse, next: NextFunction): void {
  let isPage: boolean = !/^(\/\_nuxt|\/__webpack_hmr)|(\.ico|\.png)$/.test(req.path)
  if (isPage) {
    req.__register = loadData('data/register') as Register.Config
    req.__singlePages = loadData('data/singlepages', 'array') as singlepage.Item[]
    let { userEntrance } = loadData('data/console') as ConsoleSettings
    req.__userEntrance = userEntrance
    req.__channels = loadData('data/channels', 'array') as KenoteConfig.Channel[]
    req.__flags = loadData('data/flags') as Maps<FlagItem>
  }
  return next()
}
