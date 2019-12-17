<template>
  <div>
    <el-row :gutter="20" v-loading="loading">
      <el-col :span="8" v-for="(col, key) in data" :key="key">
        <el-card v-if="options && options.type === 'user-info'">
          <div slot="header" class="clearfix">
            <span v-if="columns.find( o => o.key === col.name )">{{ columns.find( o => o.key === col.name ).name }}</span>
            <span v-else>{{ col.name }}</span>
            <card-edit 
              :column="columns.find( o => o.key === col.name )" 
              :iscancel="emitItem.key === 'edit' && edited == col.name"
              @uemit="handleUemit"
              style="float: right;">

            </card-edit>
          </div>
          <div style="min-height: 50px">
            <div v-if="emitItem.key === 'edit' && edited == col.name">
              <card-form :uemit="emitItem" :value="col.value" @submit="handleSubmitEdit">
                
                
              </card-form>
            </div>
            <el-button v-else-if="/^(\{)/.test(col.value)" 
              size="small" 
              type="success" plain 
              @click="handleDialogData(col.name, col.value, oc(columns.find( o => o.key === col.name )).columns())">点击查看</el-button>
            <span v-else style="font-size:23px;font-weigth:500;">{{ formatString(col.value, columns.find( o => o.key === col.name )) }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 弹窗 -->
    <el-dialog v-if="dialog.visible" 
      :title="dialog.title" 
      width="80%"
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      :visible="dialog.visible"
      @close="handleDialogColse">
      <card-table :data="dialog.data" :columns="dialog.columns" :fetchData="fetchData" @submit="handleSubmitEdit" />
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Watch } from 'nuxt-property-decorator'
import { Cards } from 'kenote-config-helper/types/navigation'
import { Columns, ColumnEmit, Queryer, Maps } from 'kenote-config-helper'
import { formatString } from '@/utils'
import cardEdit from './card/edit.vue'
import cardForm from './card/form.vue'
import cardTable from './card/table.vue'
import { oc } from 'ts-optchain'

interface dialogOptions {
  title      ?: string
  data       ?: string
  columns    ?: Columns[]
  visible     : boolean
}

@Component({
  name: 'project-result-cards',
  components: {
    cardEdit,
    cardForm,
    cardTable
  },
  created () {
    let self: R = this as R 
    let { fetch } = self.options
    if (fetch) {
      for (let key in fetch) {
        let queryer: Queryer = {
          key,
          type: 'none',
          name: key,
          fetch: { api: fetch[key] as string, param: '' }
        }
        self.$emit('fetch-data', queryer, (data: Maps<string>): void => {
          self.fetchData[key] = data
        })
      }
    }
  }
})
export default class R extends Vue {
  
  @Prop({ default: [] }) data!: any[]
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: undefined }) options!: Cards
  @Prop({ default: [] }) columns!: Columns[]

  @Provide() edited: string = ''
  @Provide() emitItem: ColumnEmit = { key: '', name: '', api: '' }
  @Provide() dialog: dialogOptions = { visible: false }
  @Provide() fetchData: Maps<any> = {}

  @Watch('data')
  onDataChange (val: Array<{}>, oldVal: Array<{}>): void {
    this.edited = ''
    this.emitItem = { key: '', name: '', api: '' }
    this.handleDialogColse()
  }

  oc = oc

  async handleUemit (uemit: ColumnEmit, key: string): Promise<void> {
    if (key === this.edited) {
      this.edited = ''
      this.emitItem = { key: '', name: '', api: '' }
      return
    }
    this.edited = key
    this.emitItem = uemit
    if (uemit.key != 'edit') {
      let { key: k, param } = this.options.emit || { key: '用户id', param: 'roleId' }
      let obj: { name: string, value: string } = <{ name: string, value: string }> this.data.find( o => o.name === k )
      let _values: {} = {
        [param]: obj.value,
        ...uemit.options
      }
      console.log(_values)
      this.$emit('update-data', uemit.api, _values)
    }
  }

  async handleSubmitEdit (values: any, api: string): Promise<void> {
    let { key, param } = this.options.emit || { key: '用户id', param: 'roleId' }
    let obj: { name: string, value: string } = <{ name: string, value: string }> this.data.find( o => o.name === key ) 
    let _values: {} = {
      ...values,
      [param]: obj.value
    }
    this.$emit('update-data', api, _values)
  }

  formatString (value: string | number, column?: Columns): string | number {
    if (!column) return String(value)
    return formatString(value, column.format)
  }

  handleDialogData (title: string, data: string, columns?: Columns[]): void {
    this.dialog = { title, data: data, visible: true, columns }
  }

  handleDialogColse (): void {
    this.dialog = { title: undefined, data: undefined, visible: false }
  }
}
</script>

<style lang="scss">
  .el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
    margin-bottom: 20px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
</style>