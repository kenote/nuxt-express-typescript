<template>
  <div>
    <el-table :data="data.filter( doc => !search || doc.name.toLowerCase().includes(search.toLowerCase()))" stripe v-loading="loading">
      <el-table-column label="ID" width="80" fixed sortable prop="id" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色名称" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="权级" width="80" sortable prop="level" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.level }}</span>
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
            <el-button size="small" @click="handleEdit(scope.$index, scope.row)" :disabled="scope.row.level > 9997">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)" :disabled="scope.row.level > 9997 || scope.row.default">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <div class="baseinfo" >
      <div class="submit-box" v-bind:class="showSubmit ? 'is-show' : ''">
        <slot></slot>
      </div>
    </div>
    <el-dialog title="删除用户组" 
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
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'nuxt-property-decorator'
import { responseDocument as responseGroupDocument } from '@/types/proxys/group'
import { } from 'element-ui'
import { ElMessageBoxOptions } from 'element-ui/types/message-box'

@Component({
  name: 'ucenter-group-list',
  created () {
    let self: R = this as R
    self.handleList()
    setTimeout(() => {
      self.showSubmit = true
    }, 1500)
  }
})
export default class R extends Vue {

  @Prop({ default: [] }) data!: responseGroupDocument[]
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

  handleEdit (index: number, row: responseGroupDocument): void {
    this.$emit('edit', index, row)
  }

  handleDelete (index: number, row: responseGroupDocument): void {
    this.dialogFormVisible = true
    this.selected = row._id
    this.values = { type: 0, move: undefined }
    // let options: ElMessageBoxOptions = {
    //   confirmButtonText    : '确定',
    //   cancelButtonText     : '取消',
    //   type                 : 'warning'
    // }
    // try {
    //   await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', options)
    //   this.$emit('remove', index, row)
    // } catch (error) {
    //   console.log('您已取消删除')
    // }
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
  
}
</script>