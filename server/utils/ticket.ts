import { Filter, asyncFilterData } from 'kenote-validate-helper'
import { Maps, IErrorInfo } from 'kenote-config-helper'
import { Ticket, TicketOptions, responseDocument as responseTicketDocument } from '@/types/proxys/ticket'
import { loadError } from '@/utils/error'
import config from '~/config'
import ticketProxy from '~/proxys/ticket'
import { format } from 'util'

const { language } = config
const { __ErrorCode, __ErrorMessage, ErrorInfo } = loadError(language)

export async function validTicket (info: Ticket, options: TicketOptions): Promise<any> {
  let filters: Filter[] = [
    {
      key: options.key,
      rules: [
        {
          required: true,
          message: format(__ErrorMessage.ERROR_VALID_TICKET_REQUIRED, options.name),
          code: __ErrorCode.ERROR_VALID_TICKET_REQUIRED
        }
      ],
      value: info.cdkey
    }
  ]
  let error: IErrorInfo
  let data: Maps<any> = await asyncFilterData(filters) as Maps<any>
  let ticket: responseTicketDocument = await ticketProxy.Dao.findOne({ cdkey: data[options.key], type: options.type }) as responseTicketDocument
  if (ticket) {
    let { last_at, used } = ticket
    console.log(last_at)
    console.log(last_at.getTime())
    console.log(Date.now())
    console.log(new Date())
    if (last_at.getTime() <= Date.now()) {
      error = ErrorInfo(__ErrorCode.ERROR_VALID_TICKET_EXPIRED, [options.name], true) as IErrorInfo
      throw error
    }
    if (used) {
      error = ErrorInfo(__ErrorCode.ERROR_VALID_TICKET_USED, [options.name], true) as IErrorInfo
      throw error
    }
  }
  else {
    error = ErrorInfo(__ErrorCode.ERROR_VALID_TICKET_NULL, [options.name], true) as IErrorInfo
    throw error
  }
  return ticket
}
