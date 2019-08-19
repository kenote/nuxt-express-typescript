import { Maps } from 'kenote-config-helper'
import { createDocument } from '../types/proxys/group'

export declare namespace Initialize {

  interface Setting extends Maps<any> {
    groups        : Maps<Group>
    tickets       : Ticket[]
    template      : string
    sendmail     ?: SendMail
  }

  interface Group extends createDocument {
    _id          ?: string
  }

  interface Ticket {
    group         : string
    stint         : number
  }

  interface SendMail {
    subject       : string
    address       : string
    template      : string
    server        : string
  }

}