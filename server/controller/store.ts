import { Request, Response, NextFunction } from 'express'
import { Controller, Router, Filter } from 'kenote-express-helper'
import { StroeOptions } from 'kenote-store-helper'
import * as path from 'path'
import { IResponse } from '@/types/resuful'
import storeFilter from '~/filters/controller/store'
import { IStore } from '@/utils/store'
import { loadError } from '@/utils/error'
import { ProxyResult } from 'kenote-store-helper'
import config from '~/config'

const { language } = config
const { ErrorInfo, CustomError, __ErrorCode } = loadError(language)
const IStoreErrorInfo = (code: number, opts?: any) => ErrorInfo(code, opts, true)

export default class Store extends Controller {

  @Router(
    { method: 'post', path: '/upload' },
    { method: 'post', path: '/upload/:type' }
  )
  @Filter( storeFilter.upload )
  public async upload (options: StroeOptions, request: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    try {
      let result: ProxyResult[] = await new IStore({ request, options }).asyncSave(IStoreErrorInfo)
      if (result.length === 0) {
        return res.api(null, __ErrorCode.ERROR_UPLOAD_NOT_FILE)
      }
      return res.api(result)
    } catch (error) {
      if (CustomError(error)) {
        return res.api(null, error)
      }
      return next(error)
    }
  }

  @Router(
    { method: 'get', path: '/uploadfiles/:filename' },
    { method: 'get', path: '/uploadfiles/:type/:filename' }
  )
  @Filter( storeFilter.download )
  public async download (options: StroeOptions, request: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { filename } = request.params
    let { root_dir } = options
    let { sub_dir, download } = request.query
    let filePath: string = path.resolve(process.cwd(), root_dir || '', sub_dir || '', filename)
    return res.downloadFile(filePath, { download })
  }
}
