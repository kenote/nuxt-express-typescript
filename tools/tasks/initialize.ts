
import { TaskSpinner } from 'kenote-task-helper'

export default async function (): Promise<any> {

  return TaskSpinner(Promise.resolve(`Initialize Finished.`))
}
