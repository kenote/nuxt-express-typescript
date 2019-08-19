import * as mongoose from 'mongoose' 
import { MongooseDao, autoNumber, QueryOptions } from 'kenote-mongoose-helper'
import __Models from '../models'
import storeProxy from './store'
import { createDocument, responseDocument } from '@/types/proxys/group'
import { responseDocument as responseStoreDocument } from '@/types/proxys/store'

const Model: mongoose.Model<mongoose.Document, {}> = __Models.groupModel
const options: QueryOptions = {
  name: 'group',
  populate: { path: '' },
  seqModel: __Models.seqModel
}

@autoNumber({
  idName: 'id'
})
class GroupDao extends MongooseDao {}

class GroupProxy {

  public Dao: MongooseDao = new GroupDao(Model, options)

  public async create (doc: createDocument): Promise<responseDocument | mongoose.Document> {
    let store: responseStoreDocument = <responseStoreDocument> await storeProxy.Dao.insert(doc.store)
    let group: responseDocument | mongoose.Document = await this.Dao.insert({ ...doc, store: store._id })
    return group
  }
}

export default new GroupProxy()
