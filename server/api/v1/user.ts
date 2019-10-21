import { Request, Response, NextFunction } from 'express'
import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { IResponse } from '@/types/resuful'
import { authenticate, permission } from '~/middleware/auth'
import { loadError } from '@/utils/error'
import config from '~/config'
import { responseDocument as responseUserDocument, findDocument as findUserDocument } from '@/types/proxys/user'
import userFilter from '~/filters/api_v1/user'
import userProxy from '~/proxys/user'
import { ListData } from 'kenote-mongoose-helper'

const { language, site_name } = config
const { ErrorInfo, CustomError, __ErrorCode } = loadError(language)

@Path('/ucenter')
export default class User extends Controller {

  /**
   * 用户列表
   * @param create_at  <Date[]> 注册时间段
   * @param groups  <String[]> 用户组
   * @param findtype  <String> 查询名称类型；‘username' | 'nickname' | 'email' |'mobile'
   * @param findname  <String> 查询名称，可模糊
   * @param page  <Number> 当前页
   */
  @Router({ method: 'post', path: '/user/list' })
  @Filter( authenticate, permission('/ucenter/user', 'list'), userFilter.list )
  public async list (findUser: findUserDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, options } = findUser
    try {
      let userData: ListData = await userProxy.Dao.list(conditions, options) as ListData
      return res.api(userData)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}

