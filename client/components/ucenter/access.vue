<template>
  <fragment>
    <div class="form-container">
      <h2>编辑{{ titlename[type] }} [{{ data.name || data.username }}] -- 访问权限</h2>
      <el-form ref="theForm" label-width="150px">
        <el-form-item label-width="0">
          <el-tabs v-model="activeName"  tab-position="right">
            <el-tab-pane v-for="(channel, key) in orderBy(channels, ['id'], ['asc'])"
              :key="key"
              :label="channel.name"
              :name="channel.id.toString()"
              :disabled="!isChannelOpen(channel.id)"
              style="margin: 10px 30px;" >
              <el-tree show-checkbox
                :data="channel.navs"
                :props="{ id: 'index', label: 'name' }"
                :default-checked-keys="checkedKeys"
                @check-change="handleCheckChange"
                node-key="index"
                default-expand-all >

              </el-tree>
            </el-tab-pane>
          </el-tabs>
        </el-form-item>
        <!-- <el-form-item >
          <el-button type="primary" native-type="submit" :loading="loading">提 交</el-button>
          <el-button type="success" @click="handleBack">返回</el-button>
        </el-form-item> -->
      </el-form>
    </div>

    <div class="baseinfo" >
      <div class="submit-box" v-bind:class="showSubmit ? 'is-show' : ''">
        <el-button type="primary" @click="submitForm" :loading="loading">提 交</el-button>
        <el-button type="success" @click="handleBack">返回</el-button>
      </div>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'nuxt-property-decorator'
import { Maps, KenoteConfig } from 'kenote-config-helper'
import { responseDocument as responseGroupDocument } from '@/types/proxys/group'
import { responseDocument as responseTeamDocument } from '@/types/proxys/team'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { Form as ElForm } from 'element-ui'
import { orderBy, remove, clone } from 'lodash'

@Component({
  name: 'ucenter-access',
  created () {
    let self: R = this as R
    if (self.data) {
      self.checkedKeys = self.data.access
    }
    setTimeout(() => {
      self.showSubmit = true
    }, 1500)
  }
})
export default class R extends Vue {

  @Prop({ default: 'group' }) type!: 'group' | 'team' | 'user'
  @Prop({ default: null }) data!: responseGroupDocument | responseTeamDocument | responseUserDocument
  @Prop({ default: false }) loading!: boolean
  @Prop({}) channels!: KenoteConfig.Channel[]

  @Provide() titlename: Record<'group' | 'team' | 'user', string> = {
    group: '用户组',
    team: '团队',
    user: '用户'
  }
  @Provide() activeName: string = '1'
  @Provide() checkedKeys: string[] = []
  @Provide() showSubmit: boolean = false

  orderBy = orderBy

  handleBack (): void {
    this.$emit('goback', null)
  }

  submitForm (): void {
    let checkedKeys: string[] = clone(this.checkedKeys)
    remove(checkedKeys, o => !/^(\/)/.test(o))
    this.$emit('submit', this.data._id, checkedKeys)
  }

  handleCheckChange (data: any, checked: boolean, indeterminate: boolean): void {
    let checkedKeys: string[] = this.checkedKeys
    if (checked) {
      checkedKeys.push(data.index)
    }
    else {
      remove(checkedKeys, o => o === data.index)
    }
    this.checkedKeys = checkedKeys
  }

  isChannelOpen (value: number): boolean {
    if (!this.data) return false
    if (this.type === 'user') {

      return true
    }
    else {
      let { platform } = this.data as responseGroupDocument | responseTeamDocument
      return platform.includes(value)
    }
    // if (this.data['teams']) {
    //   let user: responseUserDocument = <responseUserDocument> this.data
    //   let platform = uniq(map(user.teams, 'platform').toString().split(',').map(Number))
    //   return platform.indexOf(value) > -1
    // }
    // else {
    //   let team: responseTeamDocument = <responseTeamDocument> this.data
    //   if (!team.platform) return false
    //   return team.platform.indexOf(value) > -1
    // }
  }
  
}
</script>