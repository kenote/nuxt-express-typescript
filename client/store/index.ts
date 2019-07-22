import Vuex, { ModuleTree } from 'vuex'
import { Maps } from 'kenote-config-helper'
import * as root from './root'
import * as auth from './modules/auth'
import * as setting from './modules/setting'

interface ModulesStates extends Maps<any> {}

export type RootState = root.State & ModulesStates

export const modules: ModuleTree<ModulesStates> = {
  [auth.name]         : auth,
  [setting.name]      : setting
}

export const state = () => root.state()

export const getters = root.getters

export const mutations = root.mutations

export const actions = root.actions

/*const createStore = () => new Vuex.Store({
  state           : root.state(),
  getters         : root.getters,
  mutations       : root.mutations,
  actions         : root.actions,
  modules         : modules
})

export default createStore*/