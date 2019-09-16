/**
 * 还原部署文件
 */
import * as path from 'path'
import * as inquirer from 'inquirer'
import * as fs from 'fs-extra'
import { TaskSpinner } from 'kenote-task-helper'
import { ITask } from '../task'
import * as runscript from 'runscript'
import { loadData, pickFiles } from 'kenote-config-helper/dist/utils.server'
import { ServerConfiguration } from 'kenote-config-helper'
import * as UrlParse from 'url-parse'

const deployRoot: string = path.resolve(process.cwd(), '.deploy')

/**
 * 定制返回上级节点
 */
const footChoices: Array<Record<'name' | 'value', string>> = [
  {
    name: '返回上级',
    value: '--> goback'
  },
  {
    name: '退出',
    value: '--> exit'
  }
]

export default async function restoreDeploy (): Promise<any> {
  try {
    let options: Record<'name', string> = await inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: '选择一个部署配置',
        choices: dirChoices(deployRoot).concat(footChoices)
      }
    ])
    let nameMatch = options.name.match(/^(\-{2}\>{1}\s{1})(\S+)$/)
    if (nameMatch && nameMatch[2] === 'goback') {
      return await ITask.start()
    }
    if (nameMatch && nameMatch[2] === 'exit') {
      return await TaskSpinner(Promise.resolve(`Exit Finished.`))
    }
    let confirm: Record<'runing', boolean> = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'runing',
        message: '您确定要还原配置到当前项目吗？',
        default: false
      }
    ])
    if (!confirm.runing) {
      return await restoreDeploy()
    }
    let rootDir: string = path.resolve(deployRoot, options.name)
    // 1、还原 /data/ 目录
    let dataDir: string = path.resolve(process.cwd(), 'data')
    let dataFiles: string[] = await pickFiles(['.**/**', '**'], { cwd: dataDir, nodir: true, realpath: true, ignore: ['**/*.default.yml', '**/README.md'] })
    for (let file of dataFiles) {
      fs.removeSync(file)
    }
    fs.copySync(path.resolve(rootDir, 'data'), dataDir)
    // 2、还原 静态文件目录 /client/static/
    let staticDir: string = path.resolve(process.cwd(), 'client/static')
    fs.removeSync(staticDir)
    fs.copySync(path.resolve(rootDir, 'client/static'), staticDir)
    // 3、还原数据库
    let config: ServerConfiguration = loadData('data/config') as ServerConfiguration
    let { uris } = config.mongodb || { uris: '' }
    if (uris) {
      let url: string = Array.isArray(uris) ? uris[0] : uris.split(/\;/)[0]
      let { pathname, port } = UrlParse(url)
      let dbname: string = pathname.replace(/^(\/)/i, '')
      await runscript(`mongorestore -h 127.0.0.1 --port ${port} -d ${dbname} --drop ${rootDir}/mongodb/${dbname}`)
    }
    return await TaskSpinner(Promise.resolve(`Restore Finished.`))
  } catch (error) {
    console.log(``)
    console.error(error)
  }
}

function dirChoices (dir: string, opts?: Record<'name' | 'value', string>): Array<Record<'name' | 'value', string>> {
  let choices: Array<Record<'name' | 'value', string>> = []
  let dirs: string[] = fs.readdirSync(dir)
  for (let item of dirs) {
    let stat: fs.Stats = fs.statSync(path.resolve(dir, item))
    if (stat.isDirectory() && !/^(\.)/.test(item)) {
      choices.push({ name: item, value: item })
    }
  }
  opts && choices.push(opts)
  return choices
}
