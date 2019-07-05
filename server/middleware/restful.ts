import { Response } from 'express'
import { isNumber, isError } from 'util'
import { Middleware, MiddlewareSetting, RegisterMiddlewareMethod } from 'kenote-express-helper'
import { IError, IErrorInfo } from 'kenote-config-helper'
import { loadError } from '../../utils/error'
import { resufulInfo } from '../../types/resuful'
import config from '../config'
 
const { options, language } = config
const headers: string[][] | undefined = options && options.headers
const { __ErrorCode, ErrorInfo } = loadError(language)

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
  public notfound (response: Response): any {
    return () => response.status(404).render('error', { message: 'This page could not be found' })
  }

}

export default new Restful().hendler()