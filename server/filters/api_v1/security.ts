import { Request, Response, NextFunction } from 'express'
import { IResponse } from '@/types/resuful'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { Register } from '@/types/resuful'
import * as passport from '@/types/passport'
import { Filter, asyncFilterData } from 'kenote-validate-helper';
import { rules, formatRules } from '~/rules/passport'

class Security {

  /**
   * 获取注册配置
   */
  public getRegisterConfig (req: Request, res: Response, next: NextFunction): Response | void {
    let setting: Register.Config = loadData('data/register') as Register.Config
    return next(setting)
  }

  /**
   * 发送验证码
   */
  public async sendCode (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let { name, verify_id } = req.body
    let setting: Register.Config = loadData('data/register') as Register.Config
    let document: passport.sendCode = {}
    if (!verify_id) return next({ document, setting })
    let filters: Filter[] = [
      {
        key    : 'name',
        rules  : [ ...rules[type], ...formatRules[type] ],
        value  : name
      },
      {
        key    : 'verify_id',
        rules  : rules.verify_id,
        value  : verify_id
      }
    ]
    try {
      document = await asyncFilterData(filters) as passport.sendCode
      return next({ document, setting })
    } catch (error) {
      return res.api(null, error)
    }
  }

  /**
   * 修改密码
   */
  public async setPassword (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { password, verify_id } = req.body
    let setting: Register.Config = loadData('data/register') as Register.Config
    let filters: Filter[] = [
      {
        key    : 'password',
        rules  : [ ...rules.password, ...formatRules.password ],
        value  : password
      },
      {
        key    : 'verify_id',
        rules  : rules.verify_id,
        value  : verify_id
      }
    ]
    try {
      let document: passport.setPassword = await asyncFilterData(filters) as passport.setPassword
      return next({ document, setting })
    } catch (error) {
      return res.api(null, error)
    }
  }

  /**
   * 设置邮箱
   */
  public async setEmail (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { email, verify_id, code } = req.body
    let setting: Register.Config = loadData('data/register') as Register.Config
    let filters: Filter[] = [
      {
        key    : 'email',
        rules  : [ ...rules.email, ...formatRules.email ],
        value  : email
      },
      {
        key    : 'verify_id',
        rules  : rules.verify_id,
        value  : verify_id
      },
      {
        key    : 'code',
        rules  : rules.code,
        value  : code
      }
    ]
    try {
      let document: passport.setEmail = await asyncFilterData(filters) as passport.setEmail
      return next({ document, setting })
    } catch (error) {
      return res.api(null, error)
    }
  }

  /**
   * 设置手机
   */
  public async setMobile (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { mobile, verify_id, code } = req.body
    let setting: Register.Config = loadData('data/register') as Register.Config
    let filters: Filter[] = [
      {
        key    : 'mobile',
        rules  : [ ...rules.mobile, ...formatRules.mobile ],
        value  : mobile
      },
      {
        key    : 'verify_id',
        rules  : rules.verify_id,
        value  : verify_id
      },
      {
        key    : 'code',
        rules  : rules.code,
        value  : code
      }
    ]
    try {
      let document: passport.setMobile = await asyncFilterData(filters) as passport.setMobile
      return next({ document, setting })
    } catch (error) {
      return res.api(null, error)
    }
  }
}

export default new Security()
