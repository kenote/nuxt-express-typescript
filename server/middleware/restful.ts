import { Response } from 'express'
import { isNumber, isError } from 'util'
import * as path from 'path'
import * as fs from 'fs-extra'
import { oc } from 'ts-optchain'
import { Middleware, MiddlewareSetting, RegisterMiddlewareMethod } from 'kenote-express-helper'
import { IError, IErrorInfo } from 'kenote-config-helper'
import config from '~/config'
import { loadError } from '@/utils/error'
import { resufulInfo, IResponse, DownloadOptions } from '@/types/resuful'

const { options, language } = config
const headers: string[][] | undefined = oc(options).headers()
const { __ErrorCode, ErrorInfo } = loadError(language)

const preview = {
  ['.png']: 'image/png'
}

@MiddlewareSetting({
  header: headers || []
})
class Restful extends Middleware {

  @RegisterMiddlewareMethod()
  public api (res: Response): any {
    return (data: any, error?: number | IError | IErrorInfo, opts?: string[]): Response => {
      error = error || __ErrorCode.ERROR_STATUS_NULL
      let errorCode: number = isNumber(error) ? error : <number> error.code
      let Status: IErrorInfo = isNumber(error) ? <IErrorInfo> ErrorInfo(errorCode, opts, true) : <IErrorInfo> error
      if (isError(error)) {
        Status = { code: <number> error.code, message: error.message }
      }
      let info: resufulInfo = { data, Status }
      return res.json(info)
    }
  }

  @RegisterMiddlewareMethod()
  public notfound (res: Response): any {
    return () => res.status(404).render('error', { message: 'This page could not be found' })
  }

  @RegisterMiddlewareMethod()
  public downloadFile (res: IResponse): any {
    return (file: string, options?: DownloadOptions) => {
      if (!fs.existsSync(file)) {
        return res.notfound()
      }
      let fileStream: Buffer = fs.readFileSync(file)
      let extname: string = path.extname(file)
      let contentType: string = oc(options).download() ? undefined : preview[extname]
      res.setHeader('Content-Type', contentType || 'application/octet-stream')
      return res.send(fileStream)
    }
  }

}

export default new Restful().hendler()
