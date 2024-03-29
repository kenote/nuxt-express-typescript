
import { TaskSpinner } from 'kenote-task-helper'
import * as inquirer from 'inquirer'
import { pick } from 'lodash'
import { Maps, Deploy } from 'kenote-config-helper'
import { ITask } from '../task'
import { Deploy as IDeploy } from 'kenote-config-helper/dist/utils.server'

/**
 * 定制返回上级节点
 */
const footChoices: Maps<string>[] = [
  {
    name: '返回上级',
    value: 'goback'
  },
  {
    name: '退出',
    value: 'exit'
  }
]

/**
 * 从部署服务器启动
 * @param projects 
 */
export default async function startDeploy (projects: Deploy.Project[]): Promise<any> {
  
  // 选择项目
  let project: Deploy.Project = <Deploy.Project> await selectProject(projects)
  // 选择类型
  await startType(project, projects)
  
  return TaskSpinner(Promise.resolve(`Deploy Finished.`))
}

/**
 * 从选择类型启动
 * @param project 
 * @param projects 
 */
async function startType (project: Deploy.Project, projects: Deploy.Project[]): Promise<any> {
  let type: string = await selectType(project)
  if (type === 'goback') {
    return await startDeploy(projects)
  }
  else if (type === 'exit') {
    return process.cwd()
  }
  else if (type === 'command') {
    // 选择脚本
    let command: Deploy.Command | string = await selectScript(project.command || [])
    if (command === 'goback') {
      return await startType(project, projects)
    }
    else if (command === 'exit') {
      return process.cwd()
    }
    // 运行脚本
    let deploy: IDeploy = new IDeploy()
    await deploy.command(<Deploy.Command> command)
  }
  else if (/^(ftp|sftp)$/.test(type)) {
    // 上传文件
    let deploy: IDeploy = new IDeploy()
    await deploy.upload(project[type], type === 'ftp' ? 'ftp' : 'sftp')
  }
  // 完成后返回类型选择
  await new Promise((resolve, reject) => {
    setTimeout(async () => {
      await startType(project, projects)
    }, 500)
  })
  
  
  
}

/**
 * 选择项目
 * @param projects Deploy.Project[]
 * @returns Deploy.Project
 */
async function selectProject (projects: Deploy.Project[]): Promise<Deploy.Project | void> {
  let options: Maps<string>  = await inquirer.prompt([
    {
      type: 'rawlist',
      name: 'project',
      message: `选择项目:`,
      choices: projects.map( item => (<Maps<string>> { name: item.name, value: item.index })).concat(footChoices)
    }
  ])
  if (options.project === 'goback') {
    return await ITask.start()
  }
  else if (options.project === 'exit') {
    return process.exit(0)
  }
  return <Deploy.Project> projects.find( item => item.index === options.project )
}

/**
 * 选择操作类型
 * @param project Deploy.Project
 * @returns string
 */
async function selectType (project: Deploy.Project): Promise<string> {
  let options: Maps<string>  = await inquirer.prompt([
    {
      type: 'rawlist',
      name: 'type',
      message: `操作类型:`,
      choices: Object.keys(project).filter( item => /^(ftp|sftp|command)$/.test(item) ).map(toTypeChoice).concat(footChoices)
    }
  ])
  return options.type
}

/**
 * 选择运行脚本
 * @param scripts Deploy.Script
 * @returns any
 */
async function selectScript (scripts: Deploy.Command[]): Promise<Deploy.Command | string> {
  let options: Maps<string>  = await inquirer.prompt([
    {
      type: 'rawlist',
      name: 'script',
      message: `运行脚本:`,
      choices: scripts.map( item => (<Maps<string>> { name: item.name, value: item.index })).concat(footChoices)
    }
  ])
  if (options.script === 'goback') {
    return options.script
  }
  else if (options.script === 'exit') {
    return process.exit(0)
  }
  return <Deploy.Command> scripts.find( item => item.index === options.script )
}

/**
 * 转换类型选择器
 * @param value string
 * @returns Maps<string>
 */
function toTypeChoice (value: string): Maps<string> {
  let name: string = ''
  if (/^(ftp|sftp)$/.test(value)) {
    name = value.toLocaleUpperCase() + '上传'
  }
  else if (/^(command)$/.test(value)) {
    name = '运行命令'
  }
  return { name, value }
}