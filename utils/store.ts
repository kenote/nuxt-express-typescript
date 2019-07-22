
import { Store, Connect, localProxy, StroeOptions } from 'kenote-store-helper'
import { Maps } from 'kenote-config-helper'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { loadError } from './error'

const { __ErrorCode } = loadError()

export const stores: Maps<StroeOptions> = <Maps<StroeOptions>> loadData('data/stores')

@Connect({
  proxys: {
    local          : new localProxy()
  },
  errors: {
    mimetype       : __ErrorCode.ERROR_UPLOAD_FILE_MIMETYPE,
    limit          : __ErrorCode.ERROR_UPLOAD_FILESIZE_LARGEMAX
  }
})
export class IStore extends Store {}