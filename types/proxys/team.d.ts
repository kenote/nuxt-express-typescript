import * as mongoose from 'mongoose'
import { ObjectId } from 'bson'
import { Maps } from 'kenote-config-helper'
import { responseDocument as responseUserDocument } from './user'

export interface createDocument extends updateDocument {
  name           : string
}

export interface responseDocument extends mongoose.Document {
  id             : number
  name           : string
  description   ?: string
  platform       : number[]
  access         : string[]
  rtsps          : Maps<string[]>
  super          : boolean
  owner         ?: responseUserDocument
}

export interface updateDocument {
  name          ?: string
  description   ?: string
  super         ?: boolean
  platform      ?: number[]
  access        ?: string[]
  rtsps         ?: Maps<string[]>
  owner         ?: ObjectId | string
}

export interface editDocument {
  conditions   : any
  data         : createDocument | updateDocument
}

export interface removeDocument {
  conditions   : any
}