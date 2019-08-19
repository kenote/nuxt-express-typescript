<template>
  <div class="landing-body">
    <h3>找回密码</h3>
    <el-form>
      <el-radio-group v-model="values.type" @change="handleChangeType">
        <el-radio label="mobile">通过手机号</el-radio>
        <el-radio label="email">通过邮箱</el-radio>
      </el-radio-group>
    </el-form>
    <el-form class="lostpass-start" v-if="values.type === 'mobile'" ref="mobile" 
      :model="values.mobile" 
      :rules="mobileRules"  
      @submit.native.prevent="submitForm(values.type)">
      <el-form-item prop="name" :rules="mobileRules.name" style="margin-bottom: 20px;">
        <el-input placeholder="请输入您的手机号码" v-model="values.mobile.name" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">获取验证码</el-button>
      </el-form-item>
      <slot></slot>
    </el-form>
    <el-form class="lostpass-start" v-if="values.type === 'email'" ref="email" 
      :model="values.email" 
      :rules="emailRules" 
      @submit.native.prevent="submitForm(values.type)">
      <el-form-item prop="name" :rules="emailRules.name" style="margin-bottom: 20px;">
        <el-input placeholder="请输入您的邮箱地址" v-model="values.email.name" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">获取验证码</el-button>
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
import { isMobilePhone } from 'validator'

@Component({
  layout: 'passport-lostpass-start',
  mounted () {
    
  }
})
export default class  extends Vue {

  @Prop({ default: false }) loading!: boolean

  @Provide() values: passport.lostpassStart = {
    type           : 'email',
    email          : { name: '' },
    mobile         : { name: '' }
  }
  @Provide() emailRules: Maps<Rule[]> = {
    name: [
      { required: true, message: '请输入邮箱地址' },
      { type: 'email', message: '请输入正确的邮箱地址，如 example@163.com', trigger: ['blur', 'change'] }
    ]
  }
  @Provide() mobileRules: Maps<Rule[]> = {
    name: [
      { required: true, message: '请输入手机号码' },
      { validator: validateMobile, trigger: ['blur', 'change'] }
    ]
  }

  handleChangeType (type: 'email' | 'mobile'): void {
    let theForm: ElForm = <ElForm> this.$refs[type]
    theForm.resetFields()
    this.values[type].name = ''
  }

  submitForm (type: 'email' | 'mobile'): void {
    let theForm: ElForm = <ElForm> this.$refs[type]
    theForm.validate((valid: any): void | false => {
      if (valid) {
        this.$emit('submit', { type, name: this.values[type].name! })
      }
      else {
        return false
      }
    })
  }

}

const validateMobile = (rule: any, value: any, callback: (message?: string) => any): (message?: string) => any => {
  let valid: boolean = isMobilePhone(value, 'zh-CN')
  if (!valid) {
    return callback('请输入正确的手机号码，且不可使用虚拟手机号码')
  }
  return callback()
}
</script>