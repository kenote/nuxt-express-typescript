import { Request, Response, NextFunction } from 'express'
import { Controller, Router, Filter, Path } from 'kenote-express-helper'
import { IResponse } from '@/types/resuful'
import { authenticate, permission } from '~/middleware/auth'
import { loadError } from '@/utils/error'
import config from '~/config'
import ditchProxy from '~/proxys/ditch'
import ditchFilter from '~/filters/api_v1/ditch'
import { 
  responseDocument as responseDitchDocument, 
  findDocument as findDitchDocument, 
  createDocument as createDitchDocument 
} from '@/types/proxys/ditch'
import { ListData, seqModel } from 'kenote-mongoose-helper'
import * as jsyaml from 'js-yaml'
import { Maps } from 'kenote-config-helper'
import { map, omit } from 'lodash'
import { oc } from 'ts-optchain'

const { language, site_name } = config
const { ErrorInfo, CustomError, __ErrorCode } = loadError(language)

export default class Ditch extends Controller {

  /**
   * 获取渠道列表
   */
  @Router({ method: 'get', path: '/ditch/:channel' })
  @Filter( authenticate, ditchFilter.list )
  public async list (conditions: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let ditchs: responseDitchDocument[] = await ditchProxy.Dao.find(conditions) as responseDitchDocument[]
      return res.api(ditchs)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 获取渠道列表 [分页]
   */
  @Router({ method: 'post', path: '/ditch/:channel' })
  @Filter( authenticate, ditchFilter.pagelist )
  public async pagelist (findDitch: findDitchDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { conditions, options } = findDitch
    try {
      let ditchData: ListData = await ditchProxy.Dao.list(conditions, options) as ListData
      return res.api(ditchData)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 创建渠道
   * @param label 
   * @param name 
   */
  @Router({ method: 'post', path: '/ditch/:channel/create' })
  @Filter( authenticate, ditchFilter.create )
  public async create (document: createDitchDocument, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let ditch: responseDitchDocument = await ditchProxy.Dao.insert(document) as responseDitchDocument
      return res.api(ditch)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  /**
   * 更新渠道
   */
  @Router({ method: 'post', path: '/ditch/:channel/update' })
  @Filter( authenticate, ditchFilter.update )
  public async update (document: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel, content } = document
    let data: Array<Maps<any>> = jsyaml.load(content)
    data = data.map( o => ({ ...omit(o, ['key']), label: o.key, cardinal_number: oc(o).cardinal_number({}) }))
    try {
      for (let item of data) {
        let { label } = item
        let doc: any = JSON.parse(JSON.stringify(item))
        let ditch: responseDitchDocument = await ditchProxy.Dao.findOne({ label, channel }) as responseDitchDocument
        if (ditch) {
          await ditchProxy.Dao.updateOne({ _id: ditch._id }, { $set: doc })
        }
        else {
          await ditchProxy.Dao.insert({ ...doc, channel })
        }
      }
      // 删除多余
      await ditchProxy.Dao.remove({ channel, label: { $nin: map(data, 'label' ) }})
      return res.api(null)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  @Router({ method: 'post', path: '/ditch/:channel/allot' })
  @Filter( authenticate, ditchFilter.allot )
  public async allot (document: any, req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { channel, team, ditchs } = document as {
      channel    : string
      team       : string
      ditchs     : string[]
    }
    try {
      let data: responseDitchDocument[] = await ditchProxy.Dao.find({ teams: team, channel }) as responseDitchDocument[]
      let raw_ditchs: string[] = map(data, '_id')
      let create_ditchs: string[] = ditchs.filter( o => !raw_ditchs.includes(o) )
      let remove_ditchs: string[] = raw_ditchs.filter( o => !ditchs.includes(o) )
      if (create_ditchs.length > 0) {
        await ditchProxy.Dao.update({ _id: { $in: create_ditchs }, channel }, { $addToSet: { teams: team }}, { multi: true })
      }
      if (remove_ditchs.length > 0) {
        await ditchProxy.Dao.update({ _id: { $in: remove_ditchs }, channel }, { $pull: { teams: team }}, { multi: true })
      }
      return res.api({ create_ditchs, remove_ditchs })
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }
}
