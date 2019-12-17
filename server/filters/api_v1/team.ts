import { Request, Response, NextFunction } from 'express'
import { IResponse } from '@/types/resuful'
import { Filter, asyncFilterData } from 'kenote-validate-helper'
import { format } from 'util'
import { isMongoId } from 'validator'
import config from '~/config'
import { loadError } from '@/utils/error'
import { createDocument as createTeamDocument, editDocument as editTeamDocument, removeDocument, responseDocument as responseTeamDocument } from '@/types/proxys/team'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { filterUserLevel } from '~/middleware/auth'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { KenoteConfig } from 'kenote-config-helper'
import teamProxy from '~/proxys/team'
import { oc } from 'ts-optchain'

const { language } = config
const { __ErrorCode, CustomError, __ErrorMessage } = loadError(language)

class Team {

  /**
   * 团队列表
   */
  public async list (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel } = req.params
    let auth: responseUserDocument = req.user as responseUserDocument
    let conditions: any = {}
    if (channel) {
      let channels: KenoteConfig.Channel[] = loadData('data/channels', 'array') as KenoteConfig.Channel[]
      let project: KenoteConfig.Channel = channels.find( o => o.label === channel ) as KenoteConfig.Channel
      if (project) {
        conditions = { platform: project.id }
      }
    }
    try {
      filterUserLevel(auth, 0, 9000)
      return next(conditions)
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
  public async create (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { name, description } = req.body
    let auth: responseUserDocument = req.user as responseUserDocument
    let filters: Filter[] = [
      {
        key: 'name',
        rules: [
          {
            required : true,
            message  : format(__ErrorMessage.ERROR_VALID_NAME_REQUIRED, '团队'),
            code     : __ErrorCode.ERROR_VALID_NAME_REQUIRED
          }
        ],
        value: name
      }
    ]
    try {
      filterUserLevel(auth, 0, 9000)
      let document: createTeamDocument = await asyncFilterData(filters) as createTeamDocument
      document.description = description
      return next(document)
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
  public async edit (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let { name, description } = req.body
    let auth: responseUserDocument = req.user as responseUserDocument
    if (!isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let filters: Filter[] = [
      {
        key: 'name',
        rules: [
          {
            required : true,
            message  : format(__ErrorMessage.ERROR_VALID_NAME_REQUIRED, '团队'),
            code     : __ErrorCode.ERROR_VALID_NAME_REQUIRED
          }
        ],
        value: name
      }
    ]
    try {
      filterUserLevel(auth, 0, 9000)
      let document: createTeamDocument = await asyncFilterData(filters) as createTeamDocument
      document.description = description
      let doc: editTeamDocument = {
        conditions: { _id },
        data: document
      }
      return next(doc)
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
  public async remove (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let auth: responseUserDocument = req.user as responseUserDocument
    if (!isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    try {
      filterUserLevel(auth, 0, 9000)
      let doc: removeDocument = {
        conditions: { _id }
      }
      return next(doc)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 编辑权限
   */
  public async authority (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id, authority } = req.params
    let auth: responseUserDocument = req.user as responseUserDocument
    if (!isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let doc: editTeamDocument = {
      conditions: { _id },
      data: {
        [authority]: req.body[authority]
      }
    }
    try {
      filterUserLevel(auth, 0, 9000)
      if (authority === 'platform') {
        let platforms: number[] = req.body[authority]
        let channels: KenoteConfig.Channel[] = loadData('data/channels', 'array') as KenoteConfig.Channel[]
        let projects: KenoteConfig.Channel[] = channels.filter( o => platforms.includes(o.id) )
        let keywords: string = projects.map( o => o.id > 1000 ? `/project/${o.label}` : `/${o.label}`).join('|')
        let team: responseTeamDocument = await teamProxy.Dao.findOne(doc.conditions) as responseTeamDocument
        if (team) {
          let access: string[] = team.access.filter( o => new RegExp(`^(${keywords})`).test(o) )
          if (team.access.filter( o => !access.includes(o) ).length > 0) {
            doc.data['access'] = access
          }
          
        }
      }
      return next(doc)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 编辑项目线路
   */
  public async rtsps (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let { channel, rtsps } = req.body
    let auth: responseUserDocument = req.user as responseUserDocument
    if (!isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let doc: editTeamDocument = {
      conditions: { _id },
      data: {
        rtsps: { }
      }
    }
    try {
      filterUserLevel(auth, 0, 9000)
      let team: responseTeamDocument = await teamProxy.Dao.findOne(doc.conditions) as responseTeamDocument
      doc.data['rtsps'] = { ...oc(team).rtsps({}), [channel]: rtsps }
      return next(doc)
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
  public async addPeople (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let { peoples } = req.body
    let auth: responseUserDocument = req.user as responseUserDocument
    if (!isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    for (let people of peoples) {
      if (!isMongoId(people)) {
        return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
      }
    }
    try {
      filterUserLevel(auth, 0, 8000)
      return next({ _id, peoples })
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
  public async removePeople (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let { people } = req.body
    let auth: responseUserDocument = req.user as responseUserDocument
    if (!isMongoId(_id) || !isMongoId(people)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    try {
      filterUserLevel(auth, 0, 8000)
      return next({ _id, people })
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}

export default new Team()
