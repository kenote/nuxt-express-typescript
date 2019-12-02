import * as mongoose from 'mongoose'

export interface createDocument extends updateDocument {
  name           : string
}

export interface responseDocument extends mongoose.Document {
  id             : number
  name           : string
  description   ?: string
  platform       : number[]
  access         : string[]
  super          : boolean
}

export interface updateDocument {
  name          ?: string
  description   ?: string
  super         ?: boolean
  platform      ?: number[]
  access        ?: string[]
}

export interface editDocument {
  conditions   : any
  data         : createDocument | updateDocument
}

export interface removeDocument {
  conditions   : any
}