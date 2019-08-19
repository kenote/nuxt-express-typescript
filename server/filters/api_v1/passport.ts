import { Request, Response, NextFunction } from 'express'
import { IResponse } from '@/types/resuful'
import * as passport from '@/types/passport'
import { Filter, Rule, asyncFilterData } from 'kenote-validate-helper'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { Maps } from 'kenote-config-helper'
import { loadError } from '@/utils/error'
import config from '~/config'
import { rules, formatRules } from '~/rules/passport'
import { responseDocument as responseTicketDocument } from '@/types/proxys/ticket'
import { registerDocument } from '@/types/proxys/user'
import { Register } from '@/types/resuful'
import { validTicket } from '~/utils/ticket'
import { oc } from 'ts-optchain'
import groupProxy from '~/proxys/group'
import { responseDocument as responseGroupDocument } from '@/types/proxys/group'

const { language } = config
const { __ErrorCode, __ErrorMessage } = loadError(language)

class Passport {

  /**
   * 注册用户数据过滤
   * @param username string 
   * @param email string
   * @param mobile string
   * @param password string
   * @param invitation string
   */
  public async register (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { username, email, mobile, password, invitation } = req.body as passport.Register
    let filters: Filter[] = [
      {
        key    : 'username',
        rules  : [ ...rules.username, ...formatRules.username ],
        value  : username
      },
      {
        key    : 'email',
        rules  : [ ...rules.email, ...formatRules.email ],
        value  : email
      },
      {
        key    : 'password',
        rules  : [ ...rules.password, ...formatRules.password ],
        value  : password
      },
    ]
    let setting: Register.Config = loadData('data/register') as Register.Config
    try {
      let ticket!: responseTicketDocument | null
      if (setting.invitation) {
        ticket = await validTicket({ cdkey: invitation as string }, { name: '邀请码', type: 'register', key: 'cdkey' })
      }
      let document: registerDocument = await asyncFilterData(filters) as registerDocument
      if (ticket) {
        let ticketSetting: Maps<any> = oc(ticket).setting({})
        document.group = ticketSetting['group']
        if (ticketSetting['teams']) {
          document.teams = ticketSetting['teams']
        }
      }
      else {
        let group: responseGroupDocument = await groupProxy.Dao.findOne({ default: true }) as responseGroupDocument
        document.group = group._id
      }
      return next({ document, ticket, setting })
    } catch (error) {
      return res.api(null, error)
    }
  }

  /**
   * 用户登录数据过滤
   * @param username string 
   * @param password string
   */
  public async login (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { username, password } = req.body as passport.Login
    let filters: Filter[] = [
      {
        key    : 'username',
        rules  : rules.username,
        value  : username
      },
      {
        key    : 'password',
        rules  : rules.password,
        value  : password
      },
    ]
    try {
      let document: passport.Login = await asyncFilterData(filters) as passport.Login
      return next(document)
    } catch (error) {
      return res.api(null, error)
    }
  }

  public async verify_email_mobile (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let { token, id } = req.body
    let warnings: passport.VerifyWarning = {
      email: {
        timeout : __ErrorCode.ERROR_VERIFY_EMAIL_TIMEOUT,
        failed  : __ErrorCode.ERROR_VERIFY_EMAIL_FAILED
      },
      mobile: {
        timeout : __ErrorCode.ERROR_VERIFY_MOBILE_TIMEOUT,
        failed  : __ErrorCode.ERROR_VERIFY_MOBILE_FAILED
      }
    }
    let setting: Register.Config = loadData('data/register') as Register.Config

    return next({ setting, warnings, body: { type, token, id } })
  }

  /**
   * 发送验证码
   * @param name  <String> 电子邮箱 | 手机号 
   */
  public resetpwdCode (req: Request, res: IResponse, next: NextFunction): Response | void {
    let { type } = req.params
    let { name } = req.body
    let setting: Register.Config = loadData('data/register') as Register.Config
    return next({ type, document: { name }, setting })
  }

  /**
   * 重置密码
   * @param code  <String> 验证码
   * @param password  <String> 新密码
   * @param name  <String> 电子邮箱 | 手机号
   */
  public async resetpwd (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let { code, password, name } = req.body as passport.resetPwdDocument
    let filters: Filter[] = [
      {
        key    : 'code',
        rules  : rules.code,
        value  : code
      },
      {
        key    : 'password',
        rules  : [ ...rules.password, ...formatRules.password ],
        value  : password
      }
    ]
    type === 'email' && filters.push({
      key    : 'name',
      rules  : [ ...rules.email, ...formatRules.email ],
      value  : name
    })
    type === 'mobile' && filters.push({
      key    : 'name',
      rules  : [ ...rules.mobile, ...formatRules.mobile ],
      value  : name
    })
    let setting: Register.Config = loadData('data/register') as Register.Config
    try {
      let document: passport.resetPwdDocument = await asyncFilterData(filters) as passport.resetPwdDocument
      return next({ type, document, setting })
    } catch (error) {
      return res.api(null, error)
    }
  }
}

export default new Passport()
