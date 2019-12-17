import * as mongoose from 'mongoose' 
import { MongooseDao, autoNumber, QueryOptions, UpdateWriteResult, DeleteWriteResult } from 'kenote-mongoose-helper'
import __Models from '../models'
import { responseDocument } from '@/types/proxys/team'
import { pick } from 'lodash'
import { oc } from 'ts-optchain'
import userProxy from './user'

const Model: mongoose.Model<mongoose.Document, {}> = __Models.teamModel
const options: QueryOptions = {
  name: 'team',
  populate: { path: '' },
  seqModel: __Models.seqModel
}

@autoNumber({
  idName: 'id'
})
class TeamDao extends MongooseDao {}

class TeamProxy {

  public Dao: MongooseDao = new TeamDao(Model, options)

  public async remove (conditions: any): Promise<DeleteWriteResult> {
    let { _id } = conditions
    // 先移除团队用户
    await userProxy.Dao.update({ teams: _id }, { $pull: { teams: _id }}, { multi: true })
    let query: DeleteWriteResult = await this.Dao.remove(conditions)
    return query
  }

}

export default new TeamProxy()
