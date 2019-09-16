
import { TaskHelper, Connect, TaskItem } from 'kenote-task-helper'
import Initialize from './tasks/initialize'
import Deploy from './tasks/deploy'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { Maps, Deploy as IDeploy } from 'kenote-config-helper'
import Backup from './tasks/backup'
import Restore from './tasks/restore'

const deployConfig: IDeploy.Configuration = <IDeploy.Configuration> loadData('.deploy/deploy.config.yml', false, { 
  assign: {
    workspace: process.cwd()
  }
})
const deployTask: TaskItem[] = []
if (deployConfig.projects) {
  deployTask.push({ 
    name: '部署服务器', 
    value: 'deploy',
    script: () => Deploy(deployConfig.projects)
  })
}

@Connect({
  title: '选择操作类型',
  tasks: [
    { 
      name: '初始化', 
      value: 'initialize',
      script: Initialize
    },
    ...deployTask,
    {
      name: '备份当前部署',
      value: 'backup',
      script: Backup
    },
    {
      name: '还原当前部署',
      value: 'restore',
      script: Restore
    },
    {
      name: '退出',
      value: 'exit',
      script: () => process.exit(0)
    }
  ]
})
class Task extends TaskHelper {}

export const ITask: Task = new Task()

ITask.start()
