import * as mongoose from 'mongoose'
import { ObjectId } from 'bson'
import { Maps } from 'kenote-config-helper'
import { QueryOptions } from 'kenote-mongoose-helper'
import { responseDocument as responseTeamDocument } from './team'

export interface createDocument extends updateDocument {
  channel            : string
}

export interface responseDocument extends mongoose.Document {
  id                 : number
  name               : string
  label              : string
  channel            : string
  group              : string
  teams              : responseTeamDocument[]
  cardinal_number    : Maps<number>
}

export interface updateDocument {
  name              ?: string
  label             ?: string
  group             ?: string
  teams             ?: Array<ObjectId | string>
  cardinal_number   ?: Maps<number>
}

export interface editDocument {
  conditions         : any
  data               : updateDocument
}

export interface findDocument {
  conditions         : any
  options            : QueryOptions
}