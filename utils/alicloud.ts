import * as RPCClient from '@alicloud/pop-core'
import alicloud, { SMS } from '../types/alicloud'
import { oc } from 'ts-optchain'
import { Maps } from 'kenote-config-helper'
import { isObject } from 'lodash'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { mergeCollection } from './'

export default class Alicloud {

  private __Store: alicloud.Store
  private __Client?: RPCClient

  constructor (store: alicloud.Store) {
    this.__Store = store
    if (!oc(store).setting()) {
      console.log('No configuration found for Alicound.')
      return
    }
    this.__Client = new RPCClient(store.setting)
  }

  public send (action: string, params: Maps<any>): Promise<any> {
    if (!this.__Client) return Promise.resolve(null)
    return this.__Client.request(action, params, { method: 'POST' })
  }

  public sendsms (phone: string | string [], template: SMS.Template, param?: Maps<any> | string): Promise<any> {
    let TemplateParam: string | undefined = isObject(param) ? JSON.stringify(param) : <string> param
    let requestParams: SMS.requestParams = {
      PhoneNumbers: Array.isArray(phone) ? phone.join(',') : phone,
      SignName: oc(this.__Store).SMS.signName(''),
      TemplateCode: oc(this.__Store).SMS.templates({})[template] || '',
      TemplateParam
    }
    return this.send('SendSms', requestParams)
  }
}

/**
 * 获取阿里云服务配置
 */
export function getAlicloundSetting (): alicloud.Setting {
  let setting: alicloud.Setting = loadData(`data/alicloud`) as alicloud.Setting
  let defaultSetting: alicloud.Setting = loadData('data/alicloud/index.default.yml') as alicloud.Setting
  setting.apis = mergeCollection('key', setting.apis, defaultSetting.apis) as alicloud.API[]
  return setting
}
