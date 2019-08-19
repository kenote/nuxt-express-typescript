import * as mongoose from 'mongoose' 
import { MongooseDao, autoNumber, QueryOptions, UpdateWriteResult } from 'kenote-mongoose-helper'
import __Models from '../models'
import { createDocument, responseDocument, updateDocument } from '@/types/proxys/ticket'
import * as uuid from 'uuid'

const Model: mongoose.Model<mongoose.Document, {}> = __Models.ticketModel
const options: QueryOptions = {
  name: 'ticket',
  populate: { path: '' },
  seqModel: __Models.seqModel
}

@autoNumber({
  idName: 'id'
})
class TicketDao extends MongooseDao {}

class TicketProxy {

  public Dao: MongooseDao = new TicketDao(Model, options)

  public async create (doc: createDocument): Promise<responseDocument | mongoose.Document> {
    let cdkey: string = uuid.v4()
    let ticket: responseDocument | mongoose.Document = await this.Dao.insert({ ...doc, cdkey })
    return ticket
  }

  public async update (conditions: any, doc: updateDocument): Promise<UpdateWriteResult> {
    let ticket: responseDocument = <responseDocument> await this.Dao.findOne(conditions)
    let used: boolean = doc.stint <= ticket.uses
    let query: UpdateWriteResult = await this.Dao.updateOne(conditions, { ...doc, used })
    return query
  }
}

export default new TicketProxy()
