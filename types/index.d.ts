


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
    group       ?: string
    teams        : string[]
    stint        : number
    last_at      : Date
  }

  // interface FindUser {
  //   create_at    : Date[]
  //   groups       : string[]
  //   findtype     : FindType
  //   findname    ?: string
  //   page        ?: number
  // }

  interface EditUser {
    username    ?: string
    group       ?: string
    teams        : string[]
    email       ?: string
    mobile      ?: string
    binds        : string[]
    sex          : string
  }

  interface CreateTeam {
    name        ?: string
    description ?: string
    platform     : Array<number>
  }
}