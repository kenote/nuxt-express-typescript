<template>
  <page>
    <breadcrumb :channel="selectedChannel" :route="$route" />

    <ucenter-group-create v-if="mode === 'create'"
      @submit="handleSubmitCreate"
      @goback="handleGoback"
      :loading="loading" 
      />
    <ucenter-group-edit v-else-if="mode === 'edit'"
      :data="selected"
      @submit="handleSubmitEdit"
      @goback="handleGoback"
      :loading="loading"
      />
    <ucenter-platform v-else-if="mode === 'platform'"
      type="group"
      :data="selected"
      :platforms="platforms"
      @submit="handleSubmitPlatform"
      @goback="handleGoback"
      :loading="loading"
      />
    <ucenter-access v-else-if="mode === 'access'"
      type="group"
      :data="selected"
      :channels="channels"
      @submit="handleSubmitAccess"
      @goback="handleGoback"
      :loading="loading"
      />
    <ucenter-group-list v-else
      :data="list" 
      @getlist="handleList"
      @edit="handleEdit" 
      @platform="handlePlatform" 
      @access="handleAccess" 
      @remove="handleRemove"
      :loading="loading" >
      <el-button type="primary" @click="handleCreate">创建用户组</el-button>
    </ucenter-group-list>
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
import ucenterGroupList from '~/components/ucenter/group-list.vue'
import ucenterGroupCreate from '~/components/ucenter/group-create.vue'
import ucenterGroupEdit from '~/components/ucenter/group-edit.vue'
import ucenterPlatform from '~/components/ucenter/platform.vue'
import ucenterAccess from '~/components/ucenter/access.vue'
import { HeaderOptions, resufulInfo } from '@/types/resuful'
import { Ucenter, Option } from '@/types'
import { orderBy } from 'lodash'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    ucenterGroupList,
    ucenterGroupCreate,
    ucenterGroupEdit,
    ucenterPlatform,
    ucenterAccess
  },
  created () {
    let self: R = this as R 
    let platforms: Option[] = []
    for (let channel of self.channels) {
      platforms.push({ key: channel.id, label: channel.name })
    }
    self.platforms = orderBy(platforms, ['key'], ['asc'])
  }
})
export default class R extends Vue {

  @Setting.State channels!: KenoteConfig.Channel[]
  @Setting.Getter selectedChannel!: KenoteConfig.Channel
  @Auth.State token!: string
  @Auth.State user!: responseUserDocument

  @Provide() list: responseGroupDocument[] = []
  @Provide() loading: boolean = false
  @Provide() mode: 'list' | 'create' | 'edit' | 'platform' | 'access' = 'list'
  @Provide() selected: responseGroupDocument | null = null
  @Provide() platforms: Option[] = []

  handleCreate (): void {
    this.mode = 'create'
  }

  handleEdit (index: number, row: responseGroupDocument): void {
    this.mode = 'edit'
    this.selected = row
  }

  handlePlatform (index: number, row: responseGroupDocument): void {
    this.mode = 'platform'
    this.selected = row
  }

  handleAccess (index: number, row: responseGroupDocument): void {
    this.mode = 'access'
    this.selected = row
  }

  handleRemove (_id: string, values: any): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.delete(`/api/v1/ucenter/group/${_id}`, values, options)
        if (result.Status.code === 0) {
          result = await httpClient.post(`/api/v1/ucenter/group/list`, {}, options)
        }
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

  handleGoback (): void {
    this.mode = 'list'
  }

  handleList (): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/ucenter/group/list`, {}, options)
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

  handleSubmitCreate (values: Ucenter.CreateGroup): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/ucenter/group/create`, values, options)
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

  handleSubmitEdit (_id: string, values: Ucenter.CreateGroup): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/ucenter/group/edit/${_id}`, values, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.mode = 'list'
          this.selected = null
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleSubmitPlatform (_id: string, platform: number[]): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/ucenter/group/platform/${_id}`, { platform }, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.mode = 'list'
          this.selected = null
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleSubmitAccess (_id: string, access: string[]): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/ucenter/group/access/${_id}`, { access }, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.mode = 'list'
          this.selected = null
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }
  
}
</script>