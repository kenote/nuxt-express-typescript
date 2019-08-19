import * as mongoose from 'mongoose' 
import { MongooseDao, autoNumber, QueryOptions } from 'kenote-mongoose-helper'
import __Models from '../models'

const Model: mongoose.Model<mongoose.Document, {}> = __Models.storeModel
const options: QueryOptions = {
  name: 'store',
  populate: { path: '' },
  seqModel: __Models.seqModel
}

@autoNumber({
  idName: 'id'
})
class StoreDao extends MongooseDao {}

class StoreProxy {

  public Dao: MongooseDao = new StoreDao(Model, options)
}

export default new StoreProxy()
