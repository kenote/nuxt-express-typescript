import { ActionTree, MutationTree, GetterTree, ActionContext } from 'vuex'
import { Maps } from 'kenote-config-helper'
import { RootState } from '../'

export const name: string = 'setting'

export const types: Maps<string> = {}

export interface State extends Maps<any> {}

export const namespaced: boolean = true

export const state = (): State => ({})

export const getters: GetterTree<State, RootState> = {
  
}

export interface Actions<S, R> extends ActionTree<S, R> {
  
}

export const actions: Actions<State, RootState> = {
  
}

export const mutations: MutationTree<State> = {
  
}