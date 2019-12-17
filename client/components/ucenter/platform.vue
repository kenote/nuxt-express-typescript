<template>
  <div class="form-container">
    <h2>编辑{{ titlename[type] }} [{{ data.name }}] -- 频道入口</h2>
    <el-form ref="theForm" :model="values" @submit.native.prevent="submitForm" label-width="150px">
      <el-form-item>
        <el-transfer 
          filterable
          :filter-method="filterMethod"
          v-model="values.platform" 
          :titles="['可选频道', '已选频道']"
          :data="platforms">
        </el-transfer>
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
import { Maps } from 'kenote-config-helper'
import { responseDocument as responseGroupDocument } from '@/types/proxys/group'
import { responseDocument as responseTeamDocument } from '@/types/proxys/team'
import { Form as ElForm } from 'element-ui'
import { Option } from '@/types'

@Component({
  name: 'ucenter-platform',
  created () {
    let self: R = this as R 

    self.values = {
      platform: self.data.platform
    }
  }
})
export default class R extends Vue {

  @Prop({ default: 'group' }) type!: 'group' | 'team'
  @Prop({ default: null }) data!: responseGroupDocument | responseTeamDocument
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: [] }) platforms!: Option[]

  @Provide() titlename: Record<'group' | 'team', string> = {
    group: '用户组',
    team: '团队'
  }
  @Provide() values: Maps<any> = {
    platform: []
  }

  handleBack (): void {
    this.$emit('goback', null)
  }

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        this.$emit('submit', this.data._id, this.values.platform)
      }
      else {
        return false
      }
    })
  }

  filterMethod (query: string, item: Option): boolean {
    return item.label.includes(query)
  }
  
}
</script>