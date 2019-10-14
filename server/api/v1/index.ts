import { MountController } from 'kenote-express-helper'
import Passport from './passport'
import Security from './security'
import Group from './group'
import Store from '~/controller/store'

export default MountController( Passport, Security, Group, Store )
