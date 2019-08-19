<template>
  <div class="landing-body">
    <h3>找回密码</h3>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="submitForm">
      <slot name="info"></slot>
      <el-form-item prop="code" :rules="rules.code">
        <el-input placeholder="请输入验证码" v-model="values.code" />
      </el-form-item>
      <el-form-item prop="password" :rules="rules.password">
        <el-input type="password" placeholder="设置 8 - 20 位密码" v-model="values.password" />
      </el-form-item>
      <el-form-item prop="repassed" :rules="rules.repassed">
        <el-input type="password" placeholder="请确认新密码" v-model="values.repassed" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">重置密码</el-button>
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
import { pick } from 'lodash'

@Component({
  layout: 'passport-lostpass-form',
  mounted () {
    
  }
})
export default class  extends Vue {

  @Prop({ default: false }) loading!: boolean

  @Provide() values: passport.lostpassSendData = {}
  @Provide() rules: Maps<Rule[]> = {
    code: [
      { required: true, message: '请输入验证码' }
    ],
    password: [
      { required: true, message: '请设置新密码' },
      { validator: this.validatePassword, trigger: ['blur', 'change'] }
    ],
    repassed: [
      { required: true, message: '请确认新密码' },
      { validator: this.validaterRepassed, trigger: ['blur', 'change'] }
    ]
  }
  
  validatePassword (rule: any, value: any, callback: (message?: string) => any): (message?: string) => any {
    let valid: boolean = /^(?=.*[A-Za-z])[A-Za-z0-9$@$!%*#?&]{8,20}$/.test(value)
    if (!valid) {
      return callback('密码支持 8 - 20 位的字母、数字和英文符号')
    }
    return callback()
  }
  
  validaterRepassed (rule: any, value: any, callback: (message?: string) => any): (message?: string) => any {
    let valid: boolean = this.values.password! === value
    if (!valid) {
      return callback('两次输入的密码不一致')
    }
    return callback()
  }

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        this.$emit('submit', pick(this.values, ['code', 'password']))
      }
      else {
        return false
      }
    })
  }

}
</script>