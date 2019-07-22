import { loadData } from 'kenote-config-helper/dist/utils.server'
import { Mailer, Setting, MailerSetting } from 'kenote-mailer-helper'
import * as nunjucks from 'nunjucks'

const setting: MailerSetting = <MailerSetting> loadData('data/mailer')
setting.renderString = nunjucks.renderString

console.log(setting)

@Setting({ 
  ...setting, 
  // Rending Funtion, default use lodash/template
  renderString: nunjucks.renderString 
})
class NodeMailer extends Mailer {}

export default new NodeMailer()
