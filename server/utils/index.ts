import * as crypto from 'crypto'
import * as passport from '@/types/passport'
import { toInteger } from 'lodash'
import { PageInfo } from '@/types/resuful'

import * as path from 'path'
import * as fs from 'fs-extra'
import { loadData } from 'kenote-config-helper/dist/utils.server'
import { ProtoOptions, ProtoAPI, ProtoSend } from '@/types/proto'
import { Maps } from 'kenote-config-helper'

export const md5 = (text: string): string => crypto.createHash('md5').update(text).digest('hex')

export const sha1 = (text: string): string => crypto.createHash('sha1').update(text).digest('hex')

class Bcrypt {

  public hash (value: string, salt?: string): passport.Password {
    salt = salt || Math.random().toString(36).substr(8)
    let password: passport.Password = { salt, hash: sha1(`${md5(value)}^${salt}`) }
    return password
  }

  public compare (value: string, hash: string, salt: string): boolean {
    let password: passport.Password = this.hash(value, salt)
    return password.hash === hash
  }
}

export const bcrypt: Bcrypt = new Bcrypt()

export const toPageInfo = (page: number, size: number = 10): PageInfo => {
  let parseVal: number = toInteger(page || 1)
  // tslint:disable-next-line: use-isnan
  let val: number = parseVal === NaN ? 1 : parseVal
  let pageCode: number = isNaN(val) || val < 1 ? 1 : parseVal
  let skipVal: number = (pageCode - 1) * size
  return { page: pageCode, limit: size, skip: skipVal }
}

export function getRtsps () {
  let _rtsps: Maps<string[]> = {}
  let projectDir: string = path.resolve(process.cwd(), 'projects')
  if (!fs.existsSync(projectDir)) return _rtsps
  let projects = fs.readdirSync(projectDir)
  for (let project of projects) {
    let projectStat: fs.Stats = fs.statSync(path.resolve(projectDir, project))
    if (projectStat.isDirectory()) {
      let options: ProtoOptions = loadData(`projects/${project}/setting`) as ProtoOptions
      let { rstps } = options
      _rtsps[project] = Object.keys(rstps)
    }
  }
  return _rtsps
}

