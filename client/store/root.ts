import { GetterTree, ActionContext, ActionTree, MutationTree } from 'vuex'
import { Maps } from 'kenote-config-helper'
import { RootState } from '~/client/store'
import { HTTPServer } from '~/types/resuful'

export const types: Maps<string> = {}

export interface State extends Maps<any> {}

export const state = (): State => ({})

export const getters: GetterTree<State, RootState> = {}

export interface Actions<S, R> extends ActionTree<S, R> {
  nuxtServerInit(context: ActionContext<S, R>, server: HTTPServer): void
}

export const actions: Actions<State, RootState> = {
  async nuxtServerInit({ commit }, { req }) {
    // 
    console.log('req')
  }
}

export const mutations: MutationTree<State> = {}