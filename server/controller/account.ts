import { Request, Response, NextFunction } from 'express'
import { Controller, Path, Router, Filter } from 'kenote-express-helper'
import { IResponse } from '../../types/resuful'

@Path('/account')
export default class Account extends Controller {

  @Router({ method: 'get', path: '/home' })
  public home (req: Request, res: IResponse, next: NextFunction): Response | void {
    return res.api({ test: 'ok' })
  }
}