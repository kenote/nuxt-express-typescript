import { PBSetting } from 'kenote-socket-helper'
import { Maps } from 'kenote-config-helper'

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
    request            : string
    response           : string
    rstp              ?: string
  }
}