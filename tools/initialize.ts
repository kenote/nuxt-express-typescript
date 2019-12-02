
import { MongooseDao } from 'kenote-mongoose-helper'
import { Maps } from 'kenote-config-helper'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import __Models from '../server/models'
import groupProxy from '../server/proxys/group'
import storeProxy from '../server/proxys/store'
import ticketProxy from '../server/proxys/ticket'
import userProxy from '../server/proxys/user'
import { Initialize } from './initialize.d'
import { responseDocument as responseGroupDocument } from '../types/proxys/group'
import { responseDocument as responseTicketDocument } from '../types/proxys/ticket'
import * as Table from 'tty-table'
import * as fs from 'fs'
import * as path from 'path'
import logger from '../utils/logger'
import * as nunjucks from 'nunjucks'
import mailer from '../utils/mailer'
import * as Mail from 'nodemailer/lib/mailer'
import { oc } from 'ts-optchain'

const setting: Initialize.Setting = <Initialize.Setting> loadData('data/initialize')
const filePath: string = path.resolve(process.cwd(), 'data', 'initialize.yml')

async function start (): Promise<void> {
  let { groups: groupSettings, tickets: ticketSettings, template: tpl, sendmail } = setting
  try {
    await new MongooseDao(__Models.seqModel).clear()
    await storeProxy.Dao.clear()
    await ticketProxy.Dao.clear()
    await groupProxy.Dao.clear()
    await userProxy.Dao.clear()
    await createGroups(groupSettings)
    let tickets: responseTicketDocument[] = await createTickets(groupSettings, ticketSettings)
    renderTable(tickets.map( ticket => ([ ticket.name, ticket.cdkey, ticket.stint, ticket.last_at ])))
    writeFile(tickets, tpl)
    sendmail && sendMail(tickets, sendmail)
  } catch (error) {
    console.log(error)
  }
  setTimeout(() => process.exit(0), 300)
}

/**
 * 创建用户组
 * @param groupSettings Maps<Initialize.Group>
 */
async function createGroups (groupSettings: Maps<Initialize.Group>): Promise<void> {
  for (let key of Object.keys(groupSettings)) {
    let result: responseGroupDocument = <responseGroupDocument> await groupProxy.create(groupSettings[key])
    groupSettings[key]._id = result._id
  }
}

/**
 * 创建激活码
 * @param groupSettings Maps<Initialize.Group>
 * @param ticketSettings Initialize.Ticket[]
 */
async function createTickets (groupSettings: Maps<Initialize.Group>, ticketSettings: Initialize.Ticket[]): Promise<responseTicketDocument[]> {
  let tickets: responseTicketDocument[] = []
  for (let ticketSetting of ticketSettings) {
    let { group, stint } = ticketSetting
    let { _id, name } = groupSettings[group]
    let last_at: Date = new Date(Date.now() + 86400000)
    if (_id) {
      let result: responseTicketDocument = <responseTicketDocument> await ticketProxy.create({
        name: `注册 -> ${name}`,
        type: 'register',
        setting: {
          group: _id
        },
        stint,
        last_at
      })
      tickets.push(result)
    }
  }
  return tickets
}

/**
 * 输出表格
 * @param tickets any[][]
 */
function renderTable (tickets: any[][]): void {
  let bodyHeader: Array<Maps<any>> = [
    {
      value: '用户组',
      width: 20
    },
    {
      value: '邀请码',
      width: 40
    },
    {
      value: '次数',
      width: 15
    },
    {
      value: '过期时间',
      width: 50
    },
  ]
  let style: Maps<any> = {
    borderStyle        : 2,
    paddingBottom      : 0,
    headerAlign        : 'center',
    align              : 'center',
    color              : 'white',
    truncate           : '...'
  }
  let t3 = Table(bodyHeader, tickets, style)
  logger.info('\n', t3.render(), '\n')
}

/**
 * 写入文件
 * @param tickets responseTicketDocument[]
 * @param tpl string
 */
function writeFile (tickets: responseTicketDocument[], tpl: string): void {
  let initializeStr: string = tickets.map( ticket => nunjucks.renderString(tpl, JSON.parse(JSON.stringify(ticket))) ).join('\n\n')
  fs.writeFileSync(filePath, initializeStr, 'utf-8')
}

/**
 * 发送邮件
 * @param tickets responseTicketDocument[]
 * @param opts Initialize.SendMail
 */
function sendMail (tickets: responseTicketDocument[], opts: Initialize.SendMail): void {
  let sender: string = oc(mailer.__SmtpOptions).auth.user('penelope.leuschke41@ethereal.email')
  let { address, subject, template, server } = opts
  let mail: Mail.Options = {
    from: sender,
    to: address,
    subject
  }
  mailer.sendMail(template, mail, { tickets, server })
}

start()

