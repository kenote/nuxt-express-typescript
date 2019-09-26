import { Request, Response, NextFunction } from 'express'
import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { IResponse } from '@/types/resuful'
import { setToken, authenticate } from '~/middleware/auth'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { loadError } from '@/utils/error'
import config from '~/config'
import verifyProxy from '~/proxys/verify'
import { responseDocument as responseVerifyDocument, UpdateResult } from '@/types/proxys/verify'
import mailer from '@/utils/mailer'
import * as Mail from 'nodemailer/lib/mailer'
import { oc } from 'ts-optchain'
import { MailerContext } from '@/types/mailer'
import securityFillter from '~/filters/api_v1/security'
import { Register } from '@/types/resuful'
import * as IPassport from '@/types/passport'
import { DYSMS } from '@/utils/sms'
import userProxy from '~/proxys/user'

const { language, site_name } = config
const { ErrorInfo, CustomError, __ErrorCode } = loadError(language)

@Path('/security')
export default class Security extends Controller {

  /**
   * 发送验证邮件
   */
  @Router({ method: 'get', path: '/email_verify' })
  @Filter( authenticate, securityFillter.getRegisterConfig )
  public async sendVerifyEmail (setting: Register.Config, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id, username, email } = req.user as responseUserDocument
    try {
      await verifyProxy.Dao.remove({ type: 'email', user: _id })
      let verify: responseVerifyDocument = await verifyProxy.create({ type: 'email', user: _id })
      let mail: Mail.Options = {
        from: `${site_name} <${oc(mailer).__SmtpOptions.auth.user('')}>`,
        to: `${username} <${email}>`,
        subject: `${site_name}邮箱验证`
      }
      let context: MailerContext.emailVerify = {
        site_name: site_name || '',
        username,
        email_verify_url: `${config.site_url}/security/email_verify?token=${verify.token}&id=${verify.id}`,
        timeout: setting.email_verify.timeout / 3600
      }
      mailer.sendMail('email_verify.mjml', mail, context)
      return res.api(null)
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
  @Router({ method: 'put', path: '/sendcode/:type(email|mobile)' })
  @Filter( authenticate, securityFillter.sendCode )
  public async sendCode (sendCode: IPassport.sendCodeDocument,  req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let { document, setting } = sendCode
    let user: responseUserDocument = req.user as responseUserDocument
    let { name, verify_id } = document
    try {
      let conditions: any = { type: 'code' }
      if (verify_id) {
        conditions = { ...conditions, _id: verify_id }
      }
      else {
        conditions = { ...conditions, user: user._id }
      }
      let verify: responseVerifyDocument | UpdateResult = await verifyProxy.Dao.findOne(conditions) as responseVerifyDocument
      if (!verify && verify_id) {
        return res.api(null, __ErrorCode.ERROR_VERIFY_ID_FAILED)
      }
      if (verify) {
        let updateTime: Date = verify_id ? verify.update_at : verify.create_at
        let difftime: number = Date.now() - updateTime.getTime()
        let timeout: number = Number(setting.mailphone_step) * 1000
        if (difftime < timeout) {
          return res.api(null, __ErrorCode.ERROR_SEND_MAILPHONE_STEP)
        }
        !verify_id && await verifyProxy.Dao.remove({ _id: verify._id })
      }
      if (verify_id) {
        verify = await verifyProxy.update({ _id: verify_id }, { application: name })
      }
      else {
        verify = await verifyProxy.create({ type: 'code', user: user._id })
      }
      if (type === 'email') {
        let title: string = verify_id ? '邮箱校验' : '帐号身份校验'
        let mail: Mail.Options = {
          from: `${site_name} <${oc(mailer).__SmtpOptions.auth.user('')}>`,
          to: `${user.username} <${user.email}>`,
          subject: `${site_name}${title}`
        }
        let context: MailerContext.sendCode = {
          title,
          site_name: site_name || '',
          username: user.username,
          code: verify.token,
          timeout: setting.lost_pass.timeout / 60
        }
        mailer.sendMail('send_code.mjml', mail, context)
      }
      else if (type === 'mobile') {
        await new DYSMS(config.options!.sms! || '').send(user.mobile!, verify_id ? 'setinfos' : 'verifyid', { code: verify.token })
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
   * 校验验证码
   * @param code  <String> 验证码
   */
  @Router({ method: 'post', path: '/verifycode' })
  @Filter( authenticate, securityFillter.getRegisterConfig )
  public async verifyCode (setting: Register.Config, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { code } = req.body
    let user: responseUserDocument = req.user as responseUserDocument
    try {
      let verify: responseVerifyDocument = await verifyProxy.Dao.findOne({ type: 'code', user: user._id, token: code }) as responseVerifyDocument
      if (!verify) {
        return res.api(null, __ErrorCode.ERROR_VERIFY_CODE_FAILED)
      }
      let difftime: number = Date.now() - verify.create_at.getTime()
      let timeout: number = Number(setting.lost_pass.timeout) * 1000
      if (difftime > timeout) {
        return res.api(null, __ErrorCode.ERROR_VERIFY_CODE_TIMEOUT)
      }
      return res.api({ _id: verify._id })
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 修改密码
   * @param passport  <String> 新密码
   * @param verify_id  <String> 身份验证 ID
   */
  @Router({ method: 'post', path: '/setpassword' })
  @Filter( authenticate, securityFillter.setPassword )
  public async setPassword (setPassword: IPassport.setPasswordDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { document, setting } = setPassword
    let { verify_id } = document
    let user: responseUserDocument = req.user as responseUserDocument
    try {
      let verify: responseVerifyDocument = await verifyProxy.Dao.findOne({ type: 'code', user: user._id, _id: verify_id }) as responseVerifyDocument
      if (!verify) {
        return res.api(null, __ErrorCode.ERROR_VERIFY_ID_FAILED)
      }
      let difftime: number = Date.now() - verify.create_at.getTime()
      let timeout: number = Number(setting.lost_pass.timeout) * 1000
      if (difftime > timeout) {
        return res.api(null, __ErrorCode.ERROR_VERIFY_ID_TIMEOUT)
      }
      let result = await userProxy.setPassword({ _id: user._id }, document)
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
