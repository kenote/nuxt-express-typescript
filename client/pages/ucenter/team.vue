<template>
  <page>
    <breadcrumb :channel="selectedChannel" :route="$route" />
    
    <ucenter-team-create v-if="mode === 'create'"
      @submit="handleSubmitCreate"
      @goback="handleGoback"
      :loading="loading" 
      />
    <ucenter-team-edit v-else-if="mode === 'edit'"
      :data="selected"
      @submit="handleSubmitEdit"
      @goback="handleGoback"
      :loading="loading"
      />
    <ucenter-platform v-else-if="mode === 'platform'"
      type="team"
      :data="selected"
      :platforms="platforms"
      @submit="handleSubmitPlatform"
      @goback="handleGoback"
      :loading="loading"
      />
    <ucenter-access v-else-if="mode === 'access'"
      type="team"
      :data="selected"
      :channels="channels"
      @submit="handleSubmitAccess"
      @goback="handleGoback"
      :loading="loading"
      />
    <ucenter-people v-else-if="mode === 'people'"
      :data="selected"
      @get-people="handleGetPeople"
      @search_keywords="handleGetSeachUsers"
      @submit="handleSubmitPeople"
      @remove="handleRemovePeople"
      @goback="handleGoback"
      :loading="loading"
      />
    <ucenter-team-list v-else
      :data="list" 
      @getlist="handleList"
      @edit="handleEdit" 
      @platform="handlePlatform" 
      @access="handleAccess"
      @people="handlePeople"
      @remove="handleRemove"
      :loading="loading" >
      <el-button type="primary" @click="handleCreate">创建团队</el-button>
    </ucenter-team-list>
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
import { responseDocument as responseTeamDocument } from '@/types/proxys/team'
import ucenterTeamList from '~/components/ucenter/team-list.vue'
import ucenterTeamCreate from '~/components/ucenter/team-create.vue'
import ucenterTeamEdit from '~/components/ucenter/team-edit.vue'
import ucenterPlatform from '~/components/ucenter/platform.vue'
import ucenterAccess from '~/components/ucenter/access.vue'
import ucenterPeople from '~/components/ucenter/people.vue'
import { HeaderOptions, resufulInfo } from '@/types/resuful'
import { Ucenter, listDocument , Option } from '@/types'
import { orderBy } from 'lodash'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    ucenterTeamList,
    ucenterTeamCreate,
    ucenterTeamEdit,
    ucenterPlatform,
    ucenterAccess,
    ucenterPeople
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

  @Provide() list: responseTeamDocument[] = []
  @Provide() loading: boolean = false
  @Provide() mode: 'list' | 'create' | 'edit' | 'platform' | 'access' | 'people' = 'list'
  @Provide() selected: responseTeamDocument | null = null
  @Provide() platforms: Option[] = []

  handleCreate (): void {
    this.mode = 'create'
  }

  handleEdit (index: number, row: responseTeamDocument): void {
    this.mode = 'edit'
    this.selected = row
  }

  handlePlatform (index: number, row: responseTeamDocument): void {
    this.mode = 'platform'
    this.selected = row
  }

  handleAccess (index: number, row: responseTeamDocument): void {
    this.mode = 'access'
    this.selected = row
  }

  handlePeople (index: number, row: responseTeamDocument): void {
    this.mode = 'people'
    this.selected = row
  }

  handleRemove (_id: string): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.delete(`/api/v1/ucenter/team/${_id}`, {}, options)
        if (result.Status.code === 0) {
          result = await httpClient.get(`/api/v1/ucenter/team/list`, {}, options)
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
        let result: resufulInfo = await httpClient.get(`/api/v1/ucenter/team/list`, {}, options)
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

  handleSubmitCreate (values: Ucenter.CreateTeam): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/ucenter/team/create`, values, options)
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

  handleSubmitEdit (_id: string, values: Ucenter.CreateTeam): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/ucenter/team/edit/${_id}`, values, options)
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
        let result: resufulInfo = await httpClient.post(`/api/v1/ucenter/team/platform/${_id}`, { platform }, options)
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
        let result: resufulInfo = await httpClient.post(`/api/v1/ucenter/team/access/${_id}`, { access }, options)
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

  handleGetPeople (_id: string,  next: (user: responseUserDocument[]) => void): void {
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/ucenter/team/people/${_id}`, {}, options)
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

  handleGetSeachUsers (keywords: string, next: (user: responseUserDocument[]) => void): void {
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.get(`/api/v1/ucenter/team/invitee_suggestions`, { q: keywords }, options)
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

  handleSubmitPeople (_id: string, peoples: responseUserDocument[], next: (data: any) => void): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/ucenter/team/people/${_id}/add`, { peoples }, options)
        this.loading = false
        if (result.Status.code === 0) {
          next(result.data)
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleRemovePeople (_id: string, people: responseUserDocument, next: (data: any) => void): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.delete(`/api/v1/ucenter/team/people/${_id}`, { people }, options)
        this.loading = false
        if (result.Status.code === 0) {
          next(result.data)
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