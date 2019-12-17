import * as mongoose from 'mongoose' 
import { MongooseDao, autoNumber, QueryOptions, UpdateWriteResult, DeleteWriteResult } from 'kenote-mongoose-helper'
import __Models from '../models'
import storeProxy from './store'
import userProxy from './user'
import { createDocument, responseDocument, updateDocument, removeOptions } from '@/types/proxys/group'
import { responseDocument as responseStoreDocument } from '@/types/proxys/store'
import { pick } from 'lodash'
import { oc } from 'ts-optchain'

const Model: mongoose.Model<mongoose.Document, {}> = __Models.groupModel
const options: QueryOptions = {
  name: 'group',
  populate: { 
    path: 'store',
    select: [ 'upload_type', 'download_type' ] 
  },
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

  public async update (conditions: any, doc: updateDocument): Promise<UpdateWriteResult> {
    let query: UpdateWriteResult = await this.Dao.updateOne(conditions, pick(doc, ['name', 'level', 'description', 'default', 'platform', 'access']))
    if (doc.store) {
      let group: responseDocument = await this.Dao.findOne(conditions) as responseDocument
      query = await storeProxy.Dao.updateOne({ _id: group.store._id }, doc.store)
    }
    return query
  }

  public async remove (conditions: any, options?: removeOptions): Promise<DeleteWriteResult> {
    let group: responseDocument = await this.Dao.findOne(conditions) as responseDocument
    if (group) {
      // 移除组用户
      if (oc(options).move()) {
        await userProxy.Dao.update({ group: group._id }, { group: options!.move })
      }
      else {
        await userProxy.remove({ group: group._id })
      }
    }
    if (oc(group).store()) {
      await storeProxy.Dao.remove({ _id: group.store._id })
    }
    let query: DeleteWriteResult = await this.Dao.remove(conditions)
    return query
  }
}

export default new GroupProxy()
