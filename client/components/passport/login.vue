<template>
  <div class="landing-body">
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="submitForm" label-position="top" hide-required-asterisk>
      <el-form-item prop="username" :rules="rules.username" label="用户名：">
        <el-input placeholder="账号/邮箱/手机号" v-model="values.username" />
      </el-form-item>
      <el-form-item prop="password" :rules="rules.password" label="密码：">
        <el-input type="password" placeholder="密码" v-model="values.password" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">登 录</el-button>
      </el-form-item>
      <slot></slot>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop } from 'nuxt-property-decorator'
import { Rule, Maps } from 'kenote-config-helper'
import { Form as ElForm } from 'element-ui'
import passport from '@/types/passport'

@Component({
  layout: 'passport-login',
  mounted () {
    
  }
})
export default class R extends Vue {

  @Prop({ default: false }) loading!: boolean

  @Provide() values: passport.Login = {}
  @Provide() rules: Maps<Rule[]> = {
    username: [
      { required: true, message: '请输入账号/邮箱/手机号' }
    ],
    password: [
      { required: true, message: '请输入密码' }
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

}
</script>