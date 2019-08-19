import { Request, Response, NextFunction } from 'express'
import { StroeOptions } from 'kenote-store-helper'
import { IResponse } from '@/types/resuful'
import { stores } from '@/utils/store'

class Store {

  public async upload (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    let store: StroeOptions | undefined = stores[type || 'default']
    if (!store) {
      return res.notfound()
    }
    return next(store)
  }

  public async download (req: Request, res: IResponse, next: NextFunction): Promise<Response | void> {
    let { type } = req.params
    if (req.baseUrl !== '') {
      return res.notfound()
    }
    let store: StroeOptions | undefined = stores[type || 'default']
    if (!store) {
      return res.notfound()
    }
    return next(store)
  }
}

export default new Store()
