<template>
  <div>
    <el-table ref="filterTable" stripe
      :data="pdata"
      v-loading="loading">
      <el-table-column label="ID" width="80" fixed sortable prop="id" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标签" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.label }}</span>
        </template>
      </el-table-column>
      <el-table-column label="基数" v-if="!!(options.fields || []).find( o => /^(cardinal_number)\./.test(o) )">
        <template slot-scope="scope">
          <span>{{ scope.row.cardinal_number }}</span>
        </template>
      </el-table-column>
      <el-table-column v-else ></el-table-column>
      <el-table-column  width="240" fixed="right">
        <template slot="header" slot-scope="scope">
          <el-input
            :key="scope.$index"
            v-model="search"
            size="small"
            placeholder="输入关键字搜索"/>
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
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Watch } from 'nuxt-property-decorator'
import { responseDocument as responseDitchDocument } from '@/types/proxys/ditch'
import { Table as ElTable } from 'element-ui'
import { chunk } from 'lodash'
import { Maps } from 'kenote-config-helper'

@Component({
  name: 'project-setting-ditch-list'
})
export default class  extends Vue {

  @Prop({ default: undefined }) data!: responseDitchDocument[]
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: {} }) options!: Maps<any>
  // @Prop({ default: [] }) columns!: Columns[]
  @Prop({ default: 10 }) pagesize!: number
  @Prop({ default: true }) pagination!: boolean
  @Prop({ default: 1 }) pageno!: number

  @Provide() current: number = 1
  @Provide() total: number = 0
  @Provide() pdata: responseDitchDocument[] = []
  @Provide() search: string = ''

  @Watch('data')
  onDataChange (val: responseDitchDocument[], oldVal: responseDitchDocument[]): void {
    this.total = val.length
    // let theTable: ElTable = <ElTable> this.$refs['filterTable']
    // theTable.clearFilter()
    this.handleCurrentChange(this.pageno)
  }

  @Watch('pageno')
  onPagenoChange (val: number, oldVal: number): void {
    this.handleCurrentChange(val)
  }

  @Watch('search')
  onSearchChange (val: string, oldVal: string): void {
    this.handleCurrentChange(this.pageno)
  }

  handleCurrentChange (page: number): void {
    this.current = page
    let _data: responseDitchDocument[] = this.data.filter( o => new RegExp(this.search).test(o.name) )
    this.total = _data.length
    if (this.pagination) {
      this.pdata = chunk(_data, this.pagesize)[page-1]
    }
    else {
      this.pdata = _data || []
    }
  }



}
</script>