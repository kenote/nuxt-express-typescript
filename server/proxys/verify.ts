import * as mongoose from 'mongoose' 
import { MongooseDao, autoNumber, QueryOptions, UpdateWriteResult } from 'kenote-mongoose-helper'
import __Models from '../models'
import { createDocument, responseDocument, UpdateResult } from '@/types/proxys/verify'
import * as uuid from 'uuid'

const Model: mongoose.Model<mongoose.Document, {}> = __Models.verifyModel
const options: QueryOptions = {
  name: 'verify',
  populate: {
    path: 'user',
    select: ['id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'group', 'teams', 'binds']
  },
  seqModel: __Models.seqModel
}

@autoNumber({
  idName: 'id'
})
class VerifyDao extends MongooseDao {}

class VerifyProxy {

  public Dao: MongooseDao = new VerifyDao(Model, options)

  public async create (doc: createDocument): Promise<responseDocument> {
    let token: string = ''
    if (doc.type === 'email') {
      token = uuid.v4().replace(/\-/g, '')
    }
    if (doc.type === 'mobile' || doc.type === 'code') {
      token = Math.random().toFixed(6).replace(/^(0\.)/i, '')
    }
    let verify: responseDocument = await this.Dao.insert({ ...doc, token }) as responseDocument
    return verify
  }

  public async update (conditions: any, doc: any): Promise<UpdateResult> {
    let token: string = Math.random().toFixed(6).replace(/^(0\.)/i, '')
    let updateTime: Date = new Date()
    let result: UpdateWriteResult = await this.Dao.updateOne(conditions, { ...doc, token, updtae_at: updateTime })
    return { ...result, token }
  }

}

export default new VerifyProxy()
