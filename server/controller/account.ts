import { Request, Response, NextFunction } from 'express'
import { Controller, Path, Router, Filter } from 'kenote-express-helper'

@Path('/account')
export default class Account extends Controller {

  @Router({ method: 'get', path: '/home' })
  public home (req: Request, res: Response, next: NextFunction): Response | void {
    return res.json({ test: 'ok' })
  }
}