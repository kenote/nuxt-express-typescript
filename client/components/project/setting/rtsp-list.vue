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
      <el-table-column label="团队名称" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="线路" width="240">
        <template slot-scope="scope">
          <el-select v-model="values[scope.row._id]" multiple filterable collapse-tags size="small" @change="handleSubmit(scope.$index, scope.row)">
            <el-option v-for="(rtsp, key) in rtsps" :key="key" :label="rtsp" :value="rtsp"></el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column > </el-table-column>
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
import { responseDocument as responseTeamDocument } from '@/types/proxys/team'
import { chunk } from 'lodash'
import { oc } from 'ts-optchain'

@Component({
  name: 'project-setting-rtsp-list'
})
export default class  extends Vue {
  
  @Prop({ default: undefined }) data!: responseTeamDocument[]
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: 10 }) pagesize!: number
  @Prop({ default: true }) pagination!: boolean
  @Prop({ default: 1 }) pageno!: number
  @Prop({ default: [] }) rtsps!: string[]
  @Prop({ default: undefined }) tag!: string

  @Provide() current: number = 1
  @Provide() total: number = 0
  @Provide() pdata: responseTeamDocument[] = []
  @Provide() search: string = ''
  @Provide() values: any = {}

  @Watch('data')
  onDataChange (val: responseTeamDocument[], oldVal: responseTeamDocument[]): void {
    this.total = val.length
    let values: any = {}
    for (let item of val) {
      values[item._id] = oc(item).rtsps[this.tag]([])
    }
    this.values = values
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
    let _data: responseTeamDocument[] = this.data.filter( o => new RegExp(this.search).test(o.name) )
    this.total = _data.length
    if (this.pagination) {
      this.pdata = chunk(_data, this.pagesize)[page-1]
    }
    else {
      this.pdata = _data || []
    }
  }

  handleSubmit (index: number, row: responseTeamDocument): void {
    this.$emit('submit', row._id, { channel: this.tag, rtsps: oc(this.values)[row._id]([]) })
  }
}
</script>