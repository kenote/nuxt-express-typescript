import { Request, Response, NextFunction } from 'express'
import { Controller, Router, Filter } from 'kenote-express-helper'
import { IResponse } from '@/types/resuful'
import { authenticate, permission } from '~/middleware/auth'
import { loadError } from '@/utils/error'
import config from '~/config'
import { responseDocument as responseTicketDocument, createDocument as createTicketDocument } from '@/types/proxys/ticket'
import { responseDocument as responseUserDocument, findDocument as findUserDocument } from '@/types/proxys/user'
import { responseDocument as responseGroupDocument } from '@/types/proxys/group'
import ticketProxy from '~/proxys/ticket'
import groupProxy from '~/proxys/group'
import { DeleteWriteResult } from 'kenote-mongoose-helper'
import { map } from 'lodash'
import ticketFilter from '~/filters/api_v1/ticket'

const { language } = config
const { CustomError } = loadError(language)

export default class Ticket extends Controller {

  /**
   * 获取列表
   */
  @Router({ method: 'post', path: '/ucenter/ticket/list' })
  @Filter( authenticate, permission('/ucenter/ticket', 'list'))
  public async list (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let auth: responseUserDocument = req.user as responseUserDocument
    try {
      let groups: responseGroupDocument[] = await groupProxy.Dao.find({ level: { $lte: auth.group.level } }) as responseGroupDocument[]
      let tickets: responseTicketDocument[] = await ticketProxy.Dao.find({ 'type': 'register', 'setting.group': { $in: map(groups, '_id') } }) as responseTicketDocument[]
      return res.api(tickets)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 创建邀请码
   * @param group  <String> 用户组
   * @param stint  <Number> 最大使用数量
   * @param last_at  <Date> 过期时间
   */
  @Router({ method: 'post', path: '/ucenter/ticket/create' })
  @Filter( authenticate, permission('/ucenter/ticket', 'create'), ticketFilter.create )
  public async create (document: createTicketDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let ticket: responseTicketDocument = await ticketProxy.create(document) as responseTicketDocument
      return res.api(ticket)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 删除邀请码
   * @param _uids  <String[]>  邀请码ID; 群删时有效
   */
  @Router(
    { method: 'delete', path: '/ucenter/ticket/:_id' },
    { method: 'delete', path: '/ucenter/ticket' }
  )
  @Filter( authenticate, permission('/ucenter/ticket', 'remove'), ticketFilter.remove )
  public async remove (conditions: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let result: DeleteWriteResult = await ticketProxy.Dao.remove(conditions)
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}
