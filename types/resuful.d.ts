import { Request, Response } from 'express'
import { IError, IErrorInfo, Maps } from 'kenote-config-helper'
import * as jwt from 'jsonwebtoken'

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
}

/**
 * 自定义 Request
 */
export interface IRequest extends Request {


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