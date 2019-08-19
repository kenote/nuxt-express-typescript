import { ActionTree, MutationTree, GetterTree, ActionContext } from 'vuex'
import { Maps } from 'kenote-config-helper'
import { RootState } from '../'
import { Register } from '@/types/resuful'
import * as singlepage from '@/types/singlepage'

export const name: string = 'setting'

export const types = {
  BASEURL            : 'BASEURL',
  REGISTER           : 'REGISTER',
  SINGLEPAGES        : 'SINGLEPAGES'
}

export interface State extends Maps<any> {
  baseurl           ?: string
  register          ?: Register.Config
  singlepages       ?: singlepage.Item[]
}

export const namespaced: boolean = true

export const state = (): State => ({
  
})

export const getters: GetterTree<State, RootState> = {
  
}

export interface Actions<S, R> extends ActionTree<S, R> {
  
}

export const actions: Actions<State, RootState> = {
  
}

export const mutations: MutationTree<State> = {
  [types.REGISTER] (state: State, register: Register.Config) {
    state.register = register
  },
  [types.SINGLEPAGES] (state: State, singlepages: singlepage.Item[]) {
    state.singlepages = singlepages
  }
}
