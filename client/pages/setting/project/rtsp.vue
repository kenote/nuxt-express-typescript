<template>
  <page>
    <breadcrumb :channel="selectedChannel" :route="$route" />

    <project-screen :show-submit="showSubmit" :projects="projects" :tag="projectTag" @change="value => projectTag = value">
      <template v-if="mode === 'edit'">
        
      </template>
      <template v-else-if="mode === 'list'">
        
        <project-setting-rtsp-list
          :data="teams"
          :tag="projectTag"
          :rtsps="rtsps[projectTag] || []"
          :pagination="pagination" 
          :pageno="pageno" 
          @submit="handleSubmit"
          :loading="loading">

        </project-setting-rtsp-list>
      </template>
      <template slot="baseinfo">
        
      </template>
    </project-screen>
  </page>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, namespace, Watch } from 'nuxt-property-decorator'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'
import { KenoteConfig, Maps } from 'kenote-config-helper'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { responseDocument as responseTeamDocument } from '@/types/proxys/team'
import httpClient from '@/utils/http'
import { HeaderOptions, resufulInfo } from '@/types/resuful'
import projectScreen from '~/components/project/screen.vue'
import projectSettingRtspList from '~/components/project/setting/rtsp-list.vue'
import { orderBy } from 'lodash'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    projectScreen,
    projectSettingRtspList
  },
  created () {
    let self: R = this as R 
    let projects: KenoteConfig.Channel[] = self.channels.filter( o => o.id > 1000 )
    self.projects = orderBy(projects, ['id'], ['asc'])
    setTimeout(() => {
      self.showSubmit = true
    }, 1500)
  },
})
export default class R extends Vue {

  @Setting.State rtsps!: Maps<string[]>
  @Setting.State channels!: KenoteConfig.Channel[]
  @Setting.Getter selectedChannel!: KenoteConfig.Channel
  @Auth.State token!: string
  @Auth.State user!: responseUserDocument

  @Provide() showSubmit: boolean = false
  @Provide() projects: KenoteConfig.Channel[] = []
  @Provide() projectTag: string = ''
  @Provide() mode: 'list' | 'edit' = 'list'
  @Provide() loading: boolean = false
  @Provide() teams: responseTeamDocument[] = []
  @Provide() pageno: number = 1
  @Provide() pagination: boolean = false

  @Watch('projectTag')
  onProjectTagChange (val: string, oldVal: string): void {
    let project: KenoteConfig.Channel = this.projects.find( o => o.label === val ) as KenoteConfig.Channel
    // this.projectOptions = oc(project).options({})
    this.handleGetList()
  }

  handleGetList (name?: string): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.get(`/api/v1/ucenter/team/list/${this.projectTag}`, {}, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.teams = result.data
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleSubmit (_id: string, values: any): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.put(`/api/v1/ucenter/team/rtsps/${_id}`, values, options)
        this.loading = false
        if (result.Status.code === 0) {
          
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  // handleProjectChange (value) {
  //   this.projectTag = value
  // }
  
}
</script>