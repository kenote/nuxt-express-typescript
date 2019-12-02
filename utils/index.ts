import { assign, isString, zipObject, remove, isObject } from 'lodash'
import { Maps, Format } from 'kenote-config-helper'
import { Command } from '@/types'
import * as bytes from 'bytes'
import { oc } from 'ts-optchain'
import * as yaml from 'js-yaml'

/**
 * 将多个集合进行参数合并
 * @param fields string
 * @param collections Array<Maps<any>>
 */
export function mergeCollection (fields: string, ...collections: Array<Maps<any>>): Array<Maps<any>> {
  let collection: Array<Maps<any>> = [].concat(...collections as Array<ConcatArray<never>>)
  let newCollection: Array<Maps<any>> = []
  for (let item of collection) {
    let items: Array<Maps<any>> = collection.filter( o => o[fields] === item[fields] )
    let is_push: boolean = !newCollection.find( o => o[fields] === item[fields] )
    is_push && newCollection.push(assign({}, ...items))
  }
  return newCollection
}

/**
 * 解析菜单命令
 * @param value string
 */
export const parseCommand = (value: string): Command.Value | null => {
  if (!value) return null
  let command: RegExpMatchArray | null = value.match(/^(command|router)\:(\S+)$/)
  if (!command) return null
  return {
    type: <Command.Type> command[1],
    path: command[2]
  }
}

/**
 * 数字转时间格式
 * @param value number
 * @param tag 'm' | 's'
 */
export const intToTime = (value: number, tag: 'm' | 's' = 'm'): string => {
  if (tag === 'm') {
    let minute: number = value % 60
    let hour: number = (value - minute) / 60
    return [hour, minute].map( o => o.toLocaleString('zh', { minimumIntegerDigits: 2 })).join(':')
  }
  else {
    let second: number = value % 60
    let minute: number = ((value - second) / 60) % 60
    let hour: number = (value - minute * 60 - second) / 60
    return [hour, minute, second].map( o => o.toLocaleString('zh', { minimumIntegerDigits: 2 })).join(':')
  }
}

/**
 * 解析默认值
 * @param value any
 */
export const parseDefaultValue = (value: any): any => {
  if (Array.isArray(value)) {
    return value.map(parseDefaultValue)
  }
  let today: Date = new Date(new Date().setHours(0, 0, 0, 0))
  if (isString(value) && /^([\-]{0,1})([0-9]{1,3})(days)$/.test(value)) {
    let parseValue: RegExpMatchArray | null = value.match(/^([\-]{0,1})([0-9]{1,3})(days)$/)
    let { val, operator } = zipObject(['', 'operator', 'val'], parseValue || [])
    return new Date(today.setDate(operator === '-' ? today.getDate() - Number(val) : today.getDate() + Number(val)))
  }
  switch (value) {
    case 'now':
      return new Date()
    case 'today':
      return today
    case 'yesterday':
      return new Date(today.setDate(today.getDate() - 1))
    default:
      return value
  }
}

/**
 * 格式化字符串
 * @param value string | number
 * @param formats Format | Format[]
 */
export function formatString (value: string | number, formats: Format | Format[] | undefined): string | number {
  if (!formats) return value
  let _formats: Format[] = Array.isArray(formats) ? formats : [formats]
  for (let fmt of _formats) {
    if (fmt.function) {
      let _value: string | number | Date = fmt.type === 'number' ? Number(String(value).replace(/[^0-9\.]/g, '')) : String(value)
      if (fmt.type === 'date') _value = toDate(_value)
      try {
        value = _value[fmt.function || 'toLocaleString'](...fmt.options!)
      } catch (error) {
        let funcs: {} = { parseDefaultValue, intToTime, parseInt, bytes, parseMapString }
        if (Object.keys(funcs).includes(fmt.function)) {
          value = fmt.options ? funcs[fmt.function](value, ...fmt.options) : funcs[fmt.function](value)
        }
      }
    }
    if (fmt.regexp) {
      value = String(value).replace(fmt.regexp, fmt.substr || '')
    }
    if (fmt.maps) {
      value = fmt.maps[String(value)] || String(value)
    }
  }
  return value
}

function toDate (val: string | number): Date {
  if (/\d+/.test(val as string)) {
    return new Date(Number(val))
  }
  return new Date(val)
}

/**
 * 格式化成数组
 * @param value string | string[]
 * @param type 'number' | 'string'
 * @param splitter RegExp
 */
export function formatArray (value?: string | string[], type: 'number' | 'string' = 'string', splitter: RegExp = /(\,|\|)/): Array<number | string> {
  if (!value) return []
  if (Array.isArray(value)) {
    return formatArray(value.join(','), type, splitter)
  }
  let _value = value.split(splitter)
  if (type === 'number') {
    return arrayToNumber(_value)
  }
  remove(_value, o => !o || splitter.test(o))
  return _value.sort()
}

function arrayToNumber (value: string[]): number[] {
  let _value: number[] = value.map(Number)
  remove(_value, o => !o)
  return _value.sort((a, b) => a - b)
}

/**
 * 时间转数字
 * @param time string
 * @param tag 'm' | 's' | 'ms'
 */
export const timeToInt = (time: string, tag: 'm' | 's' | 'ms' = 's'): number => {
  let int: number = 0
  let suffix: Maps<number> = {
    ['m']: 1,
    ['s']: 60,
    ['ms']: 60000
  }
  let seconds: number = 0
  if (/^([0-2]{1}\d{1})\:([0-5]{1}\d{1})$/.test(time)) {
    let { hour, minute } = zipObject(['hour', 'minute'], time.split(':'))
    int = Number(hour) * 60 + Number(minute)
  }
  else if (/^([0-2]{1}\d{1})\:([0-5]{1}\d{1})\:([0-5]{1}\d{1})$/.test(time)) {
    let { hour, minute, second } = zipObject(['hour', 'minute', 'second'], time.split(':'))
    int = Number(hour) * 60 + Number(minute)
    seconds = Number(second)
  }
  int = int * suffix[tag]
  if (tag === 's') {
    int = int + seconds
  }
  else if (tag === 'ms') {
    int = int + (seconds * 1000)
  }
  return  int
}

export function parseMapString (data: Maps<any> | string, parse: Maps<string> | Array<{key: string, name: string }>): string {
  if (!isObject(data)) {
    if (Array.isArray(parse)) {
      return oc(parse.find(o => o.key == data)).name(data) // .find( o => o.key === data )
    }
    return parse[data] || data
  }
  let arr: string[] = []
  for (let key in data) {
    arr.push(`${parse[key] || key}:${data[key]}`)
  }
  return arr.join(' | ')
}

export function jsontoArray (data: string): string[] {
  let _data: any = {}
  try {
    _data = JSON.parse(data)
  } catch (error) {
    // tslint:disable-next-line: no-eval
    _data = eval(`(${data})`)
  }
  let data_arr: string[] = []
  for (let key in _data) {
    data_arr.push(`${key};${_data[key]}`)
  }
  return data_arr
}

export function toNameValue (data: Array<Maps<any>>, props: string[]): Array<Maps<any>> {
  let _data: Array<Maps<any>> = []
  for (let key in data[0]) {
    let item: Maps<any> = zipObject(props, [ key, data[0][key] ])
    _data.push(item)
  }
  return _data
}

export function isYaml (str: string): boolean {
  try {
    return !!yaml.load(str)
  } catch (error) {
    return false
  }
}

