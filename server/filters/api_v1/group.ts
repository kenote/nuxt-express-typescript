import { Request, Response, NextFunction } from 'express'
import { IResponse } from '@/types/resuful'
import { 
  createDocument as createGroupDocument, 
  editDocument as editGroupDocument, 
  responseDocument as responseGroupDocument, 
  removeDocument as removeGroupDocument 
} from '@/types/proxys/group'
import { createDocument as createStoreDocument } from '@/types/proxys/store'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { Maps } from 'kenote-config-helper'
import config from '~/config'
import { loadError } from '@/utils/error'
import { isMongoId } from 'validator'
import groupProxy from '~/proxys/group'
import { filterUserLevel } from '~/middleware/auth'

const { language } = config
const { __ErrorCode, CustomError } = loadError(language)

class Group {

  /**
   * 创建用户组
   */
  public create (req: Request, res: IResponse, next: NextFunction): Response | void {
    let body: createGroupDocument = getGroupDocument(req.body)
    let auth: responseUserDocument = req.user as responseUserDocument
    try {
      filterUserLevel(auth, body.level, 9998)
      return next(body)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 编辑用户组
   */
  public async edit (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let auth: responseUserDocument = req.user as responseUserDocument
    if (!isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let doc: editGroupDocument = {
      conditions: { _id },
      data: getGroupDocument(req.body)
    }
    try {
      let group: responseGroupDocument = await groupProxy.Dao.findOne(doc.conditions) as responseGroupDocument
      if (!group) {
        return res.api(null, __ErrorCode.ERROR_AUTH_OPERATE_GROUP_NULL)
      }
      filterUserLevel(auth, group.level, 9998)
      return next(doc)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 删除用户组
   */
  public async remove (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let { move } = req.body
    let auth: responseUserDocument = req.user as responseUserDocument
    if (!isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    let doc: removeGroupDocument = {
      conditions: { _id },
      options: { move }
    }
    try {
      let group: responseGroupDocument = await groupProxy.Dao.findOne(doc.conditions) as responseGroupDocument
      if (!group) {
        return res.api(null, __ErrorCode.ERROR_AUTH_OPERATE_GROUP_NULL)
      }
      filterUserLevel(auth, group.level, 9998)
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
    let doc: editGroupDocument = {
      conditions: { _id },
      data: {
        [authority]: req.body[authority]
      }
    }
    try {
      let group: responseGroupDocument = await groupProxy.Dao.findOne(doc.conditions) as responseGroupDocument
      if (!group) {
        return res.api(null, __ErrorCode.ERROR_AUTH_OPERATE_GROUP_NULL)
      }
      filterUserLevel(auth, group.level, 9998)
      return next(doc)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

}

export default new Group()

function getGroupDocument (body: Maps<any>): createGroupDocument {
  let name: string = body.name
  let level: number = Number(body.level)
  let description: string = body.description
  let download_type: string | string[] | undefined = body.download_type || []
  let upload_type: string[] | undefined = body.upload_type || []
  let store: createStoreDocument = { 
    download_type: Array.isArray(download_type) ? download_type : (download_type || '').split(','), 
    upload_type: Array.isArray(upload_type) ? upload_type : (upload_type || '').split(',')
  }
  return { name, level, description, store }
}
