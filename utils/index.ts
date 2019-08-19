import { assign } from 'lodash'
import { Maps } from 'kenote-config-helper'

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
