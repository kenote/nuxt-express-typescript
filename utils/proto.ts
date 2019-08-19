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

  public async send (proto: ProtoSend.Proto, payload: Maps<any>, key?: string): Promise<PB.Message | undefined> {
    let rstp: ProtoServer = this.getRstp(key || this.__key)
    let { host, port } = rstp
    let client: Socket = new Socket(host, port)
    let protobuffer: Protobuffer = new Protobuffer(this.__proto)
    let { createPBBuffer, makeData, decode, gameMessage } = protobuffer
    let data: Buffer = makeData(createPBBuffer(proto.code, proto.request, payload || {}))
    let buffer: Buffer = await client.send(data)
    let messageQuery: ReflectionObject = <ReflectionObject> gameMessage(proto.response)
    let message: PB.Message = <PB.Message> decode(buffer, messageQuery)
    return message
  }

  private getRstp (key: string): ProtoServer {
    let _key: string = Object.keys(this.__rstps).indexOf(key) > -1 ? key : this.__key
    let rstp: ProtoServer
    try {
      rstp = this.__rstps[_key]
    } catch (error) {
      rstp = { host: '127.0.0.1', port: 8080 }
    }
    return rstp
  }

}
