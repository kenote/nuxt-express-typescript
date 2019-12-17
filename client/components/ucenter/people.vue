<template>
  <fragment>
    <h2>团队《{{ data.name }}》 -- 成员管理</h2>
    <div class="form-container" v-if="mode === 'invitations'">
      <el-form ref="theForm" :model="values" @submit.native.prevent="submitForm" label-width="150px">
        <el-form-item label="搜索用户">
          <el-input v-model="keywords" placeholder="用户名/电子邮箱/手机号/昵称" style="width:300px;"  @keyup.native="handleKeywordsChange" />
        </el-form-item>
        <el-form-item prop="peoples" label="选择用户">
          <el-transfer 
            filterable
            :filter-method="filterMethod"
            v-model="values.peoples" 
            :titles="['可选用户', '已选用户']"
            :data="users">
          </el-transfer>
        </el-form-item>
        <el-form-item >
          <el-button type="primary" native-type="submit" :loading="loading" :disabled="values.peoples.length === 0">提 交</el-button>
          <el-button type="success" @click="mode = 'list'">返回</el-button>
        </el-form-item>
      </el-form>
    </div>
    <template v-else>
      <el-table ref="filterTable" stripe
        :data="pdata"
        v-loading="loading">
        <el-table-column label="ID" width="80" fixed sortable prop="id" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        <el-table-column label="用户名" width="180">
          <template slot-scope="scope">
            <span>{{ scope.row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column label="昵称" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.nickname || '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="性别" width="80" align="center">
          <template slot-scope="scope">
            <span>{{ sexConfig[scope.row.sex || 0].name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="120" prop="group">
          <template slot-scope="scope">
            <span>{{ scope.row.group.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="电子邮箱" width="240">
          <template slot-scope="scope">
            <span>{{ scope.row.email.replace(/\w{4}@/g, '****@') }}</span>
          </template>
        </el-table-column>
        <el-table-column />
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
              <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)" >移除</el-button>
            </div>
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
    </template>
    <div class="baseinfo" >
      <div class="submit-box" v-bind:class="showSubmit ? 'is-show' : ''">
        <el-button type="primary" @click="handleInvitations">邀请成员</el-button>
        <el-button type="success" @click="handleBack">返回</el-button>
      </div>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Watch } from 'nuxt-property-decorator'
import { responseDocument as responseTeamDocument } from '@/types/proxys/team'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { Form as ElForm } from 'element-ui'
import { ElMessageBoxOptions } from 'element-ui/types/message-box'
import { chunk } from 'lodash'
import { Option } from '@/types'

@Component({
  name: 'ucenter-people',
  created () {
    let self: R = this as R
    self.$emit('get-people', self.data._id, self.handleBackPeoples)
    setTimeout(() => {
      self.showSubmit = true
    }, 1500)
  }
})
export default class R extends Vue {

  @Prop({ default: null }) data!: responseTeamDocument
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: 10 }) pagesize!: number
  @Prop({ default: true }) pagination!: boolean
  @Prop({ default: 1 }) pageno!: number

  @Provide() showSubmit: boolean = false
  @Provide() mode: 'list' | 'invitations' = 'list'
  @Provide() current: number = 1
  @Provide() total: number = 0
  @Provide() pdata: responseUserDocument[] = []
  @Provide() search: string = ''
  @Provide() peoples: responseUserDocument[] = []
  @Provide() sexConfig: Record<number, { name: string }> = {
    0: { name: '未知' },
    1: { name: '男' },
    2: { name: '女' }
  }
  @Provide() values: any = {
    peoples: []
  }
  @Provide() keywordsLoading: boolean = false
  @Provide() keywords: string = ''
  @Provide() users: Option[] = []

  @Watch('peoples')
  onDataChange (val: responseUserDocument[], oldVal: responseUserDocument[]): void {
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

  handleBack (): void {
    this.$emit('goback', null)
  }

  handleBackPeoples (peoples: responseUserDocument[]): void {
    this.peoples = peoples
  }

  handleInvitations (): void {
    this.mode = 'invitations'
  }

  handleCurrentChange (page: number): void {
    this.current = page
    let _data: responseUserDocument[] = this.peoples.filter( o => new RegExp(this.search).test(o.username) )
    this.total = _data.length
    if (this.pagination) {
      this.pdata = chunk(_data, this.pagesize)[page-1]
    }
    else {
      this.pdata = _data || []
    }
  }

  async handleDelete (index: number, row: responseUserDocument): Promise<void> {
    let options: ElMessageBoxOptions = {
      confirmButtonText    : '确定',
      cancelButtonText     : '取消',
      type                 : 'warning'
    }
    try {
      await this.$confirm('此操作将从团队中移除该用户, 是否继续?', '提示', options)
      this.$emit('remove', this.data._id, row._id, this.handleBackSubmit)
    } catch (error) {
      console.log('您已取消操作')
    }
    
  }

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        this.$emit('submit', this.data._id, this.values.peoples, this.handleBackSubmit)
      }
      else {
        return false
      }
    })
  }

  handleBackSubmit (data: any): void {
    this.mode = 'list'
    this.$emit('get-people', this.data._id, this.handleBackPeoples)
  }

  handleKeywordsChange (): void {
    this.$emit('search_keywords', this.keywords, this.handleBackGetKeywordsUsers)
  }

  handleBackGetKeywordsUsers (users: responseUserDocument[]): void {
    let _users: Option[] = users.map( o => ({ key: o._id, label: o.username, disabled: !!this.peoples.find( p => p._id === o._id ) }) )
    this.users = [ ...this.users, ..._users.filter( o => !this.users.map( p => p.key ).includes(o.key)) ]
  }

  filterMethod (query: string, item: Option): boolean {
    return item.label.includes(query)
  }
  
}
</script>