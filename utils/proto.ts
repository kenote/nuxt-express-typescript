import { Maps } from 'kenote-config-helper'
import { PB, PBSetting, Protobuffer, ReflectionObject, Socket } from 'kenote-socket-helper'
import { ProtoOptions, ProtoServer, ProtoSend } from '@/types/proto'

export default class Proto {

  private __rstps: Maps<ProtoServer>
  private __proto: PBSetting
  private __key: string = 'Slave'

  constructor (options: ProtoOptions) {
    this.__rstps = options.rstps
    this.__proto = options.proto
  }

  public async send (proto: ProtoSend.Proto, payload: Maps<any>, key?: string): Promise<PB.Message> {
    let rstp: ProtoServer = this.getRstp(proto.rstp || key || this.__key)
    let { host, port } = rstp
    let client: Socket = new Socket(host, port)
    let protobuffer: Protobuffer = new Protobuffer(this.__proto)
    let { createPBBuffer, makeData, decode, gameMessage } = protobuffer
    let data: Buffer = makeData(createPBBuffer(proto.code, proto.req, payload || {}))
    console.log(proto.code, proto.req)
    let buffer: Buffer = await client.send(data)
    let messageQuery: ReflectionObject = <ReflectionObject> gameMessage(proto.res)
    let message: PB.Message = <PB.Message> decode(buffer, messageQuery)
    return message
  }

  private getRstp (key: string): ProtoServer {
    let _key: string = Object.keys(this.__rstps).indexOf(key) > -1 ? key : this.__key
    let rstp: ProtoServer
    console.log(_key)
    try {
      rstp = this.__rstps[_key]
    } catch (error) {
      rstp = { host: '127.0.0.1', port: 8080 }
    }
    return rstp
  }

}

/**
 * channel  频道
 * code 接口编号
 * name 接口名称
 * 请求rtsp, 实际rtsp
 * payload 请求数据
 * response 返回数据 
 */
