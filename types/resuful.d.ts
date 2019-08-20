import { Request, Response } from 'express'
import { IError, IErrorInfo, Maps, KenoteConfig } from 'kenote-config-helper'
import * as jwt from 'jsonwebtoken'
import * as singlepage from './singlepage'
import { Dropdown } from './'

/**
 * 自定义 Response
 */
export interface IResponse extends Response {

  /**
   * API 输出
   */
  api          : (data: any, error?: number | IError | IErrorInfo, opts?: string[]) => Response

  /**
   * 指定输出 404 Not Found
   */
  notfound     : () => void

  /**
   * 下载文件
   */
  downloadFile : (file: string, options?: DownloadOptions) => void
}

/**
 * 自定义 Request
 */
export interface IRequest extends Request, Maps<any> {

  /**
   * 用户注册配置
   */
  __register            : Register.Config

  /**
   * 独立页面配置
   */
  __singlePages         : singlepage.Item[]

  /**
   * 控制台用户入口
   */
  __userEntrance        : Dropdown.MenuItem[]

  /**
   * 频道配置
   */
  __channels            : KenoteConfig.Channel[]

}

/**
 * 控制台配置
 */
export interface ConsoleSettings {

  /**
   * 用户入口
   */
  userEntrance          : Dropdown.MenuItem[]
}

/**
 * 用户注册选项
 */
export declare namespace Register {

  /**
   * 用户注册配置
   */
  interface Config {

    /**
     * 是否需要邀请才能注册
     */
    invitation   : boolean

    /**
     * 验证码发送间隔；单位：秒
     */
    mailphone_step : number

    /**
     * 邮件验证
     */
    email_verify : EmailVerify

    /**
     * 找回密码
     */
    lost_pass    : LostPass
  }

  /**
   * 邮件验证
   */
  interface EmailVerify {

    /**
     * 激活邮件时效；单位：秒
     */
    timeout      : number
  }

  /**
   * 找回密码
   */
  interface LostPass {

    /**
     * 验证码时效；单位：秒
     */
    timeout      : number
  }
}

/**
 * Resuful API 返回结构
 */
export interface resufulInfo {

  /**
   * 返回数据
   */
  data         : any

  /**
   * 错误信息
   */
  Status       : IErrorInfo
}

/**
 * 下载文件选项
 */
export interface DownloadOptions {

  /**
   * 如果是网络图像之类的文件，是否直接下载
   */
  download    ?: boolean
}

/**
 * 登录用户标记信息
 */
export interface Payload extends Maps<any> {

  /**
   * 登录用户 _id
   */
  _id          : string
}

/**
 * JWT 登录
 */
export type JwtSign = (payload: Payload, options?: jwt.SignOptions) => string

/**
 * HTTPServer
 */
export interface HTTPServer {

  /**
   * Request
   */
  req          : IRequest
}

export interface HeaderOptions {
  token       ?: string
  header      ?: object
  upload      ?: (percentage: number) => void
  download    ?: (percentage: number) => void
  entry       ?: string
}