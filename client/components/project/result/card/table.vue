<template>
  <div>
    <el-table :data="parseData(data, columns)" height="480" stripe>
      <el-table-column  v-for="(column, key) in columns"
        :key="key"
        :label="column.name"
        :prop="column.key" 
        :fixed="column.fixed" 
        :width="column.width" 
        :min-width="column.minwidth || 100" 
        :align="column.align || 'center'" >
        <template slot-scope="scope">
          <template v-if="column.emit && column.emit.find( o => o.key === 'edit' )">
            <el-button v-if="column.parse" type="text" @click="handleEditView(scope.row, column)">{{ parseMapString(scope.row[column.key], parseSetting(column.parse)) }}</el-button>
            <el-button v-else type="text" @click="handleEditView(scope.row, column)">{{ scope.row[column.key] }}</el-button>
          </template>
          <template v-else>
            <span v-if="column.parse">{{ parseMapString(scope.row[column.key], parseSetting(column.parse)) }}</span>
            <span v-else>{{ scope.row[column.key] }}</span>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗 -->
    <el-dialog v-if="dialog.visible" 
      :title="dialog.title" 
      :close-on-click-modal="false"
      :modal="false"
      :visible="dialog.visible"
      @close="handleDialogColse">
      <dialog-form type="dialog" :uemit="dialog.uemit" :fetchData="fetchData" :value="dialog.data" @submit="handleSubmit" />
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'nuxt-property-decorator'
import { isString, isObject, map, zipObject } from 'lodash'
import { Columns, Maps, ColumnEmit } from 'kenote-config-helper'
import { parseMapString } from '@/utils'
import dialogForm from './form.vue'

interface dialogOptions {
  title      ?: string
  data       ?: any
  column     ?: Columns
  uemit      ?: ColumnEmit
  visible     : boolean
}

@Component({
  name: 'card-table',
  components: {
    dialogForm
  },
  created () {
    let self: R = this as R
    // console.log(self.parseData(self.data, self.columns))
    // console.log(parseMapString(eval(`({ "1": 1000, "2": 500 })`), { 1: '武力', 2: '智力'}))
  }
})
export default class R extends Vue {
  
  @Prop({ default: undefined }) data!: string
  @Prop({ default: undefined }) columns!: Columns[]
  @Prop({ default: {} }) fetchData!: Maps<any>

  @Provide() dialog: dialogOptions = { visible: false }

  parseMapString = parseMapString
  isString = isString

  parseData (data: string, columns?: Columns[]): any[] {
    let _data: any = eval(`(${data})`)
    let arr: any[] = []
    for (let key in _data) {
      if (isObject(_data[key])) {
        arr.push(_data[key])
      }
      else {
        let [ k, v ] = map(columns || [], 'key')
        let obj: any = {
          [k]: key,
          [v]: _data[key]
        }
        arr.push(obj)
      }
    }
    return arr
  }

  handleEditView (row: Maps<any>, column: Columns) {
    let { key, emit } = column
    let value: any = row[column.key]
    let emitItem: ColumnEmit | undefined = emit && emit.find( o => o.key === 'edit' )
    if (!emitItem) return
    let data: any = zipObject(map(emitItem['queryer'], 'key'), [row.id || row.item, value])
    this.dialog = { title: emitItem.name, data, visible: true, column, uemit: emitItem }
  }

  handleSubmit (values: any, api: string): void {
    this.$emit('submit', values, api)
  }

  handleDialogColse (): void {
    this.dialog = { title: undefined, data: undefined, visible: false }
  }

  parseSetting (parse: Maps<string> | string): Maps<string> {
    if (isString(parse)) {
      return this.fetchData[parse] || {}
    }
    return parse
  }
}
</script>