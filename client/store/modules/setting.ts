import { ActionTree, MutationTree, GetterTree, ActionContext } from 'vuex'
import { Maps, KenoteConfig, Channel, Navigation } from 'kenote-config-helper'
import { RootState } from '../'
import { Register, FlagItem } from '@/types/resuful'
import * as singlepage from '@/types/singlepage'
import { Dropdown } from '@/types'
import homepage from '@/types/homepage'

export const name: string = 'setting'

export const types = {
  BASEURL            : 'BASEURL',
  REGISTER           : 'REGISTER',
  SINGLEPAGES        : 'SINGLEPAGES',
  SELECTCHANNEL      : 'SELECTCHANNEL',
  LOADING            : 'LOADING',
  USERENTRANCE       : 'USERENTRANCE',
  CHANNELS           : 'CHANNELS',
  FLAGES             : 'FLAGES',
  HOMEPAGE           : 'HOMEPAGE',
  NAVIGATION         : 'NAVIGATION',
  FOOTER             : 'FOOTER'
}

export interface State extends Maps<any> {
  baseurl           ?: string
  register          ?: Register.Config
  singlepages       ?: singlepage.Item[]
  channels           : KenoteConfig.Channel[]
  selected           : Maps<number>
  userEntrance       : Dropdown.MenuItem[]
  loading            : Maps<boolean>
  flags              : Maps<FlagItem>
  homepage           : Maps<homepage.Page>
  navigation         : Maps<Navigation[]>
  footer             : Maps<homepage.Footer>
}

export const namespaced: boolean = true

export const state = (): State => ({
  channels: [],
  selected: { 
    channel: 0 
  },
  userEntrance: [],
  loading: {
    channel: false
  },
  flags: {},
  homepage: {},
  navigation: {},
  footer: {}
})

export const defaultChannel: KenoteConfig.Channel = { id: 0, name: '控制台', label: 'console', navs: [], default: '/' }

export const getters: GetterTree<State, RootState> = {
  selectedChannel: state => {
    let p: KenoteConfig.Channel = state.channels.find( o => o.id === state.selected.channel )!
    return p || defaultChannel
  },
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
  [types.REGISTER] (state: State, register: Register.Config): void {
    state.register = register
  },
  [types.SINGLEPAGES] (state: State, singlepages: singlepage.Item[]): void {
    state.singlepages = singlepages
  },
  [types.USERENTRANCE] (state: State, userEntrance: Dropdown.MenuItem[]): void {
    state.userEntrance = userEntrance
  },
  [types.CHANNELS] (state: State, channels: KenoteConfig.Channel[]): void {
    state.channels = channels
  },
  [types.SELECTCHANNEL] (state: State, id: number): void {
    state.selected.channel = id
    state.loading.channel = false
  },
  [types.LOADING] (state: State, key: string): void {
    state.loading[key] = true
  },
  [types.FLAGES] (state: State, flags: Maps<FlagItem>): void {
    state.flags = flags
  },
  [types.HOMEPAGE] (state: State, homepage: Maps<homepage.Page>): void {
    state.homepage = homepage
  },
  [types.NAVIGATION] (state: State, navigation: Maps<Navigation[]>): void {
    state.navigation = navigation
  },
  [types.FOOTER] (state: State, footer: Maps<homepage.Footer>): void {
    state.footer = footer
  }
}
