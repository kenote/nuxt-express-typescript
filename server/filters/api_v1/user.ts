import { Request, Response, NextFunction } from 'express'
import { IResponse } from '@/types/resuful'
import { toPageInfo } from '~/utils'
import { 
  responseDocument as responseUserDocument, 
  FindType, 
  findDocument as findUserDocument, 
  editDocument as editUserDocument, 
  updateDocument as updateUserDocument 
} from '@/types/proxys/user'
import { oc } from 'ts-optchain'
import config from '~/config'
import { loadError } from '@/utils/error'
import { isMongoId } from 'validator'
import { filterUserLevel } from '~/middleware/auth'
import userProxy from '~/proxys/user'
import { Maps } from 'kenote-config-helper'

const { language } = config
const { __ErrorCode, __ErrorMessage, CustomError } = loadError(language)

class User {

  public async list (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
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

  public check (req: Request, res: IResponse, next: NextFunction): Response | void {
    let { _id } = req.body
    if (!isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    return next()
  }

  public async edit (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    if (!isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let auth: responseUserDocument = req.user as responseUserDocument
    let doc: editUserDocument = {
      conditions: { _id },
      data: getUserDocument(req.body)
    }
    try {
      let user: responseUserDocument = await userProxy.Dao.findOne({ _id }) as responseUserDocument
      if (!user) {
        return res.api(null, __ErrorCode.ERROR_AUTH_OPERATE_USER_NULL)
      }
      filterUserLevel(auth, user.group.level, 9000)
      return next(doc)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}

export default new User()

function getUserDocument (body: Maps<any>): updateUserDocument {
  
  return { ...body }
}
