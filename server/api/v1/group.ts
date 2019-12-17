import { Request, Response, NextFunction } from 'express'
import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { IResponse } from '@/types/resuful'
import { authenticate, permission } from '~/middleware/auth'
import { loadError } from '@/utils/error'
import config from '~/config'
import groupProxy from '~/proxys/group'
import { 
  responseDocument as responseGroupDocument, 
  createDocument as createGroupDocument, 
  editDocument as editGroupDocument,
  removeDocument as removeGroupDocument 
} from '@/types/proxys/group'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { QueryOptions, UpdateWriteResult, DeleteWriteResult } from 'kenote-mongoose-helper'
import groupFilter from '~/filters/api_v1/group'

const { language, site_name } = config
const { ErrorInfo, CustomError, __ErrorCode } = loadError(language)

@Path('/ucenter')
export default class Group extends Controller {

  /**
   * 用户组列表
   * @param name  <String> 名称
   */
  @Router( { method: 'post', path: '/group/:type(list|lite)' })
  @Filter( authenticate, permission('/ucenter/group', 'list') )
  public async list (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let { name } = req.body
    let user: responseUserDocument = req.user as responseUserDocument
    let conditions: any = {}
    let options: QueryOptions = {}
    if (name) {
      conditions.name = new RegExp(name)
    }
    if (type === 'lite') {
      options = {
        select: ['_id', 'name', 'level'],
        populate: { path: '' }
      }
      conditions.level = { $lt: user.group.level }
    }
    try {
      let groups: responseGroupDocument[] = await groupProxy.Dao.find(conditions, options) as responseGroupDocument[]
      return res.api(groups)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 创建用户组
   * @param name  <String> 名称
   * @param level  <Number> 权级
   * @param description  <String> 描述
   */
  @Router({ method: 'post', path: '/group/create' })
  @Filter( authenticate, permission('/ucenter/group', 'create'), groupFilter.create )
  public async create (document: createGroupDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let group: responseGroupDocument = await groupProxy.create(document) as responseGroupDocument
      return res.api(group)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 编辑用户组
   * @param name  <String> 名称
   * @param level  <Number> 权级
   * @param description  <String> 描述
   */
  @Router({ method: 'post', path: '/group/edit/:_id' })
  @Filter( authenticate, permission('/ucenter/group', 'edit'), groupFilter.edit )
  public async edit (edit: editGroupDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, data } = edit
    try {
      let result: UpdateWriteResult = await groupProxy.update(conditions, data)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 删除用户组
   * @param move  <String> 需要移入的用户组
   */
  @Router({ method: 'delete', path: '/group/:_id' })
  @Filter( authenticate, permission('/ucenter/group', 'remove'), groupFilter.remove )
  public async remove (remove: removeGroupDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, options } = remove
    try {
      let result: DeleteWriteResult = await groupProxy.remove(conditions, options)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 编辑权限
   * @param platform  <Number[]> 频道入口
   * @param access  <String[]> 访问权限
   */
  @Router({ method: 'post', path: '/group/:authority(platform|access)/:_id' })
  @Filter( authenticate, permission('/ucenter/group', 'edit'), groupFilter.authority )
  public async authority (edit: editGroupDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, data } = edit
    console.log(data)
    try {
      let result: UpdateWriteResult = await groupProxy.update(conditions, data)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}
