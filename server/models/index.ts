import { Connector, Connect, MountModels, ConnectorSetting } from 'kenote-mongoose-helper'
import config from '../config'
import groupModel from './group'
import storeModel from './store'
import teamModel from './team'
import ticketModel from './ticket'
import userModel from './user'
import verifyModel from './verify'

@Connect(config.mongodb as ConnectorSetting)
@MountModels({ groupModel, storeModel, teamModel, ticketModel, userModel, verifyModel })
class MongoDB extends Connector {}

const DB: Connector = new MongoDB()
DB.connect()

export default DB.__Models || {}
