import { ActionTree, MutationTree, GetterTree, ActionContext } from 'vuex'
import { Maps } from 'kenote-config-helper'
import { RootState } from '../'
import { responseDocument } from '@/types/proxys/user'
import { oc } from 'ts-optchain'

export const name: string = 'auth'

export const types = {
  SET                : 'SET',
  EMAIL              : 'EMAIL',
  MOBILE             : 'MOBILE'
}

export interface State extends Maps<any> {
  user               : responseDocument | null
  token              : string | null
}

export const namespaced: boolean = true

export const state = (): State => ({ 
  user: null, 
  token: null 
})

export const getters: GetterTree<State, RootState> = {
  
}

export interface Actions<S, R> extends ActionTree<S, R> {
  
}

export const actions: Actions<State, RootState> = {
  
}

export const mutations: MutationTree<State> = {
  [types.SET] (state: State, user: responseDocument | null): void {
    state.user = user
    state.token = oc(user).jw_token() || null
  },
  [types.EMAIL] (state: State, email: string): void {
    if (!state.user) return
    state.user.email = email
    state.user.binds = Array.from(new Set([ ...state.user.binds, 'email' ]))
  },
  [types.MOBILE] (state: State, mobile: string): void {
    if (!state.user) return
    state.user.mobile = mobile
    state.user.binds = Array.from(new Set([ ...state.user.binds, 'mobile' ]))
  }
}
