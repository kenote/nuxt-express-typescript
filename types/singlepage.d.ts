import { Maps } from 'kenote-config-helper'


declare namespace singlepage {

  interface Item extends Maps<any> {
    key          : string
    activitys    : Activity[]
  }

  interface Activity {
    main_title          : string[]
    secondary_title     : string
  }
}

export = singlepage