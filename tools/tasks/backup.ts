/**
 * 备份部署文件
 */
import * as path from 'path'
import * as inquirer from 'inquirer'
import * as fs from 'fs-extra'
import { TaskSpinner } from 'kenote-task-helper'
import { trim } from 'lodash'
import { ITask } from '../task'
import * as runscript from 'runscript'
import { loadData } from 'kenote-config-helper/dist/utils.server'
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

export default async function backupDeploy (): Promise<any> {
  try {
    let options: Record<'name', string> = await inquirer.prompt([
      {
        type: 'list',
        name: 'name',
        message: '选择一个部署目录',
        choices: dirChoices(deployRoot, { name: '创建新目录', value: '--> create' }).concat(footChoices)
      }
    ])
    let nameMatch = options.name.match(/^(\-{2}\>{1}\s{1})(\S+)$/)
    if (nameMatch && nameMatch[2] === 'goback') {
      return await ITask.start()
    }
    if (nameMatch && nameMatch[2] === 'exit') {
      return await TaskSpinner(Promise.resolve(`Exit Finished.`))
    }
    if (nameMatch && nameMatch[2] === 'create') {
      let opts: Record<'name', string> = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: '请填写新目录名称',
          validate (val: string): string | true {
            if (!trim(val)) {
              return '请填写新目录名称'
            }
            return true
          }
        }
      ])
      options.name = opts.name
    }
    let confirm: Record<'runing', boolean> = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'runing',
        message: '您确定要导出配置到部署目录吗？',
        default: false
      }
    ])
    if (!confirm.runing) {
      return await backupDeploy()
    }
    // 创建主目录/清空文件
    let rootDir: string = path.resolve(deployRoot, options.name)
    !fs.existsSync(rootDir) && fs.mkdirSync(rootDir)
    // 1、备份 /data/ 目录
    let dataDir: string = path.resolve(rootDir, 'data')
    fs.existsSync(dataDir) && fs.removeSync(dataDir)
    fs.copySync(path.resolve(process.cwd(), 'data'), dataDir)
    // 2、备份 /projects/ 目录
    let projectsDir: string = path.resolve(rootDir, 'projects')
    fs.existsSync(projectsDir) && fs.removeSync(projectsDir)
    fs.copySync(path.resolve(process.cwd(), 'projects'), projectsDir)
    // 3、备份 静态文件目录 /client/static/
    let staticDir: string = path.resolve(rootDir, 'client/static')
    fs.existsSync(staticDir) && fs.removeSync(staticDir)
    fs.copySync(path.resolve(process.cwd(), 'client/static'), staticDir)
    // 4、备份数据库
    let config: ServerConfiguration = loadData('data/config') as ServerConfiguration
    let { uris } = config.mongodb || { uris: '' }
    if (uris) {
      let url: string = Array.isArray(uris) ? uris[0] : uris.split(/\;/)[0]
      let { pathname, port } = UrlParse(url)
      let dbname: string = pathname.replace(/^(\/)/i, '')
      await runscript(`mongodump -h 127.0.0.1 --port ${port} -d ${dbname} -o ${rootDir}/mongodb/`)
    }
    // 4、备份 上传文件目录 /uploadfiles/
    let uploadDir: string = path.resolve(rootDir, 'uploadfiles')
    if (fs.existsSync(path.resolve(process.cwd(), 'uploadfiles'))) {
      fs.copySync(path.resolve(process.cwd(), 'uploadfiles'), uploadDir)
    }
    return await TaskSpinner(Promise.resolve(`Backup Finished.`))
  } catch (error) {
    console.log(``)
    console.error(error)
  }
}

function dirChoices (dir: string, opts: Record<'name' | 'value', string>): Array<Record<'name' | 'value', string>> {
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

