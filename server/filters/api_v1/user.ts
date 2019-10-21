import { Request, Response, NextFunction } from 'express'
import { IResponse } from '@/types/resuful'
import { toPageInfo } from '~/utils'
import { responseDocument as responseUserDocument, FindType, findDocument as findUserDocument } from '@/types/proxys/user'
import { oc } from 'ts-optchain'

class User {

  public list (req: Request, res: IResponse, next: NextFunction): Response | void {
    let { page, limit, skip } = toPageInfo(req.body.page, req.body.size || 15)
    let { create_at, groups, findname } = req.body
    let conditions: any = {}
    if (findname) {
      let findtype: FindType = req.body.findtype
      conditions = { ...conditions, [findtype]: new RegExp(findname) }
    }
    if (Array.isArray(groups) && groups.length > 0) {
      conditions = { ...conditions, group: { $in: groups } }
    }
    if (Array.isArray(create_at)) {
      let [ begin, end ] = create_at
      if (begin && end) {
        conditions = { ...conditions, create_at: { $gte: begin, $lt: end } }
      }
    }
    let findUser: findUserDocument = {
      conditions,
      options: {
        limit,
        skip,
        select: ['_id', 'id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'binds', 'group', 'teams', 'access', 'create_at', 'update_at', 'jw_token']
      }
    }
    return next(findUser)
  }
}

export default new User()
