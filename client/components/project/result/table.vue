<template>
  <div>
    <!-- 表格 -->
    <el-table ref="filterTable" stripe
      :data="pdata"
      @filter-change="handleFilterChange"
      v-loading="loading">
      <el-table-column v-for="(column, key) in columns" :key="key"
        :label="column.name" 
        :prop="column.key" 
        :fixed="column.fixed" 
        :width="column.width" 
        :min-width="column.minwidth || 100" 
        :filters="column.filters"
        :filter-multiple="column.filterMulti"
        :filter-method="undefined"
        :align="column.align || 'center'" >
        <template slot="header" slot-scope="scope">
          <el-input v-if="column.key === 'actions' && (searchOptions && searchOptions.field)"
            :key="scope.$index"
            v-model="search"
            size="small"
            :placeholder="`输入关键字搜索`"/>
          <span v-else>{{ column.name }}</span>
        </template>
        <template slot-scope="scope">
          <template v-if="column.emit">
            <template v-if="Array.isArray(column.emit)">
              <template v-for="item in column.emit">
                <el-button type="text" :key="item.key" @click="handleEmitClick(item, scope.row)">{{ item.name }}</el-button>
              </template>
            </template>
            <template v-else>
              <template v-if="!column.emit.options.map( o => o.key ).includes(scope.row[column.key])">
                <el-dropdown @command="handleEmitCommand">
                  <span v-if="column.format" class="el-dropdown-link">
                    {{ formatString(scope.row[column.key], column.format) }}<i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                  <span v-else class="el-dropdown-link">
                    {{ scope.row[column.key] }}<i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item v-for="item in column.emit.options" :key="item.key" :command="{ emit: column.emit, row: scope.row, value: item.key }">{{ item.name }}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </template>
              <span v-else-if="column.format">{{ formatString(scope.row[column.key], column.format) }}</span>
              <span v-else>{{ scope.row[column.key] }}</span>
            </template>
          </template>
          <span v-else-if="column.format">{{ formatString(scope.row[column.key], column.format) }}</span>
          <span v-else>{{ column.filterMulti === false ? filterName(scope.row, column.key) : scope.row[column.key] }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页模块 -->
    <el-pagination v-if="total > pagesize && pagination"
      background
      @current-change="handleCurrentChange"
      :current-page="current"
      :page-size="pagesize"
      layout="total, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    <!-- 操作栏 -->
    <div class="baseinfo" >
      <div class="submit-box" v-bind:class="showSubmit ? 'is-show' : ''">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Watch } from 'nuxt-property-decorator'
import { Maps, Columns, ColumnEmit } from 'kenote-config-helper'
import { chunk, pick, isArray } from 'lodash';
import { Search } from 'kenote-config-helper/types/navigation'
import { formatString } from '@/utils'
import { oc } from 'ts-optchain'
import * as nunjucks from 'nunjucks'
import { Table as ElTable } from 'element-ui'

@Component({
  name: 'project-result-table'
})
export default class R extends Vue {

  @Prop({ default: undefined }) data!: Maps<any>[]
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: [] }) columns!: Columns[]
  @Prop({ default: 10 }) pagesize!: number
  @Prop({ default: true }) pagination!: boolean
  @Prop({ default: 1 }) pageno!: number
  @Prop({ default: undefined }) searchOptions!: Search
  @Prop({ default: true }) isShowSubmit!: boolean

  @Provide() current: number = 1
  @Provide() total: number = 0
  @Provide() search: string = ''
  @Provide() pdata: Maps<any>[] = []
  @Provide() showSubmit: boolean = false
  @Provide() filters: Maps<string> = {}

  @Watch('data')
  onDataChange (val: Maps<any>[], oldVal: Maps<any>[]): void {
    this.total = val.length
    this.filters = {}
    let theTable: ElTable = <ElTable> this.$refs['filterTable']
    theTable.clearFilter()
    this.handleCurrentChange(this.pageno)
    this.isShowSubmit && setTimeout(() => {
      this.showSubmit = true //val.length > 0
    }, 1500)
  }

  @Watch('pagination')
  onPaginationChange (val: boolean, oldVal: boolean): void {
    if (val) this.search = ''
    this.handleCurrentChange(1)
  }

  @Watch('pageno')
  onPagenoChange (val: number, oldVal: number): void {
    this.handleCurrentChange(val)
  }

  @Watch('search')
  onSearchChange (val: string, oldVal: string): void {
    this.handleCurrentChange(this.pageno)
  }

  formatString = formatString

  handleCurrentChange (page: number): void {
    this.current = page
    let _data: Maps<any>[] = this.data
    try {
      let key: string = oc(this.searchOptions).field('key')
      _data = this.data.filter( o => new RegExp(this.search).test(String(o[key])) )
    } catch (error) {
      
    }
    this.total = _data.length
    if (this.pagination) {
      this.pdata = chunk(_data, this.pagesize)[page-1]
    }
    else {
      this.pdata = _data || []
    }
  }

  handleEmitCommand (command: { emit: ColumnEmit, row: any, value: string | number }): void {
    let { emit, row, value } = command
    let options: any = { ...pick(row, emit.param as string[]), [emit.key]: value }
    this.$confirm('执行该操作, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      this.$emit('update-data', emit.api, options, this.current)
    }).catch(() => {
      this.$message({
        type: 'info',
        message: '已取消操作'
      })         
    })
  }

  handleEmitClick (emit: ColumnEmit, row: any): void {
    let { options } = emit
    if (options) {
      let messagebox: Maps<any> = oc(options)['messagebox']()
      let param: string = oc(options)['param']()
      if (messagebox) {
        this.$confirm(messagebox.content || '执行该操作, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let values: Maps<string> = JSON.parse(nunjucks.renderString(param, row))
          this.$emit('update-data', emit.api, values, this.current)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消操作'
          })         
        })
      }
    }
  }

  handleFilterChange (value: Maps<string[]>): void {
    for (let key in value) {
      let val: string = value[key].toString()
      let [ field, param ] = val.split('|')
      this.filters = {
        ...this.filters,
        [field]: param
      }
      return
    }
  }

  filterName (row: any, field: string): string {
    let value = row[field] || {}
    let key: string = this.filters[field]
    return value[key] || '--'
  }
  
}
</script>