import { MountController } from 'kenote-express-helper'
import Passport from './passport'
import Security from './security'
import Store from '~/controller/store'

export default MountController( Passport, Security, Store )
