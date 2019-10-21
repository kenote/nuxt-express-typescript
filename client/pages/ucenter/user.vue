<template>
  <page>
    <breadcrumb :channel="selectedChannel" :route="$route" />

    <ucenter-user-list
      :list="list"
      :auth="user"
      :conditions="conditions"
      @getlist="handleList"
      @get-groups="handleGetGroups"
      :loading="loading">

    </ucenter-user-list>
  </page>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, namespace } from 'nuxt-property-decorator'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'
import { KenoteConfig } from 'kenote-config-helper'
import httpClient from '@/utils/http'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { responseDocument as responseGroupDocument } from '@/types/proxys/group'
import ucenterUserList from '~/components/ucenter/user-list.vue'
import { HeaderOptions, resufulInfo } from '@/types/resuful'
import { Ucenter, listDocument } from '@/types'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    ucenterUserList
  }
})
export default class R extends Vue {

  @Setting.Getter selectedChannel!: KenoteConfig.Channel
  @Auth.State token!: string
  @Auth.State user!: responseUserDocument

  @Provide() list: listDocument<responseUserDocument> = {
    data: [],
    counts: 0,
    limit: 0
  }
  @Provide() loading: boolean = false
  @Provide() selected: responseUserDocument | null = null
  @Provide() conditions: Ucenter.FindUser | {} = {}

  handleList (conditions: Ucenter.FindUser): void {
    this.loading = true
    this.conditions = conditions
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/ucenter/user/list`, conditions, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.list = result.data
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleGetGroups (type: 'list' | 'lite', next: (group: responseGroupDocument[]) => void): void {
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/ucenter/group/${type}`, {}, options)
        if (result.Status.code === 0) {
          next(result.data)
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }
  
}
</script>