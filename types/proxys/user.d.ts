import * as mongoose from 'mongoose'
import { ObjectId } from 'bson'
import { responseDocument as responseGroupDocument } from './group'
import { responseDocument as responseTeamDocument } from './team'

export interface registerDocument {
  username     : string
  password     : string
  email       ?: string
  mobile      ?: string
  group        : ObjectId | string
  teams       ?: Array<ObjectId | string>
}

export interface createDocument {
  username     : string
  encrypt      : string
  salt         : string
  email       ?: string
  mobile      ?: string
  group        : ObjectId | string
  teams       ?: Array<ObjectId | string>
}

export interface responseDocument extends mongoose.Document {

  /**
   * 用户ID
   */
  id           : number

  /**
   * 用户名
   */
  username     : string

  /**
   * 昵称
   */
  nickname    ?: string

  /**
   * 头像
   */
  avatar      ?: string

  /**
   * 性别
   */
  sex          : number

  /**
   * Email
   */
  email        : string

  /**
   * 手机
   */
  mobile      ?: string

  /**
   * JWT 密钥
   */
  jw_token    ?: string

  /**
   * 绑定的 Email、手机、媒体号
   */
  binds        : string[]

  /**
   * 用户组
   */
  group        : responseGroupDocument

  /**
   * 加入的团队
   */
  teams        : responseTeamDocument[]

  /**
   * 页面访问权限
   */
  access       : string[]

  /**
   * 创建时间
   */
  create_at    : Date

  /**
   * 信息最后更新时间
   */
  update_at    : Date
}

export interface responseAllDocument extends responseDocument {
  encrypt      : string
  salt         : string
}