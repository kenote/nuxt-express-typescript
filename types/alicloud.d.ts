import * as RPCClient from '@alicloud/pop-core'

declare namespace alicloud {

  interface Store {
    key            ?: string
    name           ?: string
    description    ?: string
    setting         : RPCClient.Config
    SMS            ?: SMS.Config
  }

  interface Setting {
    accessKeys      : AccessKey[]
    apis            : API[]
    SMS            ?: SMS.Config[]
  }

  interface AccessKey {
    key                : string
    name               : string
    options            : AccessKeyOptions
  }

  interface AccessKeyOptions {
    accessKeyId        : string
    secretAccessKey    : string
  }

  interface API {
    key                : string
    name               : string
    endpoint           : string
    apiVersion         : string
    accessKeys        ?: Array<string>
  }
}

export default alicloud

export declare namespace SMS {
  
  type Template = 'register' | 'verifyid' | 'password' | 'setinfos'

  interface Config {
    key             : string
    signName        : string
    templates       : Templates
  }

  interface Templates {
    register       ?: string
    verifyid       ?: string
    password       ?: string
    setinfos       ?: string
  }

  interface requestParams {
    PhoneNumbers    : string
    SignName        : string
    TemplateCode    : string
    TemplateParam  ?: string
  }
}