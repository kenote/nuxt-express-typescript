import { Mailer, MailerSetting, Setting } from 'kenote-mailer-helper'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import * as nunjucks from 'nunjucks'

const setting: MailerSetting = loadData('data/mailer') as MailerSetting

@Setting({
  ...setting,
  renderString: nunjucks.renderString
})
class NodeMailer extends Mailer {}

export default new NodeMailer()
