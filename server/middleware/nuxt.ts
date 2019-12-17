import { NextFunction } from 'express'
import { IRequest, IResponse, Register, ConsoleSettings, FlagItem } from '@/types/resuful'
import * as singlepage from '@/types/singlepage'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { KenoteConfig, Maps, Navigation, ServerConfiguration } from 'kenote-config-helper'
import * as homepage from '@/types/homepage'
import { getRtsps } from '~/utils'
import config from '~/config'
import { oc } from 'ts-optchain'

const { Host, Port } = config

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
    req.__rtsps = getRtsps()
    req.__proxyhost = `http://${Host}:${Port}`
    let { site_name, options } = loadData('data/config') as ServerConfiguration
    req.__headmetas = {
      title         : site_name,
      keywords      : oc(options).keywords(),
      description   : oc(options).description()
    }
  }
  return next()
}
