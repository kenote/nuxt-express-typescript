import { Request, Response, NextFunction } from 'express'
import { IResponse } from '@/types/resuful'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { findDocument as findDitchDocument, createDocument as createDitchDocument } from '@/types/proxys/ditch'
import { toPageInfo } from '~/utils'
import { rules } from '~/rules/ditch'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { Filter, Rule, asyncFilterData } from 'kenote-validate-helper'
import { loadError } from '@/utils/error'
import config from '~/config'
import { format } from 'util'
import { formatArray, isYaml } from '@/utils'
import { isMongoId } from 'validator'

const { language } = config
const { __ErrorCode, __ErrorMessage, CustomError } = loadError(language)

class Ditch {

  /**
   * 获取渠道列表
   */
  public list (req: Request, res: IResponse, next: NextFunction): Response | void {
    let { channel } = req.params
    let user: responseUserDocument = req.user as responseUserDocument
    let userLevel: number = user.group.level
    let conditions: any = {
      channel
    }
    if (userLevel < 9000) {
      conditions.teams = {
        $elemMatch: { $in: user.teams }
      }
    }
    return next(conditions)
  }

  /**
   * 获取渠道列表 [分页]
   */
  public pagelist (req: Request, res: IResponse, next: NextFunction): Response | void {
    let { channel } = req.params
    let user: responseUserDocument = req.user as responseUserDocument
    let userLevel: number = user.group.level
    let conditions: any = {
      channel
    }
    if (userLevel < 9000) {
      conditions.teams = {
        $elemMatch: { $in: user.teams }
      }
    }
    let { limit, skip } = toPageInfo(req.body.page, req.body.size || 15)
    let findDitch: findDitchDocument = {
      conditions,
      options: {
        limit,
        skip,
      }
    }
    return next(findDitch)
  }

  /**
   * 添加渠道
   */
  public async create (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel } = req.params
    let { label, name, teams, group } = req.body
    let filters: Filter[] = [
      {
        key    : 'label',
        rules  : rules.label,
        value  : label
      },
      {
        key    : 'name',
        rules  : rules.name,
        value: name
      },
      // {
      //   key    : 'group',
      //   rules  : rules.group,
      //   value  : group
      // },
    ]
    try {
      let document: createDitchDocument = await asyncFilterData(filters) as createDitchDocument
      document.channel = channel

      return next(document)
    } catch (error) {
      return res.api(null, error)
    }
  }

  public async update (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel } = req.params
    let { content } = req.body
    let filters: Filter[] = [
      {
        key    : 'content',
        rules  : [
          {
            required     : true,
            message      : format(__ErrorMessage.ERROR_VALID_DATE_REQUIRED, '内容'),
            code         : __ErrorCode.ERROR_VALID_DATE_REQUIRED
          },
          {
            validator    : isYaml,
            message      : format(__ErrorMessage.ERROR_VALID_DATE_FORMAT, '内容', 'Yaml'),
            code         : __ErrorCode.ERROR_VALID_DATE_FORMAT
          }
        ],
        value  : content
      },
      {
        key    : 'channel',
        rules  : [],
        value  : channel
      }
    ]
    try {
      let document = await asyncFilterData(filters)
      return next(document)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async allot (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel } = req.params
    let { team, ditchs } = req.body
    if (!isMongoId(team)) {
      return res.api(null, __ErrorCode.ERROR_VALID_IDMARK_NOTEXIST)
    }
    return next({ channel, team, ditchs })
  }

}

export default new Ditch()
