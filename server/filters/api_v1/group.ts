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

const { language } = config
const { __ErrorCode, __ErrorMessage, CustomError } = loadError(language)

class Group {

  /**
   * 创建用户组
   */
  public create (req: Request, res: IResponse, next: NextFunction): Response | void {
    let body: createGroupDocument = getGroupDocument(req.body)
    let user: responseUserDocument = req.user as responseUserDocument
    let userLevel: number = user.group.level
    if (body.level >= userLevel && userLevel < 9999) {
      return res.api(null, __ErrorCode.ERROR_BYLOND_LEVEL_OPERATE)
    }
    return next(body)
  }

  /**
   * 编辑用户组
   */
  public async edit (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let doc: editGroupDocument = {
      conditions: { _id },
      data: getGroupDocument(req.body)
    }
    let user: responseUserDocument = req.user as responseUserDocument
    let userLevel: number = user.group.level
    if (doc.data.level >= userLevel && userLevel < 9999) {
      return res.api(null, __ErrorCode.ERROR_BYLOND_LEVEL_OPERATE)
    }
    if (!isMongoId(_id)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    try {
      let group: responseGroupDocument = await groupProxy.Dao.findOne(doc.conditions) as responseGroupDocument
      if (!group) {
        return res.api(null, __ErrorCode.ERROR_AUTH_OPERATE_GROUP_NULL)
      }
      if (group.level >= userLevel && userLevel < 9999) {
        return res.api(null, __ErrorCode.ERROR_BYLOND_LEVEL_OPERATE)
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
   * 删除用户组
   */
  public async remove (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { _id } = req.params
    let { move } = req.body
    let user: responseUserDocument = req.user as responseUserDocument
    let userLevel: number = user.group.level
    if (userLevel < 9998) {
      return res.api(null, __ErrorCode.ERROR_ONLY_ADVANCED_ADMIN)
    }
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
