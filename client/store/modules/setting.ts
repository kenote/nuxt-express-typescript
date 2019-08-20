import { ActionTree, MutationTree, GetterTree, ActionContext } from 'vuex'
import { Maps, KenoteConfig, Channel } from 'kenote-config-helper'
import { RootState } from '../'
import { Register } from '@/types/resuful'
import * as singlepage from '@/types/singlepage'
import { Dropdown } from '@/types'

export const name: string = 'setting'

export const types = {
  BASEURL            : 'BASEURL',
  REGISTER           : 'REGISTER',
  SINGLEPAGES        : 'SINGLEPAGES',
  SELECTCHANNEL      : 'SELECTCHANNEL',
  LOADING            : 'LOADING',
  USERENTRANCE       : 'USERENTRANCE',
  CHANNELS           : 'CHANNELS'
}

export interface State extends Maps<any> {
  baseurl           ?: string
  register          ?: Register.Config
  singlepages       ?: singlepage.Item[]
  channels           : KenoteConfig.Channel[]
  selected           : { channel: number }
  userEntrance       : Dropdown.MenuItem[]
}

export const namespaced: boolean = true

export const state = (): State => ({
  channels: [],
  selected: { 
    channel: 0 
  },
  userEntrance: []
})

export const defaultChannel: KenoteConfig.Channel = { id: 0, name: '控制台', label: 'console', navs: [], default: '/' }

export const getters: GetterTree<State, RootState> = {
  selectedChannel: state => {
    let p: KenoteConfig.Channel = state.channels.find( o => o.id === state.selected.channel )!
    return p || defaultChannel
  },
  channelStore: state => {
    let p: KenoteConfig.Channel = state.channels.find( o => o.id === state.selected.channel ) || defaultChannel
    return new Channel(p)
  }
}

export interface Actions<S, R> extends ActionTree<S, R> {
  selectChannel(context: ActionContext<S, R>, id: number): void
}

export const actions: Actions<State, RootState> = {
  async selectChannel({ commit }, id: number) {
    commit(types.LOADING, 'channel')
    setTimeout(() => {
      commit(types.SELECTCHANNEL, id)
      Promise.resolve(null)
    }, 300)
  }
}

export const mutations: MutationTree<State> = {
  [types.REGISTER] (state: State, register: Register.Config) {
    state.register = register
  },
  [types.SINGLEPAGES] (state: State, singlepages: singlepage.Item[]) {
    state.singlepages = singlepages
  },
  [types.USERENTRANCE] (state: State, userEntrance: Dropdown.MenuItem[]) {
    state.userEntrance = userEntrance
  },
  [types.CHANNELS] (state: State, channels: KenoteConfig.Channel[]) {
    state.channels = channels
  }
}
