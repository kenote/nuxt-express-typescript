<template>
  <page>
    <breadcrumb :channel="selectedChannel" :route="$route" />
    
    <div ></div>
    <!-- 多项查询器 -->
    <template v-if="pageSetting.querySelect">
      <el-tabs type="card" v-model="label">
        <el-tab-pane v-for="item in pageSetting.querySelect.options" :key="item.key" :label="item.name" :name="item.key">
          <project-queryer :key="item.key" :ref="`theQueryer.${item.key}`"
            :queryer="item.queryer"
            :options="selectedChannel.options" 
            :rtsps="getRtsps(user, selectedChannel.label, rtsps, oc(pageSetting).options.rtsps())"
            :ditchs="ditchs"
            :submit-options="item.submit || {}"
            :auto-submit="pageSetting.created && pageSetting.created === 'submit'"
            @get-ditchs="handleGetDitchs"
            @fetch-data="handleFetchData"
            @submit="handleSubmit"
            :loading="loading" >

          </project-queryer>
        </el-tab-pane>
      </el-tabs>
    </template>
    <!-- 查询器 -->
    <project-queryer ref="theQueryer" v-else-if="pageSetting.queryer"
      :queryer="pageSetting.queryer"
      :options="selectedChannel.options" 
      :rtsps="getRtsps(user, selectedChannel.label, rtsps, oc(pageSetting).options.rtsps())"
      :ditchs="ditchs"
      :submit-options="pageSetting.submit"
      :auto-submit="pageSetting.created && pageSetting.created === 'submit'"
      :refresh="refresh"
      @get-ditchs="handleGetDitchs"
      @fetch-data="handleFetchData"
      @submit="handleSubmit"
      :loading="loading" >

    </project-queryer>

    <!-- 结果展示 -->
    <!-- 卡片模式 -->
    <project-result-cards v-if="pageSetting.cards"
      :data="data"
      :options="pageSetting.cards"
      :columns="pageSetting.columns || []"
      @fetch-data="handleFetchData"
      @update-data="handleUpdateData"
      :loading="loading">

    </project-result-cards>
    <!-- 图表模式 -->
    <project-result-charts v-else-if="pageSetting.charts"
      :data="data"
      :options="pageSetting.charts" 
      :columns="pageSetting.columns || []" 
      :step="currentStep"
      :loading="loading">
      <span>图表步进：</span>
      <el-select v-model="currentStep" @change="handleChangeStep">
        <el-option v-for="(item, key) in steps" :key="key" :label="item.name" :value="item.key"></el-option>
      </el-select>
    </project-result-charts>
    <!--  -->
    <div v-else-if="messageResult" />
    <!-- 多表模式 -->
    <template v-else-if="pageSetting.multiTable">
      <template v-for="(item, key) in pageSetting.multiTable" >
        <project-result-cards :key="key" v-if="item.type === 'card'"
          :data="data[key]"
          :options="item.options"
          :columns="item.columns || []"
          @fetch-data="handleFetchData"
          @update-data="handleUpdateData"
          :loading="loading">
        </project-result-cards>
        <project-result-table :key="key" v-else
          :data="data[key]"
          :columns="item.columns || []" 
          @update-data="handleUpdateData"
          :loading="loading">
        </project-result-table>
      </template>
    </template>
    <!-- 表格模式 -->
    <project-result-table v-else
      :data="data"
      :columns="pageSetting.columns || []" 
      :pagination="pagination" 
      :pageno="pageno" 
      :search-options="pageSetting.search"
      @update-data="handleUpdateData"
      :loading="loading">


      <template v-if="pageSetting.emits">
        <template v-for="item in pageSetting.emits">
          <el-button :key="item.key" type="primary" style="margin-left:15px" @click="handleEmit(item)">{{ item.name }}</el-button>
        </template>
      </template>

    </project-result-table>

    <!-- 弹窗 -->
    <el-dialog v-if="dialog.visible" 
      :title="dialog.title"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      :visible="dialog.visible"
      @close="handleDialogColse">
      <project-queryer ref="theQueryer"
        :queryer="dialog.queryer || []"
        :options="selectedChannel.options"
        :rtsps="getRtsps(user, selectedChannel.label, rtsps, oc(pageSetting).options.rtsps())"
        :submit-options="dialog.options"
        :ditchs="ditchs"
        @get-ditchs="handleGetDitchs"
        @fetch-data="handleFetchData"
        @submit="handleSubmitDialog"
        :loading="loading" >

      </project-queryer>
    </el-dialog>
  </page>
</template>

<script lang="ts">
import { Component, Vue, Provide, namespace } from 'nuxt-property-decorator'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'
import { Channel, KenoteConfig, Navigation, Queryer, QuerySelect, Submit, Fetch, ColumnEmit, Maps, KeyMap } from 'kenote-config-helper';
import httpClient from '@/utils/http'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { responseDocument as responseDitchDocument } from '@/types/proxys/ditch'
import projectQueryer from '~/components/project/queryer.vue'
import projectResultTable from '~/components/project/result/table.vue'
import projectResultCards from '~/components/project/result/cards.vue'
import projectResultCharts from '~/components/project/result/charts.vue'
import { HeaderOptions, resufulInfo } from '@/types/resuful'
import { QuerySelectOption } from 'kenote-config-helper/types/queryselect'
import { CDTimeStore } from '@/types'
import { oc } from 'ts-optchain'
import { isString, set, map } from 'lodash'
import { KenoteConfigColumnEmit } from 'kenote-config-helper/types/emit'
import { Rstps } from 'kenote-config-helper/types/submit'
import { getRtsps } from '@/utils/user'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

interface dialogOptions {
  title      ?: string
  queryer    ?: Queryer[]
  options    ?: Maps<string | number> | KeyMap<string | number>[]
  api        ?: string
  visible     : boolean
}



@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    projectQueryer,
    projectResultTable,
    projectResultCards,
    projectResultCharts
  },
  created () {
    let self: R = this as R
    self.pagekey = self.$route.path
    let { date, value } = self.cdtime(self.$route.path)
    let times: number = value - (new Date().getTime() - date.getTime()) / 1000
    self.times = times >= 0 ? ~~times : 0
  },
  mounted () {
    let self: R = this as R
    if (!self.selectedChannel) return
    let channelStore: Channel = new Channel(self.selectedChannel)
    let pageSetting: Navigation | undefined = channelStore.find(self.$route.path)
    if (!pageSetting) return
    // console.log(map(self.user.teams, `rtsps.${self.selectedChannel.label}`))
    
    // console.log(getRtsps(self.user, self.selectedChannel.label, self.rtsps, oc(pageSetting).options.rtsps()))
    self.pageSetting = pageSetting
    // console.log(pageSetting)
    if (pageSetting.charts) {
      self.steps = pageSetting.charts.step || []
      self.currentStep = oc(pageSetting).columns[0].parse['step']()
    }
    if (pageSetting.querySelect) {
      let { default: label } = pageSetting.querySelect
      self.label = label
      self.messageResult = self.isMessageResult(label)
    }
    else {
      self.messageResult = self.isMessageResult()
    }
  },
  beforeDestroy () {
    let self: R = this as R
    let { name, types } = setting
    this.$store.commit(`${name}/${types.CDTIME}`, {
      key     : self.pagekey,
      value   : self.times
    })
  }
})
export default class R extends Vue {

  @Setting.Getter rtsps!: string[]
  @Setting.Getter selectedChannel!: KenoteConfig.Channel
  @Setting.Getter cdtime!: (key: any) => CDTimeStore
  @Auth.State user!: responseUserDocument
  @Auth.State token!: string

  @Provide() pageSetting: Navigation = { index: '-1', name: '' }
  @Provide() loading: boolean = false
  @Provide() data: any[] = []
  @Provide() ditchLoading: boolean = false
  @Provide() ditchs: responseDitchDocument[] = []
  @Provide() polling: boolean = false
  @Provide() times: number = 0
  @Provide() refresh: boolean = false
  @Provide() pageno: number = 1
  @Provide() pagekey: string = ''
  @Provide() label: string | undefined = undefined
  @Provide() pagination: boolean = true
  @Provide() steps: Array<{}> = []
  @Provide() currentStep: number = 1
  @Provide() messageResult: boolean | undefined = false

  @Provide() dialog: dialogOptions = { visible: false }

  getRtsps = getRtsps
  oc = oc

  handleChangeStep (value: number): void {
    this.currentStep = value
  }

  handleEmit (item: ColumnEmit): void {
    let { queryer, options, api } = item
    if (queryer) {
      // this.visible = true
      // this.emitItem = item
      this.dialog = {
        title: item.name,
        queryer,
        options,
        api,
        visible: true
      }
    }
  }

  handleDialogColse (): void {
    this.dialog = { 
      title: undefined, 
      queryer: undefined, 
      options: undefined, 
      api: undefined, 
      visible: false 
    }
  }

  handleGetDitchs (next?: (doc: any) => void): void {
    this.ditchLoading = true
    let channel: string = this.selectedChannel.label
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.get(`/api/v1/ditch/${channel}`, {}, options)
        this.ditchLoading = false
        if (result.Status.code === 0) {
          if (next) {
            return next(result.data)
          }
          else {
            this.ditchs = result.data
            return
          }
          
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.ditchLoading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  async handleFetchData (fetch: Fetch | string, next: (doc: any) => void): Promise<void> {
    if (!fetch) return next(null)
    let url: string = isString(fetch) ? fetch : fetch.api
    try {
      let options: HeaderOptions = {
        token: this.token
      }
      let result: resufulInfo = await httpClient.get(url, {}, options)
      if (result.Status.code === 0) {
        return next(result.data)
      }
      this.$message.warning(result.Status.message!)
    } catch (error) {
      // this.$message.warning('error.message')
    }
  }

  handleUpdateData (api: string, values: any, current: number = 1) {
    let queryer: projectQueryer = this.$refs['theQueryer'] as projectQueryer
    if (oc(queryer).values.otherInfo()) {
      values['hallId'] = queryer.values.otherInfo
    }
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(api, values, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.$message.success('信息已提交！')
          this.handleRefresh(current)
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleRefresh (current: number = 1): void {
    this.refresh = true
    this.$emit('pageno', current)
  }

  async handleSubmit (values: any, rtspsOptions: Rstps, refresh: boolean = false): Promise<void> {
    let { polling, querySelect } = this.pageSetting
    let queryer: Queryer[] | undefined = this.pageSetting.queryer
    this.refresh = false
    if (!refresh) this.pageno = 1
    if (querySelect) {
      let { options } = querySelect
      let querySelectOption: QuerySelectOption | undefined = options.find( o => o.key === this.label)
      if (querySelectOption) {
        queryer = querySelectOption.queryer
      }
    }

    // 正常提交
    this.submitValues(values, rtspsOptions)
  }

  submitValues (values: any, rtspsOptions: Rstps): void {
    let { value, params } = rtspsOptions
    let [ type, field ] = params.split(':')
    let rtspOptions: Maps<string> = {
      [field]: value
    }
    this.loading = true
    this.data = []
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        if (type === 'headers') {
          options.header = { ...options.header, ...rtspOptions }
        }
        else {
          values = { ...values, ...rtspOptions }
        }
        let result: resufulInfo = await httpClient.post(this.pageSetting.api!, values, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.handleCDTimes()
          if (this.isMessageResult()) {
            let { querySelect, submit } = this.pageSetting
            let message: string | undefined = oc(submit).message()
            if (querySelect) {
              let item: QuerySelectOption | undefined = querySelect.options.find( o => o.key === this.label )
              message = oc(item).submit.message()
              this.$refs[`theQueryer.${oc(item).key()}`]['resetForm']()
            }
            else {
              this.$refs['theQueryer']['resetForm']()
            }
            this.$message.success(message || '信息已发送！')
          }
          else {
            if (this.pageSetting.charts) {
              this.data = [
                {
                  id: this.pageSetting.index,
                  title: this.pageSetting.name,
                  data: result.data['data']
                }
              ]
            }
            else {
              this.data = result.data['data']
            }
            
          }
          this.$once('pageno', pageno => {
            this.pageno = pageno
          })
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleSubmitDialog (values: any): void {
    console.log(values, this.dialog.api)
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(this.dialog.api!, values, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.handleDialogColse()
          this.handleRefresh(1)
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleCDTimes (initial: boolean = false): void {
    if (!this.pageSetting.cdtimes) return
    if (!initial) this.times = this.pageSetting.cdtimes
    if (this.times <= 0) return
    let timer: NodeJS.Timeout | number | null = setInterval(() => {
      this.times --
      if (this.times <= 0) {
        clearInterval(<NodeJS.Timeout> timer)
        timer = null
      }
    }, 1000)
  }

  isMessageResult (label?: string): boolean {
    let { querySelect, submit } = this.pageSetting
    if (querySelect) {
      let item: QuerySelectOption | undefined = querySelect.options.find( o => o.key === label )
      return oc(item).submit.result() === 'message'
    }
    return oc(submit).result() === 'message'
  }
  
}
</script>