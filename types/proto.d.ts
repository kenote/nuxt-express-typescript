import { PBSetting } from 'kenote-socket-helper'
import { Maps, KeyMap } from 'kenote-config-helper'

/**
 * Protocol Buffer 选项
 */
export interface ProtoOptions {

  /**
   * Protocol Buffer 文件配置
   */
  proto              : PBSetting

  /**
   * RSTP 接口
   */
  rstps              : Maps<ProtoServer>
}

/**
 * Protocol Buffer 服务器
 */
export interface ProtoServer {

  /**
   * 服务器
   */
  host               : string

  /**
   * 端口
   */
  port               : number

  /**
   * 名称
   */
  name              ?: string

  /**
   * 描述
   */
  description       ?: string
}

export declare namespace ProtoSend {

  interface Proto {
    code               : number
    req                : string
    res                : string
    rstp              ?: string
  }

  interface Parse {
    key                : string
    separator          : string | RegExp
    collection         : KeyMap<string>[]
    orderBy           ?: OrderBy
    int               ?: ParseInt
    format            ?: string
    setBy             ?: string
    afterTrans        ?: Array<string | string[]>
    addedValue        ?: AddedValue[]
  }

  interface AddedValue extends KeyMap<string> {
    defaultValue       : any
    options           ?: AddedValueOptions
  }

  interface AddedValueOptions {
    type               : string
    param              : string[]
    formula           ?: Formula
  }

  interface Formula {
    func               : Function
    opts               : string[]
  }

  // addedValue:
  // - key           : data_03
  //   name          : 单价
  //   options:
  //     type          : gift
  //     param         : [ data_00, price ]
  //   defaultValue    : 0
  // - key           : data_04
  //   name          : 总价
  //   defaultValue    : 0
  //   options:
  //     type          : gift
  //     param         : [ data_00, price ]
  //     formula:
  //       func          : !!js/function >
  //         function (a, b) {
  //           return Number(a) * Number(b)
  //         }
  //       opts          : [ sett.price, data.data_02 ]

  interface OrderBy {
    iteratees          : string[]
    orders             : Array<'asc' | 'desc'>
  }

  interface ParseInt {
    key                : string
    function           : string
    options            : string[]
  }

  interface Alias {
    key                : string
    value              : string
    name              ?: string
  }

  type AutoFields = Record<'subtract' | 'add', Array<string | number>> & { reference: string }

  type Request = Maps<'date' | 'string' | 'number' | 'array'>
}

export interface ProtoAPI {

  /**
   * 接口配置
   */
  proto              : ProtoSend.Proto

  /**
   * 请求字段格式
   */
  request            : ProtoSend.Request

  /**
   * 返回数据解析
   */
  parse             ?: ProtoSend.Parse[]

  /**
   * 字段映射
   */
  alias             ?: Maps<ProtoSend.Alias[]>

  /**
   * 自动生成字段
   */
  autoFields        ?: Maps<ProtoSend.AutoFields>

  /**
   * 渠道选项
   */
  ditchOptions      ?: string[]

  /**
   * 提交附加参数
   */
  parameter         ?: Maps<any>

}

/**
 * 更新配置
 */
export interface UpdateSettingDocument {

  /**
   * 文件路径
   */
  file              ?: string

  /**
   * 内容
   */
  content            : string
}
