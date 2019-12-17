<template>
  <page>
    <breadcrumb :channel="selectedChannel" :route="$route" />
    <!-- 编辑模式 -->
    <ucenter-user-edit v-if="mode === 'edit'"
      :data="selected"
      :unique="handleUnique"
      @submit="handleSubmitEdit"
      @get-groups="handleGetGroups"
      @goback="handleGoback"
      :loading="loading">

    </ucenter-user-edit>
    <!-- 列表模式 -->
    <ucenter-user-list v-else
      :list="list"
      :auth="user"
      :conditions="conditions"
      @edit="handleEdit" 
      @getlist="handleList"
      @get-groups="handleGetGroups"
      :loading="loading">

    </ucenter-user-list>
  </page>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, namespace, Watch } from 'nuxt-property-decorator'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'
import { KenoteConfig } from 'kenote-config-helper'
import httpClient from '@/utils/http'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { responseDocument as responseGroupDocument } from '@/types/proxys/group'
import ucenterUserList from '~/components/ucenter/user-list.vue'
import ucenterUserEdit from '~/components/ucenter/user-edit.vue'
import { HeaderOptions, resufulInfo } from '@/types/resuful'
import { Ucenter, listDocument } from '@/types'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    ucenterUserList,
    ucenterUserEdit
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
  @Provide() mode: 'list' | 'edit' = 'list'

  handleList (conditions?: Ucenter.FindUser): void {
    this.loading = true
    if (conditions) this.conditions = conditions
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/ucenter/user/list`, this.conditions, options)
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

  handleEdit (index: number, row: responseUserDocument): void {
    this.mode = 'edit'
    this.selected = row
  }

  handleSubmitEdit (_id: string, values: Ucenter.EditUser): void {
    console.log(_id, values)
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/ucenter/user/edit/${_id}`, values, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.mode = 'list'
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleGoback (): void {
    this.mode = 'list'
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

  /**
   * 验证名称是否占用
   */
  async handleUnique (type: 'username' | 'email' | 'mobile', _id: string, value: string): Promise<boolean | undefined> {
    try {
      let options: HeaderOptions = {
        token: this.token
      }
      let result: resufulInfo = await httpClient.put(`/api/v1/ucenter/check/${type}`, { name: value, _id }, options)
      return result.data as boolean
    } catch (error) {
      this.$message.warning(error.message)
    }
  }
  
}
</script>