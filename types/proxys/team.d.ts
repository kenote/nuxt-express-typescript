import * as mongoose from 'mongoose'

export interface responseDocument extends mongoose.Document {
  id             : number
  name           : string
  description   ?: string
  platform       : number[]
  access         : string[]
  super          : boolean
}