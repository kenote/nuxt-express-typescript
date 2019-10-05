import { NextFunction } from 'express'
import { IRequest, IResponse, Register, ConsoleSettings, FlagItem } from '@/types/resuful'
import * as singlepage from '@/types/singlepage'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { KenoteConfig, Maps, Navigation } from 'kenote-config-helper'
import * as homepage from '@/types/homepage'

export function nuxtHandler (req: IRequest, res: IResponse, next: NextFunction): void {
  let isPage: boolean = !/^(\/\_nuxt|\/__webpack_hmr)|(\.ico|\.png)$/.test(req.path)
  if (isPage) {
    req.__register = loadData('data/register') as Register.Config
    req.__singlePages = loadData('data/singlepages', 'array') as singlepage.Item[]
    let { userEntrance } = loadData('data/console') as ConsoleSettings
    req.__userEntrance = userEntrance
    req.__channels = loadData('data/channels', 'array') as KenoteConfig.Channel[]
    req.__flags = loadData('data/flags') as Maps<FlagItem>
    req.__homepage = loadData('data/homepage') as Maps<homepage.Page>
    req.__navigation = loadData('data/navigation') as Maps<Navigation[]>
    req.__footer = loadData('data/footer') as Maps<homepage.Footer>
  }
  return next()
}
