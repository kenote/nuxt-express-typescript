<template>
  <div>
    <ve-line :set-option-opts="false" 
      :data="chartData" 
      :data-zoom="chartDataZoom" 
      :settings="chartSettings"
      :toolbox="chartToolbox"
      :loading="loading">
    </ve-line>

    <div class="baseinfo" >
      <div class="submit-box" v-bind:class="showSubmit ? 'is-show' : ''">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Watch } from 'nuxt-property-decorator'
import { Columns, KeyMap } from 'kenote-config-helper'
import { Charts } from 'kenote-config-helper/types/navigation'
import VeLine from 'v-charts/lib/line'
import VeHistogram from 'v-charts/lib/histogram'
import 'echarts/lib/component/dataZoom'
import 'echarts/lib/component/toolbox'
import { formatString } from '@/utils'
import { last, clone, map } from 'lodash'

interface Data {
  id           : string, 
  title        : string, 
  data         : Array<{}>
}

@Component({
  name: 'project-result-charts',
  components: {
    VeLine,
    VeHistogram
  }
})
export default class R extends Vue {

  @Prop({ default: [] }) data!: Data[]
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: [] }) columns!: Columns[]
  @Prop({ default: undefined }) options!: Charts
  @Prop({ default: 1 }) step!: number

  @Provide() chartData: { columns: string[], rows: Array<{}> } = { columns: [], rows: [] }
  @Provide() rowIndex: KeyMap<string> = { key: '', name: '' }
  @Provide() showSubmit: boolean = false
  @Provide() chartSettings: any = {
    //showDataZoom: true,
    //area: true,
    metrics: []
  }
  @Provide() chartDataZoom: any = [{ type: 'slider', start: 0, end: 100 }]
  @Provide() chartToolbox: any = {
    feature: {
      magicType: { type: ['line', 'bar'] },
      saveAsImage: {}
    }
  }

  @Watch('data')
  onDataChange (val: Data[], oldVal: Data): void {
    let rowIndex: KeyMap<string> = this.rowIndex
    let options: Charts = this.options || {}
    let columns: string[] = map(val, 'title')
    this.chartData.columns = [rowIndex.key].concat(columns)
    this.handleInitialize()
    if (columns.length === 0) return
    this.chartSettings.metrics = columns
    let rows: Array<{}> = this.chartData.rows
    for (let item of val) {
      for (let e of item.data || []) {
        let rowItem: any = rows.find( o => o[rowIndex.key] === e[rowIndex.name])
        if (rowItem) {
          rowItem[item.title] = e[options.prop || 'person']
        }
      }
    }
    this.chartData.rows = rows
    setTimeout(() => {
      this.showSubmit = val.length > 0
    }, 1500)
  }

  @Watch('step')
  onStepChange (val: number, oldVal: number): void {
    let options: Charts = this.options || {}
    this.handleInitialize()
    let rowIndex: KeyMap<string> = this.rowIndex
    let rows: Array<{}> = this.chartData.rows
    for (let item of this.data) {
      for (let e of item.data) {
        let rowItem: any = rows.find( o => o[rowIndex.key] === e[rowIndex.name])
        if (rowItem) {
          rowItem[item.title] = e[options.prop || 'person']
        }
      }
    }
    this.chartData.rows = rows
  }

  handleInitialize (): void {
    let rows: Array<{}> = []
    for (let item of this.columns || []) {
      let { key, name } = item
      this.rowIndex = { key, name }
      if (item.parse) {
        let { begin, end, step } = item.parse as { begin: number, end: number, step: number }
        for (let i: number = begin; i <= end; i = i + this.step) {
          if (item.format) {
            rows.push({ [key]: formatString(i, item.format) })
          }
          else {
            rows.push({ [key]: i })
          }
        }
        let _row: {} = last(rows) || {}
        if (item.format) {
          let _val: string | number = formatString(end, item.format)
          if (_row[key] != _val) {
            rows.push({ [key]: _val })
          }
        }
        else {
          if (_row[key] != end) {
            rows.push({ [key]: end })
          }
        }
      }
      break
    }
    this.chartData.rows = clone(rows)
  }
  
}
</script>