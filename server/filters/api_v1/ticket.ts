import { Request, Response, NextFunction } from 'express'
import { IResponse } from '@/types/resuful'
import config from '~/config'
import { loadError } from '@/utils/error'
import { isMongoId } from 'validator'
import { Ucenter } from '@/types'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { responseDocument as responseGroupDocument } from '@/types/proxys/group'
import { Filter, asyncFilterData } from 'kenote-validate-helper'
import { format } from 'util'
import { isDate } from 'lodash'
import { createDocument as createTicketDocument } from '@/types/proxys/ticket'
import groupProxy from '~/proxys/group'
import { filterUserLevel } from '~/middleware/auth'

const { language } = config
const { __ErrorCode, __ErrorMessage, CustomError } = loadError(language)

class Ticket {

  /**
   * 创建邀请码
   */
  public async create (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { group, last_at, stint } = req.body as Ucenter.CreateTicket
    let auth: responseUserDocument = req.user as responseUserDocument
    let filters: Filter[] = [
      {
        key    : 'group',
        rules  : [
          {
            required   : true,
            message    : __ErrorMessage.ERROR_VALID_GROUP_REQUIRED,
            code       : __ErrorCode.ERROR_VALID_GROUP_REQUIRED
          }
        ],
        value  : group
      },
      {
        key    : 'last_at',
        rules  : [
          {
            required   : true,
            message    : format(__ErrorMessage.ERROR_VALID_DATE_REQUIRED, '过期时间'),
            code       : __ErrorCode.ERROR_VALID_DATE_REQUIRED
          },
          {
            validator  : (value: string) => isDate(new Date(value)),
            message    : format(__ErrorMessage.ERROR_VALID_DATE_FORMAT, '过期时间'),
            code       : __ErrorCode.ERROR_VALID_DATE_FORMAT
          }
        ],
        value  : last_at
      }
    ]
    try {
      let document: any = await asyncFilterData(filters)
      let group: responseGroupDocument = await groupProxy.Dao.findOne({ _id: document.group }) as responseGroupDocument
      if (!group) {
        return res.api(null, __ErrorCode.ERROR_VALID_GROUP_NOTEXIST)
      }
      filterUserLevel(auth, group.level, 9998)
      let body: createTicketDocument = getTicketDocument({ ...document, stint, group })
      return next(body)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }

  }

  /**
   * 删除邀请码
   */
  public remove (req: Request, res: IResponse, next: NextFunction): Response | void {
    let { _id } = req.params
    let { _ids } = req.body
    let auth: responseUserDocument = req.user as responseUserDocument
    let conditions: any = {}
    if (_id) {
      if (!isMongoId(_id)) {
        return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
      }
      conditions = { _id }
    }
    else {
      conditions = { _id: { $in: Array.isArray(_ids) ? _ids : [] } }
    }
    try {
      filterUserLevel(auth, 0, 9998)
      return next(conditions)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}

export default new Ticket()

function getTicketDocument (body: any): createTicketDocument {
  let { group } = body
  let type: string = 'register'
  let setting: any = { group: group._id }
  let name: string = `注册 -> ${group.name}`
  let stint: number = Number(body.stint | 1)
  let last_at: Date = new Date(body.last_at)
  return { type, setting, name, stint, last_at }
}
