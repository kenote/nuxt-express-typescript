import { MountController } from 'kenote-express-helper'
import Passport from './passport'
import Store from '~/controller/store'

export default MountController( Passport, Store )
