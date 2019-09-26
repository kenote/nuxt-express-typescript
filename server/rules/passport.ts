import { Rule } from 'kenote-validate-helper'
import { Maps } from 'kenote-config-helper'
import { loadError } from '@/utils/error'
import config from '~/config'
import { isEmail, isMobilePhone } from 'validator'

const { language } = config
const { __ErrorCode, __ErrorMessage } = loadError(language)

export const rules: Maps<Rule[]> = {
  username: [
    {
      required     : true,
      message      : __ErrorMessage.ERROR_VALID_USERNAME_REQUIRED,
      code         : __ErrorCode.ERROR_VALID_USERNAME_REQUIRED
    }
  ],
  email: [
    {
      required     : true,
      message      : __ErrorMessage.ERROR_VALID_EMAIL_REQUIRED,
      code         : __ErrorCode.ERROR_VALID_EMAIL_REQUIRED
    }
  ],
  mobile: [
    {
      required     : true,
      message      : __ErrorMessage.ERROR_VALID_MOBILE_REQUIRED,
      code         : __ErrorCode.ERROR_VALID_MOBILE_REQUIRED
    }
  ],
  password: [
    {
      required     : true,
      message      : __ErrorMessage.ERROR_VALID_PASSWORD_REQUIRED,
      code         : __ErrorCode.ERROR_VALID_PASSWORD_REQUIRED
    }
  ],
  verify_id: [
    {
      required : true,
      message  : __ErrorMessage.ERROR_VERIFY_ID_REQUIRED,
      code     : __ErrorCode.ERROR_VERIFY_ID_REQUIRED
    }
  ],
  code: [
    {
      required     : true,
      message      : __ErrorMessage.ERROR_VERIFY_CODE_REQUIRED,
      code         : __ErrorCode.ERROR_VERIFY_CODE_REQUIRED
    }
  ]
}

export const formatRules: Maps<Rule[]> = {
  username: [
    {
      pattern      : /^[a-zA-Z]{1}[a-zA-Z0-9\_\-]{4,19}$/,
      message      : __ErrorMessage.ERROR_VALID_USERNAME_FORMAT,
      code         : __ErrorCode.ERROR_VALID_USERNAME_FORMAT
    }
  ],
  password: [
    {
      pattern      : /^(?=.*[A-Za-z])[A-Za-z0-9$@$!%*#?&]{8,20}$/,
      message      : __ErrorMessage.ERROR_VALID_PASSWORD_FORMAT,
      code         : __ErrorCode.ERROR_VALID_PASSWORD_FORMAT
    }
  ],
  email: [
    {
      validator    : isEmail,
      message      : __ErrorMessage.ERROR_VALID_EMAIL_FORMAT,
      code         : __ErrorCode.ERROR_VALID_EMAIL_FORMAT
    }
  ],
  mobile: [
    {
      validator    : (value: string) => isMobilePhone(value, 'zh-CN'),
      message      : __ErrorMessage.ERROR_VALID_MOBILE_FORMAT,
      code         : __ErrorCode.ERROR_VALID_MOBILE_FORMAT
    }
  ]
}
