import { GetterTree, ActionContext, ActionTree, MutationTree } from 'vuex'
import { Maps, getChannelId } from 'kenote-config-helper'
import { RootState } from './'
import { HTTPServer, resufulInfo, HeaderOptions } from '@/types/resuful'
import * as setting from './modules/setting'
import * as auth from './modules/auth'
import httpClient from '@/utils/http'

export const types: Maps<string> = {}

export interface State extends Maps<any> {}

export const state = (): State => ({})

export const getters: GetterTree<State, RootState> = {}

export interface Actions<S, R> extends ActionTree<S, R> {
  nuxtServerInit(context: ActionContext<S, R>, server: HTTPServer): void
}

export const actions: Actions<State, RootState> = {
  async nuxtServerInit({ commit }, { req }) {
    commit(`${setting.name}/${setting.types.REGISTER}`, req.__register)
    commit(`${setting.name}/${setting.types.SINGLEPAGES}`, req.__singlePages)
    commit(`${setting.name}/${setting.types.USERENTRANCE}`, req.__userEntrance)
    commit(`${setting.name}/${setting.types.CHANNELS}`, req.__channels)
    let channelId: number = getChannelId(req.__channels, req.path)
    console.log(channelId)
    commit(`${setting.name}/${setting.types.SELECTCHANNEL}`, channelId || 0)
    if (req.cookies['token']) {
      let headers: HeaderOptions = {
        token: req.cookies['token']
      }
      let host: string = req.protocol + '://' + req.headers.host
      try {
        let result: resufulInfo = await httpClient.get(`${host}/api/v1/passport/accesstoken`, null, headers)
        if (result.Status.code === 0) {
          commit(`${auth.name}/${auth.types.SET}`, result.data)
          return
        }
        console.warn(result.Status.message)
      } catch (error) {
        console.error(error!.message)
      }
    }
  }
}

export const mutations: MutationTree<State> = {}
