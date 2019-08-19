import { Request, Response, NextFunction } from 'express'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { mergeCollection } from '@/utils'
import alicloud from '@/types/alicloud'

class Alicloud {

  public send () {

    let setting: alicloud.Setting = loadData(`data/alicloud`) as alicloud.Setting
    let defaultSetting: alicloud.Setting = loadData('data/alicloud/index.default.yml') as alicloud.Setting
    
    setting.apis = mergeCollection('key', setting.apis, defaultSetting.apis) as alicloud.API[]

    console.log(JSON.stringify(setting, null, 4))
  }
}

export default new Alicloud()
