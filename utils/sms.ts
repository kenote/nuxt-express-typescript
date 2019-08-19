import { Maps } from 'kenote-config-helper'
import { oc } from 'ts-optchain'
import Alicloud, { getAlicloundSetting } from './alicloud'
import alicloud, { SMS } from '@/types/alicloud'

/**
 * 阿里云短信服务
 * @example new DYSMS('密钥标签').send('手机号码', 'register', { code: '1234' })
 */
export class DYSMS {

  private __Store: alicloud.Store

  constructor (name: string) {
    this.__Store = getAlicloudStore(name)
  }

  public send = (phone: string | string [], template: SMS.Template, param?: Maps<any> | string) => new Alicloud(this.__Store).sendsms(phone, template, param)
}

function getAlicloudStore (name: string): alicloud.Store {
  let setting: alicloud.Setting = getAlicloundSetting()
  let accessKeys: alicloud.AccessKey = setting.accessKeys.find( o => o.key === name ) as alicloud.AccessKey
  let api: alicloud.API = setting.apis.find( o => o.key === 'dysms' ) as alicloud.API
  let smsConfig: SMS.Config = oc(setting).SMS([]).find( o => o.key === name ) as SMS.Config
  let store: alicloud.Store = {
    key: name,
    name: oc(accessKeys).name(''),
    setting: {
      accessKeyId: oc(accessKeys).options.accessKeyId(''),
      accessKeySecret: oc(accessKeys).options.secretAccessKey(''),
      endpoint: oc(api).endpoint(''),
      apiVersion: oc(api).apiVersion('')
    },
    SMS: smsConfig

  }
  return store
}
