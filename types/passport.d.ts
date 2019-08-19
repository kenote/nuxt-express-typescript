import { Maps } from 'kenote-config-helper'
import { registerDocument } from './proxys/user'
import { responseDocument as responseTicketDocument } from './proxys/ticket'
import { Register } from './resuful'

declare namespace passport {

  interface Register {
    username      ?: string
    email         ?: string
    mobile        ?: string
    password      ?: string
    invitation    ?: string
  }

  interface CheckWarning {
    username       : number
    email          : number
    mobile         : number
  }

  interface createDocument {
    document       : registerDocument
    ticket         : responseTicketDocument | null
    setting        : Register.Config
  }

  interface verifyDocument {
    document       : Maps<any>
    warnings       : VerifyWarning
    setting        : Register.Config
  }

  type VerifyWarning = Maps<verifyItem>

  interface verifyItem {
    timeout        : number
    failed         : number
  }

  interface Password {
    hash           : string
    salt           : string
  }

  interface Login {
    username      ?: string
    password      ?: string
  }

  interface lostpassStart {
    type           : 'email' | 'mobile'
    email          : { name ?: string }
    mobile         : { name ?: string }
  }

  interface lostpassStartData {
    type           : 'email' | 'mobile'
    name           : string
  }

  interface lostpassSendData {
    code          ?: string
    password      ?: string
    repassed      ?: string
  }

  interface resetPwd {
    type           : 'email' | 'mobile'
    document       : resetPwdDocument
    setting        : Register.Config
  }

  interface resetPwdDocument {
    code          ?: string
    password      ?: string
    name          ?: string
  }
}

export = passport