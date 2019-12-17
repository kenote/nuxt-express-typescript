import { Request, Response, NextFunction } from 'express'
import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { UpdateWriteResult, DeleteWriteResult, QueryOptions } from 'kenote-mongoose-helper'
import { IResponse } from '@/types/resuful'
import { authenticate, permission } from '~/middleware/auth'
import { loadError } from '@/utils/error'
import config from '~/config'
import teamProxy from '~/proxys/team'
import userProxy from '~/proxys/user'
import groupProxy from '~/proxys/group'
import { 
  responseDocument as responseTeamDocument, 
  createDocument as createTeamDocument, 
  editDocument as editTeamDocument,
  removeDocument as removeTeamDocument
} from '@/types/proxys/team'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { responseDocument as responseGroupDocument } from '@/types/proxys/group'
import teamFilter from '~/filters/api_v1/team'
import { map } from 'lodash'

const { language, site_name } = config
const { ErrorInfo, CustomError, __ErrorCode } = loadError(language)

@Path('/ucenter')
export default class Team extends Controller {

  /**
   * 团队列表
   */
  @Router(
    { method: 'get', path: '/team/list' },
    { method: 'get', path: '/team/list/:channel' }
  )
  @Filter( authenticate, permission('/ucenter/team', 'list'), teamFilter.list )
  public async list (conditions: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let teams: responseTeamDocument[] = <responseTeamDocument[]> await teamProxy.Dao.find(conditions)
      return res.api(teams)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 创建团队
   */
  @Router({ method: 'post', path: '/team/create' })
  @Filter( authenticate, permission('/ucenter/team', 'create'), teamFilter.create )
  public async create (document: createTeamDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let team: responseTeamDocument = await teamProxy.Dao.insert(document) as responseTeamDocument
      return res.api(team)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 编辑团队
   */
  @Router({ method: 'post', path: '/team/edit/:_id' })
  @Filter( authenticate, permission('/ucenter/team', 'edit'), teamFilter.edit )
  public async edit (edit: editTeamDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, data } = edit
    try {
      let result: UpdateWriteResult = await teamProxy.Dao.updateOne(conditions, data)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 删除团队
   */
  @Router({ method: 'delete', path: '/team/:_id'})
  @Filter( authenticate, permission('/ucenter/team', 'remove'), teamFilter.remove )
  public async remove (remove: removeTeamDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions } = remove
    try {
      let result: DeleteWriteResult = await teamProxy.remove(conditions)
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
  @Router({ method: 'post', path: '/team/:authority(platform|access)/:_id' })
  @Filter( authenticate, permission('/ucenter/team', 'edit'), teamFilter.authority )
  public async authority (edit: editTeamDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, data } = edit
    try {
      let result: UpdateWriteResult = await teamProxy.Dao.updateOne(conditions, data)
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
  @Router({ method: 'put', path: '/team/rtsps/:_id' })
  @Filter( authenticate, permission('/ucenter/team', 'edit'), teamFilter.rtsps )
  public async rtsps (edit: editTeamDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, data } = edit
    try {
      let result: UpdateWriteResult = await teamProxy.Dao.updateOne(conditions, data)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 获取团队成员
   */
  @Router({ method: 'post', path: '/team/people/:_id' })
  @Filter( authenticate )
  public async people (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let options: QueryOptions = {
      select: ['id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'group', 'teams' ],
      populate: [
        {
          path: 'group',
          select: ['id', 'name', 'level', 'description']
        },
        {
          path: 'teams',
          select: ['id', 'name', 'description']
        }
      ],
    }
    try {
      let users: responseUserDocument[] = await userProxy.Dao.find({ teams: _id }, options) as responseUserDocument[]
      return res.api(users)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 检索可选用户 
   */
  @Router({ method: 'get', path: '/team/invitee_suggestions' })
  @Filter( authenticate )
  public async invitee_suggestions (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { q } = req.query
    if (!q) return res.api([])
    let options: QueryOptions = {
      select: ['id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'group', 'teams' ],
      populate: [
        {
          path: 'group',
          select: ['id', 'name', 'level', 'description']
        },
        {
          path: 'teams',
          select: ['id', 'name', 'description']
        }
      ],
    }
    try {
      let groups: responseGroupDocument[] = await groupProxy.Dao.find({ level: { $lt: 8000 } }) as responseGroupDocument[]
      let conditions: any = {
        $or: [
          { username  : new RegExp(q) },
          { email     : new RegExp(q) },
          { mobile    : new RegExp(q) },
          { nickname  : new RegExp(q) }
        ],
        group: { $in: map(groups, '_id') }
      }
      let users: responseUserDocument[] = await userProxy.Dao.find(conditions, options) as responseUserDocument[]
      return res.api(users)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 添加团队成员
   */
  @Router({ method: 'post', path: '/team/people/:_id/add' })
  @Filter( authenticate, teamFilter.addPeople )
  public async addPeople (document: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id, peoples } = document as {
      _id           : string
      peoples       : string[]
    }
    try {
      let result: UpdateWriteResult = await userProxy.Dao.update({ _id: { $in: peoples } }, { $addToSet: { teams: _id } }, { multi: true })
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 移除团队成员
   */
  @Router({ method: 'delete', path: '/team/people/:_id' })
  @Filter( authenticate, teamFilter.removePeople )
  public async removePeople (document: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id, people } = document as {
      _id           : string
      people        : string
    }
    try {
      let result: UpdateWriteResult = await userProxy.Dao.updateOne({ _id: people }, { $pull: { teams: _id } })
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}
