import { Connector, Connect, MountModels, ConnectorSetting, seqModel } from 'kenote-mongoose-helper'
import config from '../config'
import groupModel from './group'
import storeModel from './store'
import teamModel from './team'
import ticketModel from './ticket'
import userModel from './user'
import verifyModel from './verify'
import ditchModel from './ditch'
import planModel from './plan'
import protoModel from './proto'

@Connect(config.mongodb as ConnectorSetting)
@MountModels({ groupModel, storeModel, seqModel, teamModel, ticketModel, userModel, verifyModel, ditchModel, planModel, protoModel })
class MongoDB extends Connector {}

const DB: Connector = new MongoDB()
DB.connect()

export default DB.__Models || {}
