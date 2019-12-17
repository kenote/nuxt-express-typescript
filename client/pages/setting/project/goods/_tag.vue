<template>
  <page>
    <breadcrumb :channel="selectedChannel" :route="$route" />
    <project-screen :show-submit="showSubmit" :projects="projects" :tag="projectTag" @change="value => projectTag = value">
      <!-- 编辑模式 -->
      <project-setting-edit v-if="mode === 'edit'"
        :options="projectOptions || {}"
        :title="title"
        @submit="handleSubmit"
        @goback="handleGoback"
        :loading="loading">
      </project-setting-edit>
      <!-- 列表模式 -->
      <project-result-table v-else-if="mode === 'list'"
        :data="list"
        :columns="projectOptions.columns || []" 
        :pagination="pagination" 
        :pageno="pageno" 
        :pagesize="15"
        :search-options="projectOptions.search"
        :loading="loading">
      </project-result-table>
      <!-- 底部选项 -->
      <template slot="baseinfo">
        <el-button type="primary" style="margin-left:15px" :disabled="!projectTag" @click="handleOpenEdit">编辑配置</el-button>
      </template>
    </project-screen>
  </page>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, namespace, Watch } from 'nuxt-property-decorator'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'
import { KenoteConfig, Maps, Navigation, Channel } from 'kenote-config-helper'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import httpClient from '@/utils/http'
import { HeaderOptions, resufulInfo } from '@/types/resuful'
import projectResultTable from '~/components/project/result/table.vue'
import projectSettingEdit from '~/components/project/setting/edit.vue'
import projectScreen from '~/components/project/screen.vue'
import { orderBy, isArray } from 'lodash'
import * as nunjucks from 'nunjucks'
import { oc } from 'ts-optchain'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    projectResultTable,
    projectSettingEdit,
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
  @Provide() mode: 'list' | 'edit' = 'list'
  @Provide() title: string = ''

  @Watch('projectTag')
  onProjectTagChange (val: string, oldVal: string): void {
    let project: KenoteConfig.Channel = this.projects.find( o => o.label === val ) as KenoteConfig.Channel
    let tag: string = oc(this.pageSetting).index('').replace(/^([\/\w]+)\/(\w+)$/, '$2')
    this.projectOptions = oc(project).options({})[tag] as Maps<any> || {}
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
    let { api } = this.pageSetting
    let url: string = nunjucks.renderString(api as string, { channel: this.projectTag })
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.get(url, {}, options)
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

  handleGoback (): void {
    this.mode = 'list'
  }

  handleSubmit (content: string): void {
    let { api } = this.pageSetting
    let url: string = nunjucks.renderString(api as string, { channel: this.projectTag })
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(url, { content }, options)
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

  handleProjectChange (name: string): void {
    
  }
  
}
</script>

<style lang="scss" scoped>
.box {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #999;
  height: 70px;
  border-top: 1px solid #ccc;
  padding-top: 8px;
  margin-top: 8px;
}
</style>