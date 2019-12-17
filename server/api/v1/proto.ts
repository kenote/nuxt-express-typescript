import { Request, Response, NextFunction } from 'express'
import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { IResponse } from '@/types/resuful'
import { authenticate, permission } from '~/middleware/auth'
import { loadError } from '@/utils/error'
import config from '~/config'
import protoFilter from '~/filters/api_v1/proto'
import ProtoUtil from '@/utils/proto'
import { ProtoOptions, ProtoSend } from '@/types/proto';
import { Maps } from 'kenote-config-helper'
import { PB } from 'kenote-socket-helper'
import { zipObject, map, orderBy, set, get, compact, isArray, omit } from 'lodash';
import * as utils from '@/utils'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { isJSON } from 'validator'
import logger from '@/utils/logger'
import { UpdateSettingDocument } from '@/types/proto'
import * as fs from 'fs-extra'
import * as path from 'path'
import { oc } from 'ts-optchain'

const { language, site_name } = config
const { ErrorInfo, CustomError, __ErrorCode } = loadError(language)

@Path('/proto')
export default class Proto extends Controller {

  /**
   * Proto 接口
   */
  @Router({ method: 'post', path: '/:channel/:tag' })
  @Filter( authenticate, protoFilter.send )
  public async send (document: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel } = req.params
    let { setting, payload, proto, parse, rtsp_key } = document as { 
      setting: ProtoOptions
      payload: Maps<any>
      proto: ProtoSend.Proto
      parse: ProtoSend.Parse[] 
      rtsp_key?: string
    }
    try {
      let result: PB.Message = await new ProtoUtil(setting).send(proto, payload, rtsp_key)
      if (!result.msgbody) {
        return res.api(null)
      }
      let parserData: Maps<any> = parseResultData(result.msgbody, parse, channel)
      logger.info(`Result Proto -->`, JSON.stringify({ ...result }, null, 2))
      return res.api(parserData)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      if (/(range|offset)/.test(error.message)) {
        return res.api({ data: {} })
      }
      return next(error)
    }
  }

  @Router({ method: 'get', path: '/:channel/setting/:tag' })
  public setting (req: Request, res: IResponse, next: NextFunction): Response | void {
    let { channel, tag } = req.params
    let { t } = req.query
    let result: Maps<any> | Array<Maps<any>> = loadData(`projects/${channel}/${tag}.yml`)
    if (!isArray(result)) {
      return res.api(result)
    }
    let groups: string[] = Array.from(new Set(compact(map(result, 'group'))))
    if (!!groups.join(',') && t === 'true') {
      let _result: Array<Maps<any>> = groups.map( o => ({ key: o, name: o, children: [] }) )
      for (let item of result) {
        let obj: Maps<any> = _result.find( o => o.key === item.group ) as Maps<any>
        obj.children.push(omit(item, ['group']))
      }
      return res.api(_result)
    }
    return res.api(result)
  }

  @Router({ method: 'post', path: '/:channel/setting/:tag' })
  @Filter( authenticate, protoFilter.updateSetting )
  public async updateSetting (document: UpdateSettingDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { file, content } = document
    let filePath: string = path.resolve(process.cwd(), file as string)
    try {
      await fs.writeFile(filePath, content, { encoding: 'utf-8' })
      return res.api(null)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}

/**
 * 解析返回数据
 * @param msgbody Maps<any>
 * @param parse ProtoSend.Parse[]
 */
function parseResultData (msgbody: Maps<any>, parse?: ProtoSend.Parse[], channel?: string): Maps<any> {
  if (!parse) return { ...msgbody }
  let result: Maps<any> = {}
  for (let item of parse) {
    let { key, collection, separator, int, setBy, afterTrans, addedValue, filter } = item
    let data: any = msgbody[key]
    if (Array.isArray(data)) {
      let _data: any[] = []
      if (filter) {
        data = data.map( o => o.split(separator).filter( (o, i) => filter!.includes(i) ).join(separator) )
      }
      if (item.format) {
        data = utils[item.format](data[0])
      }
      if (collection) {
        for (let values of data) {
          let value: Maps<any> = zipObject(map(collection, 'key'), values.split(separator).map(parseValue))
          if (addedValue) {
            let addValues: Maps<any> = getAddedValue(value, addedValue, channel)
            value = { ...value, ...addValues }
          }
          if (int && value[int.key]) {
            try {
              value.int = utils[int.function](value[int.key], ...int.options)
            } catch (error) {
              console.log(error)
            }
          }
          _data.push(value)
        }
        if (item.orderBy) {
          let { iteratees, orders } = item.orderBy
          _data = orderBy(_data, iteratees, orders)
        }
        if (afterTrans) {
          let [ funcname, param ] = afterTrans
          _data = utils[funcname as string](_data, param)
        }
      }
      if (setBy) {
        set(result, setBy, _data)
      }
      else {
        result[key] = _data
      }
    }
    else {
      if (setBy) {
        set(result, setBy, data)
      }
      else {
        result[key] = data
      }
    }
  }
  return result
}

function getAddedValue (data: Maps<any>, options: ProtoSend.AddedValue[], channel?: string): Maps<any> {
  let value: Maps<any> = {}
  for (let item of options) {
    let { key, defaultValue } = item
    let { type, param, formula } = oc(item).options({ type: '', param: [] })
    let _value: any = defaultValue
    if (type) {
      let setting: Array<Maps<any>> = loadData(`projects/${channel}/${type}.yml`) as Array<Maps<any>>
      let sett: Maps<any> = setting.find( o => o['key'] == data[param[0]]) || {}
      if (formula) {
        let _val: Record<'data' | 'sett', Maps<any>> = { data, sett }
        let _opts: any[] = oc(formula).opts([]).map( v => get(_val, v) || 0 )
        _value = oc(formula).func(() => defaultValue)(..._opts)
      }
      else {
        _value = oc(sett)[param[1]](defaultValue)
      }
    }
    value[key as string] = _value
  }
  return value
}

function parseValue (value: string) {
  // if (/(^\{)|(\}$)/.test(value)) {
  //   // tslint:disable-next-line: no-eval
  //   return eval('(' + value + ')')
  // }
  return value

}

function jsontoArray (data: string): string[] {
  let _data: any = {}
  try {
    _data = JSON.parse(data)
  } catch (error) {
    // tslint:disable-next-line: no-eval
    _data = eval(`(${data})`)
  }
  let data_arr: string[] = []
  for (let key in _data) {
    data_arr.push(`${key};${_data[key]}`)
  }
  return data_arr
}

