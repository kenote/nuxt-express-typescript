<template>
  <page>
    <breadcrumb :channel="selectedChannel" :route="$route" />

    <ucenter-ticket-create v-if="mode === 'create'"
      :auth="user"
      @submit="handleSubmitCreate"
      @get-groups="handleGetGroups"
      @goback="handleGoback"
      :loading="loading" />
    <ucenter-ticket-list v-else
      :data="list"
      :auth="user"
      @getlist="handleList"
      @remove="handleRemove"
      @selection="handleSelection"
      :loading="loading">
      <el-button type="primary" @click="handleCreate">创建邀请码</el-button>
      <el-button @click="handleRomoveSelection" >删除选中</el-button>
    </ucenter-ticket-list>
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
import { responseDocument as responseTicketDocument } from '@/types/proxys/ticket'
import ucenterTicketList from '~/components/ucenter/ticket-list.vue'
import ucenterTicketCreate from '~/components/ucenter/ticket-create.vue'
import { HeaderOptions, resufulInfo } from '@/types/resuful'
import { Ucenter } from '@/types'
import { map } from 'lodash'
import { ElMessageBoxOptions } from 'element-ui/types/message-box'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    ucenterTicketList,
    ucenterTicketCreate
  }
})
export default class R extends Vue {

  @Setting.Getter selectedChannel!: KenoteConfig.Channel
  @Auth.State token!: string
  @Auth.State user!: responseUserDocument

  @Provide() loading: boolean = false
  @Provide() list: responseTicketDocument[] = []
  @Provide() mode: 'list' | 'create' | 'edit' = 'list'
  @Provide() selection: responseTicketDocument[] = []

  handleGoback (): void {
    this.mode = 'list'
  }

  handleCreate (): void {
    this.mode = 'create'
  }

  handleList (): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/ucenter/ticket/list`, {}, options)
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

  handleRemove (index: number, row: responseTicketDocument | responseTicketDocument[]): void {
    let url: string = '/api/v1/ucenter/ticket'
    let values: any = {}
    if (Array.isArray(row)) {
      values = { _ids: map(row, '_id') }
    }
    else {
      url += `/${row._id}`
    }
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.delete(url, values, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.handleList()
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  } 

  handleSelection (selection: responseTicketDocument[]): void {
    this.selection = selection
  }

  async handleRomoveSelection (): Promise<void> {
    if (this.selection.length === 0) return

    let options: ElMessageBoxOptions = {
      confirmButtonText    : '确定',
      cancelButtonText     : '取消',
      type                 : 'warning'
    }
    try {
      await this.$confirm('此操作将永久删除选中邀请码, 是否继续?', '提示', options)
      this.handleRemove(-1, this.selection)
    } catch (error) {
      console.log('您已取消删除')
    }
  }

  handleGetGroups (next: (groups: responseGroupDocument[]) => void): void {
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/ucenter/group/lite`, {}, options)
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

  handleSubmitCreate (values: Ucenter.CreateTicket): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/ucenter/ticket/create`, values, options)
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
  
}
</script>