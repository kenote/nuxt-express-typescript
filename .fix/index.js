const path = require('path')
const { readFileSync, writeFileSync, existsSync } = require('fs')
const { loadData } = require('kenote-config-helper/dist/utils.server')

const settings = loadData('.fix/setting.yml')

runReplace(settings.replace)

function runReplace (options = []) {
  if (options) {
    for (let item of options) {
      let filePath = path.resolve(process.cwd(), item.file)
      if (existsSync(filePath)) {
        let oldFileStr = readFileSync(filePath, 'utf-8')
        if (oldFileStr.search(new RegExp(item.find))) continue
        console.log('fix:', item.name)
        let newFileStr = oldFileStr.replace(item.find, item.content)
        writeFileSync(filePath, newFileStr, 'utf-8')
      }
    }
  }
}