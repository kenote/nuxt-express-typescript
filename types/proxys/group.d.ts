import * as mongoose from 'mongoose'
import { createDocument as createStoreDocument, responseDocument as responseStoreDocument } from './store'

export interface createDocument extends updateDocument {
  name         : string
  level        : number
}

export interface updateDocument {
  name        ?: string
  level       ?: number
  description ?: string
  store       ?: createStoreDocument
  default     ?: boolean
}

export interface responseDocument extends mongoose.Document {
  id           : number
  name         : string
  level        : number
  description  : string
  store        : responseStoreDocument
  default      : boolean
}

export interface editDocument {
  conditions   : any
  data         : createDocument
}

export interface removeDocument {
  conditions   : any
  options      : removeOptions
}

export interface removeOptions {
  move        ?: string
}