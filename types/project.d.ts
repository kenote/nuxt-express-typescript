import { KeyMap, Maps } from 'kenote-config-helper'

export type currency = 'zh-cn'

export interface ItemModel extends KeyMap<string> {

  price         ?: Price
}
/**
 * {
 *   price: {
 *     'zh-cn':   12,
 *     'us':      1.8
 *   }
 * }
 */
export type Price = Record<currency, number>