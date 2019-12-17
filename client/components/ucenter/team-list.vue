<template>
  <fragment>
    <el-table :data="data.filter( doc => !search || doc.name.toLowerCase().includes(search.toLowerCase()))" stripe v-loading="loading">
      <el-table-column label="ID" width="80" fixed sortable prop="id" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="团队名称" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="描述" min-width="300" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ scope.row.description || '--' }}</span>
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
            <el-dropdown size="small" @command="handleCommand" split-button @click="handleEdit(scope.$index, scope.row)">
              <span>编辑</span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item :command="`platform:${scope.$index}:${scope.row._id}`">频道入口</el-dropdown-item>
                <el-dropdown-item :command="`access:${scope.$index}:${scope.row._id}`">访问权限</el-dropdown-item>
                <el-dropdown-item :command="`people:${scope.$index}:${scope.row._id}`">成员管理</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
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
    <!-- <el-dialog title="删除用户组" 
      :close-on-click-modal="false"
      :modal-append-to-body="false"
      :visible.sync="dialogFormVisible">
      <el-form v-model="values">
        <el-form-item label="组内成员" label-width="180px">
          <el-radio-group v-model="values.type" size="small">
            <el-radio :label="0" border style="margin-right:10px">删除成员</el-radio>
            <el-radio :label="1" border>移入其他组</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="移入用户组" label-width="180px">
          <el-select v-model="values.move" size="small" :disabled="values.type === 0">
            <el-option v-for="(item, key) in data" :key="key"
              :label="item.name"
              :disabled="selected === item._id || item.level >= 9000"
              :value="item._id">
              <span style="float: left">{{ item.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ item.level }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmitDelete">确 定</el-button>
      </div>
    </el-dialog> -->
  </fragment>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'nuxt-property-decorator'
import { responseDocument as responseTeamDocument } from '@/types/proxys/team'
import { } from 'element-ui'
import { ElMessageBoxOptions } from 'element-ui/types/message-box'
import { oc } from 'ts-optchain'

@Component({
  name: 'ucenter-team-list',
  created () {
    let self: R = this as R
    self.handleList()
    setTimeout(() => {
      self.showSubmit = true
    }, 1500)
  }
})
export default class R extends Vue {

  @Prop({ default: [] }) data!: responseTeamDocument[]
  @Prop({ default: false }) loading!: boolean

  @Provide() search: string = ''
  @Provide() showSubmit: boolean = false
  @Provide() dialogFormVisible: boolean = false
  @Provide() values: any = {
    type: 0,
    move: undefined
  }
  @Provide() selected: string = ''

  handleList (): void {
    this.$emit('getlist', null)
  }

  handleEdit (index: number, row: responseTeamDocument): void {
    this.$emit('edit', index, row)
  }

  async handleDelete (index: number, row: responseTeamDocument): Promise<void> {
    // this.dialogFormVisible = true
    // this.selected = row._id
    // this.values = { type: 0, move: undefined }
    let options: ElMessageBoxOptions = {
      confirmButtonText    : '确定',
      cancelButtonText     : '取消',
      type                 : 'warning'
    }
    try {
      await this.$confirm('此操作将永久删除该团队, 是否继续?', '提示', options)
      this.$emit('remove', row._id)
    } catch (error) {
      console.log('您已取消删除')
    }
  }

  handleSubmitDelete (): void {
    this.dialogFormVisible = false
    let { type, move } = this.values
    let options: any = {}
    if (type === 1) {
      options.move = move
    }
    this.$emit('remove', this.selected, options)
  }

  handleCommand (command: string): void {
    if (!command) return
    let [ type, index, _id ] = command.split(':')
    let row: responseTeamDocument = oc(this.data)([]).find( o => o._id === _id ) as responseTeamDocument
    this.$emit(type, index, row)
  }
  
}
</script>