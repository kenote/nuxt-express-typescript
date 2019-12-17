import { KeyMap } from 'kenote-config-helper'
import { FindType } from './proxys/user'

export interface Option {
  key           : number | string
  label         : string
  disabled     ?: boolean
}

export declare namespace Dropdown {

  interface MenuItem {
    name           : string
    command       ?: string
  }
}

export declare namespace Sidebar {

  interface MenuItem {
    index          : string
    name           : string
    icon          ?: string
    children      ?: MenuItem[]
  }
}

export declare namespace Command {

  type Type = 'command' | 'router'

  interface Value {
    type: Type
    path: string
  }
}

export declare namespace Ucenter {

  interface CreateGroup {
    name          ?: string
    level          : number
    description   ?: string
    upload_type   ?: string[]
    download_type ?: string[]
  }

  interface CreateTicket {
    group         ?: string
    stint          : number
    last_at        : Date
  }

  interface FindUser {
    create_at      : Date[]
    groups         : string[]
    findtype       : FindType
    findname      ?: string
    page          ?: number
  }

  interface EditUser {
    username      ?: string
    nickname      ?: string
    group         ?: string
    teams         ?: string[]
    email         ?: string
    mobile        ?: string
    binds          : string[]
    sex            : number
  }

  interface CreateTeam {
    name          ?: string
    description   ?: string
  }
}

export interface listDocument<T> {
  data           : T[]
  counts         : number
  limit          : number
}

export interface CDTime {
  key          : string
  value        : number
}

export interface CDTimeStore {
  date         : Date
  value        : number
}

export interface GroupData extends KeyMap<string> {
  children     : KeyMap<string>[]
}