<template>
  <page>
    <breadcrumb :channel="selectedChannel" :route="$route" />

    <project-screen :show-submit="showSubmit" :projects="projects" :tag="projectTag" @change="value => projectTag = value">
      <!-- 编辑模式 -->
      <project-setting-edit v-if="mode === 'edit'"
        :options="projectOptions.ditch || {}"
        :title="title"
        @submit="handleSubmit"
        @goback="handleGoback"
        :loading="loading">
      </project-setting-edit>
      <!-- 分配模式 -->
      <project-setting-ditch-allot v-else-if="mode === 'allot'"
        :data="list"
        :project="projects.find( o => o.label === projectTag)"
        @get-teams="handleGetTeams"
        @submit="handleSubmitAllot"
        @goback="handleGoback"
        :loading="loading">
      </project-setting-ditch-allot>
      <!-- 列表模式 -->
      <project-setting-ditch-list v-else-if="mode === 'list'"
        :data="list"
        :options="projectOptions.ditch || {}"
        :pagination="pagination" 
        :pageno="pageno" 
        :loading="loading">

      </project-setting-ditch-list>
      <!-- 底部选项 -->
      <template slot="baseinfo">
        <el-button type="primary" style="margin-left:15px" :disabled="!projectTag" @click="handleOpenEdit">编辑配置</el-button>
        <el-button type="success" :disabled="!projectTag" @click="handleOpenAllot">渠道分配</el-button>
      </template>
    </project-screen>
  </page>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, namespace, Watch } from 'nuxt-property-decorator'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'
import { KenoteConfig, Channel, Navigation, Maps } from 'kenote-config-helper'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import projectSettingDitchList from '~/components/project/setting/ditch-list.vue'
import projectSettingDitchAllot from '~/components/project/setting/ditch-allot.vue'
import projectSettingEdit from '~/components/project/setting/edit.vue'
import projectScreen from '~/components/project/screen.vue'
import httpClient from '@/utils/http'
import { HeaderOptions, resufulInfo } from '@/types/resuful'
import { orderBy, isArray } from 'lodash'
import * as nunjucks from 'nunjucks'
import { oc } from 'ts-optchain'
import { responseDocument as responseTeamDocument } from '@/types/proxys/team'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    projectSettingDitchList,
    projectSettingEdit,
    projectSettingDitchAllot,
    projectScreen
  },
  created () {
    let self: R = this as R 
    let projects: KenoteConfig.Channel[] = self.channels.filter( o => o.id > 1000 )
    self.projects = orderBy(projects, ['id'], ['asc'])
    setTimeout(() => {
      self.showSubmit = true
    }, 1500)
  },
  mounted () {
    let self: R = this as R 
    if (!self.selectedChannel) return
    let channelStore: Channel = new Channel(self.selectedChannel)
    let pageSetting: Navigation | undefined = channelStore.find(self.$route.path)
    if (!pageSetting) return
    self.pageSetting = pageSetting
  }
})
export default class R extends Vue {

  @Setting.State channels!: KenoteConfig.Channel[]
  @Setting.Getter selectedChannel!: KenoteConfig.Channel
  @Auth.State token!: string
  @Auth.State user!: responseUserDocument

  @Provide() showSubmit: boolean = false
  @Provide() projects: KenoteConfig.Channel[] = []
  @Provide() projectTag: string = ''
  @Provide() projectOptions: Maps<any> = {}
  @Provide() loading: boolean = false
  @Provide() list: Maps<string>[] = []
  @Provide() pageSetting: Navigation = { index: '-1', name: '' }
  @Provide() pageno: number = 1
  @Provide() pagination: boolean = true
  @Provide() mode: 'list' | 'edit' | 'allot' = 'list'
  @Provide() title: string = ''

  @Watch('projectTag')
  onProjectTagChange (val: string, oldVal: string): void {
    let project: KenoteConfig.Channel = this.projects.find( o => o.label === val ) as KenoteConfig.Channel
    this.projectOptions = oc(project).options({})
    this.handleGetList()
  }

  @Watch('mode')
  onModeChange (val: 'list' | 'edit', oldVal: 'list' | 'edit'): void {
    setTimeout(() => {
      this.showSubmit = val === 'list'
      if (val === 'list') {
        this.handleGetList()
      }
    }, 300)
  }

  handleGetList (name?: string): void {
    // let { api } = this.pageSetting
    // let url: string = nunjucks.renderString(api as string, { channel: this.projectTag })
    // api --> `/api/v1/ditch/${this.projectTag}`
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.get(`/api/v1/ditch/${this.projectTag}`, {}, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.list = isArray(result.data) ? result.data : []
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleOpenEdit (): void {
    this.mode = 'edit'
    let project: KenoteConfig.Channel = this.projects.find( o => o.label === this.projectTag ) as KenoteConfig.Channel
    this.title = `${oc(project).name('')} --> ${oc(this.pageSetting).name('')}`
  }

  handleOpenAllot (): void {
    this.mode = 'allot'
    let project: KenoteConfig.Channel = this.projects.find( o => o.label === this.projectTag ) as KenoteConfig.Channel
    this.title = ``
  }

  handleGoback (): void {
    this.mode = 'list'
  }

  handleSubmit (content: string): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/ditch/${this.projectTag}/update`, { content }, options)
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

  handleGetTeams (next: (teams: responseTeamDocument[]) => void) {
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.get(`/api/v1/ucenter/team/list`, {  }, options)
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

  handleSubmitAllot (values: any): void {
    console.log(values)
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/ditch/${this.projectTag}/allot`, values, options)
        this.loading = false
        if (result.Status.code === 0) {
          // this.mode = 'list'
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