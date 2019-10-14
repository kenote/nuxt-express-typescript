import * as mongoose from 'mongoose' 
import { MongooseDao, autoNumber, QueryOptions, UpdateWriteResult, DeleteWriteResult } from 'kenote-mongoose-helper'
import __Models from '../models'
import { registerDocument, responseDocument, createDocument, responseAllDocument } from '@/types/proxys/user'
import { loadError } from '@/utils/error'
import config from '../config'
import { bcrypt } from '../utils'
import * as passport from '@/types/passport'
import { omit, pick } from 'lodash'

const { language } = config
const { __ErrorCode, ErrorInfo } = loadError(language)

const Model: mongoose.Model<mongoose.Document, {}> = __Models.userModel
const options: QueryOptions = {
  name: 'user',
  populate: [
    {
      path: 'group',
      select: ['id', 'name', 'level', 'description', 'store'],
      populate: {
        path: 'store',
        select: ['upload_type', 'download_type']
      }
    },
    {
      path: 'teams',
      select: ['id', 'name', 'description', 'platform', 'access']
    }
  ],
  seqModel: __Models.seqModel
}

@autoNumber({
  idName: 'id'
})
class UserDao extends MongooseDao {}

class UserProxy {

  public Dao: MongooseDao = new UserDao(Model, options)

  public async register (doc: registerDocument): Promise<responseDocument | {}> {
    let isUsername: responseDocument = await this.Dao.findOne({ username: doc.username }) as responseDocument
    if (isUsername) {
      throw ErrorInfo(__ErrorCode.ERROR_VALID_USERNAME_UNIQUE)
    }
    let isEmail: responseDocument = await this.Dao.findOne({ email: doc.email }) as responseDocument
    if (isEmail) {
      throw ErrorInfo(__ErrorCode.ERROR_VALID_EMAIL_UNIQUE)
    }
    let password: passport.Password = bcrypt.hash(doc.password)
    let create: createDocument = {
      ...omit(doc, ['password']),
      encrypt: password.hash,
      salt: password.salt
    }
    let user: responseDocument = await this.Dao.insert(create) as responseDocument
    return user
  }

  public async login (doc: passport.Login): Promise<responseDocument | {}> {
    let conditions: any = {
      $or: [
        { username  : doc.username },
        { email     : doc.username },
        { mobile    : doc.username }
      ]
    }
    let user: responseAllDocument = await this.Dao.findOne(conditions) as responseAllDocument
    if (!user) {
      throw ErrorInfo(__ErrorCode.ERROR_LOGINVALID_FAIL)
    }
    let valide: boolean = bcrypt.compare(doc.password as string, user.encrypt, user.salt)
    if (!valide) {
      throw ErrorInfo(__ErrorCode.ERROR_LOGINVALID_FAIL)
    }
    return pick(user, ['_id', 'id', 'username', 'email', 'mobile', 'nickname', 'avatar', 'sex', 'binds', 'group', 'teams', 'create_at', 'update_at'])
  }

  public async resetPwd (doc: passport.resetPwdDocument, type: 'email' | 'mobile'): Promise<UpdateWriteResult> {
    let { hash: encrypt, salt } = bcrypt.hash(doc.password || '')
    let result: UpdateWriteResult = await this.Dao.updateOne({ [type]: doc.name }, { encrypt, salt })
    return result
  }

  public async setPassword (conditions: any, doc: passport.setPassword): Promise<UpdateWriteResult> {
    let { hash: encrypt, salt } = bcrypt.hash(doc.password || '')
    let result: UpdateWriteResult = await this.Dao.updateOne(conditions, { encrypt, salt })
    return result
  }

  public async remove (conditions: any): Promise<DeleteWriteResult> {
    // 移除相关数据
    let query: DeleteWriteResult = await this.Dao.remove(conditions)
    return query
  }

}

export default new UserProxy()
