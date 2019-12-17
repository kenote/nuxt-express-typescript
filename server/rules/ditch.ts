import { Rule } from 'kenote-validate-helper'
import { Maps } from 'kenote-config-helper'
import { loadError } from '@/utils/error'
import config from '~/config'
import { isEmail, isMobilePhone } from 'validator'
import { format } from 'util'

const { language } = config
const { __ErrorCode, __ErrorMessage } = loadError(language)

export const rules: Maps<Rule[]> = {
  label: [
    {
      required     : true,
      message      : format(__ErrorMessage.ERROR_VALID_DATE_REQUIRED, '渠道标签'),
      code         : __ErrorCode.ERROR_VALID_DATE_REQUIRED
    }
  ],
  name: [
    {
      required     : true,
      message      : format(__ErrorMessage.ERROR_VALID_DATE_REQUIRED, '渠道名称'),
      code         : __ErrorCode.ERROR_VALID_DATE_REQUIRED
    }
  ],
  group: [
    {
      required     : true,
      message      : format(__ErrorMessage.ERROR_VALID_DATE_REQUIRED, '组'),
      code         : __ErrorCode.ERROR_VALID_DATE_REQUIRED
    }
  ]
}
