import { Schema, model } from 'mongoose'

const schema: Schema = new Schema({
  id: {
    type: Number,
    default: 0,
    index: { unique: true }
  },
  protocode: {
    type: Number
  },
  protoname: {
    type: String
  },
  payload: {
    type: String
  },
  response: {
    type: String
  },
  rstp: {
    type: String
  },
  channel: {
    type: String
  },
  create_at: {
    type: Date,
    default: Date.now
  }, 
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  }
})

export default model('proto', schema)



/**
 * channel  频道
 * code 接口编号
 * name 接口名称
 * 请求rtsp, 实际rtsp
 * payload 请求数据
 * response 返回数据 
 */
