<template>
  <div class="form-container">
    <h2>分配《{{ project.name }}》渠道</h2>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="submitForm" label-width="150px">
      <el-form-item prop="team" :rules="rules.team" label="选择团队">
         <el-select v-model="values.team" placeholder="请选择团队" filterable collapse-tags  style="width:300px;" @change="handleChangeTeam">
          <el-option v-for="item in teams" :key="item._id" :label="item.name" :value="item._id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="渠道分配">
        <el-transfer 
          filterable
          :filter-method="filterMethod"
          v-model="values.ditchs" 
          :titles="['可选渠道', '已选渠道']"
          :props="{ key: '_id', label: 'name' }"
          :data="data">
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
import { responseDocument as responseDitchDocument } from '@/types/proxys/ditch'
import { responseDocument as responseTeamDocument } from '@/types/proxys/team'
import { KenoteConfig, Maps, Rule } from 'kenote-config-helper'
import { Form as ElForm } from 'element-ui'

@Component({
  name: 'project-setting-ditch-allot',
  created () {
    let self: R = this as R 
    self.$emit('get-teams', self.handleBackTeams)
  }
})
export default class R extends Vue {

  @Prop({ default: undefined }) data!: responseDitchDocument[]
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: undefined }) project!: KenoteConfig.Channel

  @Provide() teams: responseTeamDocument[] = []
  @Provide() values: any = {
    ditchs: [],
    raw_ditchs: []
  }
  @Provide() rules: Maps<Rule[]> = {
    team: [
      { required: true, message: '请选择团队' }
    ]
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

  handleBack (): void {
    this.$emit('goback', null)
  }

  filterMethod (query: string, item: responseDitchDocument): boolean {
    return item.name.includes(query)
  }

  handleBackTeams (teams: Array<responseTeamDocument>): void {
    this.teams = teams.filter( o => o.platform.includes(this.project.id) )
  }

  handleChangeTeam (value: string): void {
    let ditchs: string[] = this.data.filter( o => o.teams.map( t => t._id ).includes(value) ).map( o => o._id )
    this.values.ditchs = ditchs
    this.values.raw_ditchs = ditchs
  }
  
}
</script>