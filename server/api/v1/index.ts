import { MountController } from 'kenote-express-helper'
import Passport from './passport'
import Security from './security'
import Group from './group'
import Team from './team'
import User from './user'
import Ticket from './ticket'
import Ditch from './ditch'
import Proto from './proto'
import Store from '~/controller/store'

export default MountController( Passport, Security, Group, Team, User, Ticket, Ditch, Proto, Store )
