<template>
  <div>
    <el-table 
      :data="data.filter(doc => !search || doc.name.toLowerCase().includes(search.toLowerCase()))" 
      stripe 
      v-loading="loading" 
      @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        width="35">
      </el-table-column>
      <el-table-column label="ID" width="80" fixed sortable prop="id" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" width="150">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="cdKey" width="320">
        <template slot-scope="scope">
          <span>{{ scope.row.cdkey }}</span>
        </template>
      </el-table-column>
      <el-table-column label="使用次数" width="80" align="center">
        <template slot-scope="scope">
          <el-tooltip content="已使用 / 总次数" placement="top">
            <span>{{ scope.row.uses }} / {{ scope.row.stint }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="过期时间" width="160">
        <template slot-scope="scope">
          <span>{{ dateFormat(scope.row.last_at) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="过期状态" 
        width="100" 
        prop="last_at" 
        fixed="right" 
        :filters="[{ text: '已过期', value: true }, { text: '未过期', value: false }]" 
        :filter-method="filterExpired">
        <template slot-scope="scope">
          <el-tag v-if="isExpired(scope.row.last_at)" type="danger">已过期</el-tag>
          <el-tag v-else type="successs">未过期</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="使用状态" 
        width="100" 
        prop="used" 
        fixed="right" 
        :filters="[{ text: '已使用', value: true }, { text: '可使用', value: false }]" 
        :filter-method="filterUsed">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.used || isExpired(scope.row.last_at)" type="info">已使用</el-tag>
          <el-tag v-else type="successs">可使用</el-tag>
        </template>
      </el-table-column>
      <el-table-column  width="240" fixed="right">
        <template slot="header" slot-scope="scope">
          <el-input
            :key="scope.$index"
            v-model="search"
            size="small"
            placeholder="输入关键字搜索"/>
        </template>
        <template slot-scope="scope">
          <div style="text-align: right; padding-right: 12px;">
            <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="baseinfo" >
      <div class="submit-box" v-bind:class="showSubmit ? 'is-show' : ''">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'nuxt-property-decorator'
import { responseDocument as responseTicketDocument } from '@/types/proxys/ticket'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { responseDocument as responseGroupDocument } from '@/types/proxys/group'
import dayjs from 'dayjs'

@Component({
  name: 'ucenter-ticket-list',
  created () {
    let self: R = this as R
    self.handleList()
    setTimeout(() => {
      self.showSubmit = true
    }, 1500)
  }
})
export default class R extends Vue {

  @Prop({ default: [] }) data!: responseTicketDocument[]
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: null }) auth!: responseUserDocument | null

  @Provide() search: string = ''
  @Provide() showSubmit: boolean = false
  @Provide() groups: responseGroupDocument[] = []

  handleList (): void {
    this.$emit('getlist', null)
  }

  handleDelete (index: number, row: responseTicketDocument): void {
    this.$confirm('此操作将永久删除该邀请码, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      this.$emit('remove', index, row)
    }).catch(() => {
      this.$message({
        type: 'info',
        message: '已取消删除'
      })         
    })
  }

  handleSelectionChange (values: responseTicketDocument[]): void {
    this.$emit('selection', values)
  }

  dateFormat (date: any): string {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
  }

  isExpired (date: any): boolean {
    return new Date(date).getTime() <= Date.now()
  }

  filterExpired (value: boolean, row: responseTicketDocument): boolean {
    let expired: boolean = new Date(row.last_at).getTime() <= Date.now()
    return expired === value
  }

  filterUsed (value: boolean, row: responseTicketDocument): boolean {
    return (row.used || this.isExpired(row.last_at)) === value
  }
  
}
</script>