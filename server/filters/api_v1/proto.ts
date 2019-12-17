import { Request, Response, NextFunction } from 'express'
import { IResponse } from '@/types/resuful'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { ProtoOptions, ProtoAPI, ProtoSend } from '@/types/proto'
import { isEmpty, map, isString } from 'lodash'
import { loadError } from '@/utils/error'
import config from '~/config'
import { Maps } from 'kenote-config-helper'
import { oc } from 'ts-optchain'
import { formatArray, isYaml } from '@/utils'
import * as dayjs from 'dayjs'
import ditchProxy from '~/proxys/ditch'
import { responseDocument as responseDitchDocument } from '@/types/proxys/ditch'
import { Filter, Rule, asyncFilterData } from 'kenote-validate-helper'
import { format } from 'util'
import { UpdateSettingDocument } from '@/types/proto'
import { permissionFilter } from '~/middleware/auth'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'

const { language } = config
const { __ErrorCode, __ErrorMessage, CustomError } = loadError(language)

class Proto {

  public async send (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel, tag } = req.params
    let auth: responseUserDocument = req.user as responseUserDocument
    try {
      permissionFilter(req.path, 'access', auth)
      let setting: ProtoOptions = loadData(`projects/${channel}/setting`) as ProtoOptions
      if (isEmpty(setting)) {
        return res.api(null, __ErrorCode.ERROR_NOT_FOUND_CHANNEL)
      }
      let apis: Maps<ProtoAPI> = loadData(`projects/${channel}/api`) as Maps<ProtoAPI>
      if (isEmpty(apis) || !Object.keys(apis).includes(tag)) {
        return res.api(null, __ErrorCode.ERROR_NOT_FOUND_API)
      }
      let { autoFields, request, alias, proto, parse, ditchOptions, parameter } = apis[tag]
      let payload: Maps<any> = formatPayload(req.body, request, alias)
      if (autoFields) {
        for (let field in autoFields) {
          let { reference, subtract, add } = autoFields[field]
          let fieldValue: number = payload[reference]
          if (subtract) {
            let [ value, unit ] = subtract
            payload[field] = dayjs(fieldValue).subtract(Number(value), unit as dayjs.UnitType).toDate().getTime()
          }
          else if (add) {
            let [ value, unit ] = add
            payload[field] = dayjs(fieldValue).add(Number(value), unit as dayjs.UnitType).toDate().getTime()
          }
        }
      }
      if (ditchOptions) {
        let [ item, key ] = ditchOptions
        let label: string = oc(payload)[item]('')
        if (label) {
          let ditchs: responseDitchDocument[] = await ditchProxy.Dao.find({ channel, label: { $in: label.split(/\,/) } }) as responseDitchDocument[]
          if (ditchs) {
            payload[item] = map(ditchs, key || 'name').join(',')
          }
        }
      }
      let { rtsp_key } = req.headers
      payload = { ...payload, ...parameter }
      return next({ setting, payload, proto, parse, rtsp_key })
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  public async updateSetting (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel, tag } = req.params
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
      }
    ]
    try {
      let document: UpdateSettingDocument = await asyncFilterData(filters) as UpdateSettingDocument
      document.file = `projects/${channel}/${tag}.yml`
      return next(document)
    } catch (error) {
      return res.api(null, error)
    }

  }
}

export default new Proto()

/**
 * 格式化提交参数
 * @param body any
 * @param request ProtoSend.Request
 * @param alias Maps<ProtoSend.Alias[]>
 */
function formatPayload (body: any, request: ProtoSend.Request, alias?: Maps<ProtoSend.Alias[]>): Maps<any> {
  let payload: Maps<any> = {}
  for (let key in request) {
    if (body[key]) {
      let value: any = body[key]
      if (request[key] === 'date') {
        value = new Date(value).getTime()
        if (key === 'end') {
          value += 24 * 3600 * 1000 - 1000
        }
      }
      else if (request[key] === 'array') {
        if (isString(value)) {
          value = (value as string).split(',')
        }
      }
      else if (request[key] === 'string') {
        value = Array.from(new Set(formatArray(value, 'string'))).join(',')
        if (alias && alias[key]) {
          let _alias: ProtoSend.Alias | undefined = alias[key].find( o => o.key === value )
          if (_alias) {
            value = _alias.value
          }
        }
        // value = value.replace(/^(0)$/, '')
      }
      else if (request[key] === 'number') {
        value = Number(value)
      }
      payload[key] = value
    }
  }
  return payload
}
