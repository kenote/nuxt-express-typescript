import { MountController } from 'kenote-express-helper'
import Passport from './passport'
import Security from './security'
import Group from './group'
import User from './user'
import Ticket from './ticket'
import Store from '~/controller/store'

export default MountController( Passport, Security, Group, User, Ticket, Store )
