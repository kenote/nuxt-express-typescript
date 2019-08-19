import { Request, Response, NextFunction } from 'express'
import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { UpdateWriteResult } from 'kenote-mongoose-helper'
import { IResponse } from '@/types/resuful'
import userProxy from '~/proxys/user'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { responseDocument as responseTicketDocument } from '@/types/proxys/ticket'
import { responseDocument as responseVerifyDocument } from '@/types/proxys/verify'
import * as IPassport from '@/types/passport'
import { loadError } from '@/utils/error'
import config from '~/config'
import { validTicket } from '~/utils/ticket'
import ticketProxy from '~/proxys/ticket'
import verifyProxy from '~/proxys/verify'
import mailer from '@/utils/mailer'
import * as Mail from 'nodemailer/lib/mailer'
import { oc } from 'ts-optchain'
import { MailerContext } from '@/types/mailer'
import { omit } from 'lodash'
import passportFilter from '~/filters/api_v1/passport'
import { setToken, authenticate } from '~/middleware/auth'
import { DYSMS } from '@/utils/sms'

const { language, site_name } = config
const { ErrorInfo, CustomError, __ErrorCode } = loadError(language)

@Path('/passport')
export default class Passport extends Controller {

  /**
   * 验证名称是否占用
   * @param name  <String> 用户名 | 电子邮箱 | 手机号
   */
  @Router({ method: 'put', path: '/check/:type(username|email|mobile)' })
  public async check (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let { name } = req.body
    let warnings: IPassport.CheckWarning = {
      username  : __ErrorCode.ERROR_VALID_USERNAME_UNIQUE,
      email     : __ErrorCode.ERROR_VALID_USERNAME_UNIQUE,
      mobile    : __ErrorCode.ERROR_VALID_MOBILE_UNIQUE
    }
    try {
      let user: responseUserDocument = await userProxy.Dao.findOne({ [type]: name }) as responseUserDocument
      return res.api(!user, user ? warnings[type] : null)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 验证邀请码
   * @param cdkey <UUID4> 邀请码 
   */
  @Router({ method: 'post', path: '/invitation' })
  public async invitation (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { cdkey } = req.body
    try {
      let ticket: responseTicketDocument = await validTicket({ cdkey }, { name: '邀请码', type: 'register', key: 'cdkey' })
      return res.api(ticket)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 用户注册
   * @param username <String> 用户名 
   * @param email <String> 电子邮箱
   * @param mobile <String> 手机号
   * @param password <String> 密码
   * @param invitation <UUID4> 邀请码
   */
  @Router({ method: 'post', path: '/register' })
  @Filter( passportFilter.register )
  public async register (create: IPassport.createDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { document, ticket, setting } = create
    try {
      let user: responseUserDocument = await userProxy.register(document) as responseUserDocument
      if (setting.invitation && ticket) {
        let used: boolean = ticket.stint <= ticket.uses + 1
        await ticketProxy.Dao.updateOne({ _id: ticket._id }, { $inc: { uses: 1}, used })
      }
      let verify: responseVerifyDocument = await verifyProxy.create({ type: 'email', user: user._id })
      let mail: Mail.Options = {
        from: `${site_name} <${oc(mailer).__SmtpOptions.auth.user('')}>`,
        to: `${user.username} <${user.email}>`,
        subject: `${site_name}邮箱验证`
      }
      let context: MailerContext.emailVerify = {
        site_name: site_name || '',
        username: user.username,
        email_verify_url: `${config.site_url}/accounts/email_verify?token=${verify.token}&id=${verify.id}`,
        timeout: setting.email_verify.timeout / 3600
      }
      mailer.sendMail('email_verify.mjml', mail, context)
      return res.api(omit(user, ['encrypt', 'salt']))
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 用户登录
   * @param username  <String> 用户名 | 电子邮箱 | 手机号
   * @param password  <String> 登录密码
   */
  @Router({ method: 'post', path: '/login' })
  @Filter( passportFilter.login )
  public async login (document: IPassport.Login, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let user: responseUserDocument = await userProxy.login(document) as responseUserDocument
      let token: string = setToken({ _id: user._id })
      res.cookie('token', token)
      await userProxy.Dao.updateOne({ _id: user._id }, { jw_token: token, sex: 1 })
      return res.api({ ...user, jw_token: token })
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 校验访问令牌
   */
  @Router({ method: 'get', path: '/accesstoken' })
  @Filter( authenticate )
  public async accessToken (req: Request, res: IResponse, next: NextFunction): Promise<Response> {
    return res.api(req.user)
  }

  /**
   * 用户登出 
   */
  @Router({ method: 'get', path: '/logout' })
  public logout (req: Request, res: IResponse, next: NextFunction): Response {
    req.logout()
    res.cookie('token', null)
    return res.api({ result: true })
  }

  @Router({ method: 'post', path: '/verify/:type(email|mobile)' })
  @Filter( passportFilter.verify_email_mobile )
  public async verify_email_mobile (verifyDocument: IPassport.verifyDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { warnings, setting, document } = verifyDocument
    let { type } = document
    try {
      let verify: responseVerifyDocument = await verifyProxy.Dao.findOne(document) as responseVerifyDocument
      if (verify) {
        let difftime: number = Date.now() - verify.create_at.getTime()
        let timeout: number = setting.email_verify.timeout * 1000
        if (difftime > timeout) {
          return res.api('warning', warnings[type].timeout)
        }
        if (verify.approved) {
          return res.api('warning', __ErrorCode.ERROR_VERIFY_TOKEN_VERIFIED)
        }
        await verifyProxy.Dao.updateOne({ _id: verify._id }, { approved: true })
        await userProxy.Dao.updateOne({ _id: verify.user._id }, { binds: Array.from(new Set([ ...verify.user.binds, type ])) })
        return res.api(verify)
      }
      else {
        return res.api('error', warnings[type].failed)
      }
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 发送验证码
   * @param name  <String> 电子邮箱 | 手机号 
   */
  @Router({ method: 'put', path: '/resetpwd/code/:type(email|mobile)' })
  @Filter( passportFilter.resetpwdCode )
  public async resetpwdCode (resetpwd: IPassport.resetPwd, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type, document, setting } = resetpwd
    let { name } = document
    try {
      let user: responseUserDocument = await userProxy.Dao.findOne({ [type]: name }) as responseUserDocument
      if (!user) {
        return res.api(null, __ErrorCode.ERROR_FINDUSER_NOTEXIST)
      }
      let verify: responseVerifyDocument = await verifyProxy.Dao.findOne({ type: 'code', user: user._id }) as responseVerifyDocument
      if (verify) {
        let difftime: number = Date.now() - verify.create_at.getTime()
        let timeout: number = setting.mailphone_step * 1000
        if (difftime < timeout) {
          return res.api(null, __ErrorCode.ERROR_SEND_MAILPHONE_STEP)
        }
        await verifyProxy.Dao.remove({ _id: verify._id })
      }
      verify = await verifyProxy.create({ type: 'code', user: user._id })
      if (type === 'email') {
        let mail: Mail.Options = {
          from: `${site_name} <${oc(mailer).__SmtpOptions.auth.user('')}>`,
          to: `${user.username} <${user.email}>`,
          subject: `${site_name}密码重置校验`
        }
        let context: MailerContext.resetPass = {
          site_name: site_name || '',
          username: user.username,
          code: verify.token,
          timeout: setting.lost_pass.timeout / 60
        }
        mailer.sendMail('reset_pass.mjml', mail, context)
      }
      if (type === 'mobile') {
        await new DYSMS(config.options!.sms! || '').send(name!, 'password', { code: verify.token })
      }
      return res.api({ result: true })
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 重置密码
   * @param code  <String> 验证码
   * @param password  <String> 新密码
   * @param name  <String> 电子邮箱 | 手机号
   */
  @Router({ method: 'put', path: '/resetpwd/:type(email|mobile)' })
  @Filter( passportFilter.resetpwd )
  public async resetpwd (resetpwd: IPassport.resetPwd, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type, document, setting } = resetpwd
    let { name, code } = document
    try {
      let user: responseUserDocument = await userProxy.Dao.findOne({ [type]: name }) as responseUserDocument
      if (!user) {
        return res.api(null, __ErrorCode.ERROR_FINDUSER_NOTEXIST)
      }
      let verify: responseVerifyDocument = await verifyProxy.Dao.findOne({ type: 'code', user: user._id, token: code }) as responseVerifyDocument
      if (!verify) {
        return res.api(null, __ErrorCode.ERROR_VERIFY_CODE_FAILED)
      }
      let difftime: number = Date.now() - verify.create_at.getTime()
      let timeout: number = setting.lost_pass.timeout * 1000
      if (difftime > timeout) {
        return res.api(null, __ErrorCode.ERROR_VERIFY_CODE_TIMEOUT)
      }
      let result: UpdateWriteResult = await userProxy.resetPwd(document, type)
      await verifyProxy.Dao.remove({ _id: verify._id })
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}


