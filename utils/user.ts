import { map, compact, flattenDeep } from 'lodash'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'

/**
 * 获取用户 Platform
 * @param user responseUserDocument
 */
export function getPlatform (user: responseUserDocument): number[] {
  let { group, teams } = user
  let platforms: number[][] = [ group.platform, ...map(teams, 'platform') ]
  return parseArray(platforms)
}

/**
 * 获取用户 Access
 * @param user responseUserDocument
 */
export function getAccess (user: responseUserDocument): string[] {
  let { access, group, teams } = user
  let iaccess: string[][] = [ group.access, ...map(teams, 'access'), access ]
  return parseArray(iaccess)
}

/**
 * 获取用户项目线路
 * @param user responseUserDocument
 * @param channel string
 * @param allRtsps string[]
 */
export function getRtsps (user: responseUserDocument, channel: string, allRtsps: string[], lockValue?: string): string[] {
  let { group, teams } = user
  if (lockValue) return [ lockValue ]
  if (group.level > 8000) {
    return allRtsps
  }
  let rtsps = map(teams, `rtsps.${channel}`)
  return parseArray(rtsps)

}

/**
 * 解析多元数组
 * @param value 
 */
function parseArray (value: any[]): any[] {
  let val = compact(flattenDeep(value))
  return Array.from(new Set(val))
}

