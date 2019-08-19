import * as path from 'path'
import * as fs from 'fs'
import { Fix } from 'kenote-config-helper'
import { loadData } from 'kenote-config-helper/dist/utils.server'

const settings: Fix = loadData('setting.yml', false, { root: __dirname })

runReplace(settings.replace)

function runReplace (options?: Fix.ReplaceElement[]): void {
  if (!options) return
  for (let item of options) {
    let filePath: string = path.resolve(process.cwd(), item.file)
    if (fs.existsSync(filePath)) {
      console.log('fix:', item.name)
      let oldFileStr: string = fs.readFileSync(filePath, 'utf-8')
      let newFileStr: string = oldFileStr
      for (let ele of item.exec) {
        newFileStr = newFileStr.replace(ele.find, ele.content)
      }
      fs.writeFileSync(filePath, newFileStr, 'utf-8')
    }
  }
}
