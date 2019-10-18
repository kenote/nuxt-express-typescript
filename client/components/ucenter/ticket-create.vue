<template>
  <div class="form-container">
    <h2>创建邀请码</h2>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="submitForm" label-width="150px">
      <el-form-item prop="group" :rules="rules.group" label="用户组/角色">
        <el-select v-model="values.group" placeholder="请选择用户组/角色" filterable>
          <el-option v-for="item in groups" :key="item._id" :label="`[${item.level}] ` + item.name" :value="item._id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="最大使用数量">
        <el-input-number size="medium" v-model="values.stint" :min="1" :max="9999"></el-input-number>
      </el-form-item>
      <el-form-item label="过期时间">
        <el-date-picker
          v-model="values.last_at"
          type="datetime"
          placeholder="选择日期时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item >
        <el-button type="primary" native-type="submit" :loading="loading">提 交</el-button>
        <el-button type="success" @click="handleBack">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'nuxt-property-decorator'
import { Ucenter } from '@/types'
import { Maps, Rule } from 'kenote-config-helper'
import { Form as ElForm } from 'element-ui'
import { responseDocument as responseGroupDocument } from '@/types/proxys/group'

@Component({
  name: 'ucenter-ticket-create',
  created () {
    let self: R = this as R
    self.$emit('get-groups', self.handleBackGroups)
  }
})
export default class R extends Vue {

  @Prop({ default: false }) loading!: boolean
  
  @Provide() values: Ucenter.CreateTicket = {
    stint: 1,
    last_at: new Date(new Date().setDate(new Date().getDate() + 1))
  }
  @Provide() rules: Maps<Rule[]> = {
    group: [
      { required: true, message: '请选择用户组/角色' }
    ]
  }
  @Provide() groups: responseGroupDocument[] = []

  handleBack (): void {
    this.$emit('goback', null)
  }

  handleBackGroups (groups: responseGroupDocument[]): void {
    this.groups = groups
  }

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        this.$emit('submit', this.values)
      }
      else {
        return false
      }
    })
  }
  
}
</script>