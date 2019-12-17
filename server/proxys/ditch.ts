import * as mongoose from 'mongoose' 
import { MongooseDao, autoNumber, QueryOptions } from 'kenote-mongoose-helper'
import __Models from '../models'

const Model: mongoose.Model<mongoose.Document, {}> = __Models.ditchModel
const options: QueryOptions = {
  name: 'ditch',
  populate: [
    {
      path: 'teams',
      select: ['id', 'name', 'description']
    }
  ],
  seqModel: __Models.seqModel
}

@autoNumber({
  idName: 'id'
})
class DitchDao extends MongooseDao {}

class DitchProxy {

  public Dao: MongooseDao = new DitchDao(Model, options)

}

export default new DitchProxy()
