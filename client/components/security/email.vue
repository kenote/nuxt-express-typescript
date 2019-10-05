<template>
  <div class="security-container">
    <el-steps :active="stepActive" finish-status="success" align-center>
      <el-step title="验证身份"></el-step>
      <el-step title="设置邮箱"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    <div v-if="stepActive === 1" class="main-content">
      <el-form ref="theForm" label-width="150px" :model="values" :rules="rules" @submit.native.prevent="submitForm">
        <el-form-item ref="email" prop="email" :rules="rules.email" label="邮箱地址">
          <el-input placeholder="请输入邮箱地址" v-model="values.email" style="width:300px;" />
        </el-form-item>
        <el-form-item prop="code" :rules="rules.code" label="验证码" style="margin-bottom: 42px;">
          <el-input placeholder="请输入验证码" v-model="values.code" style="width:200px;" />
          <el-button v-if="times === 0" @click="handleSendEmail">发送验证码</el-button>
          <el-button v-else disabled>({{ times }} 秒后)重新发送</el-button>
        </el-form-item>
        <el-form-item >
          <el-button type="primary" native-type="submit" :loading="loading">确 定</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-else-if="stepActive === 3" class="main-content">
      <div class="result">
        <i class="el-icon-success" />
        <h2>邮箱设置成功</h2>
        <p>结果已经提交到服务器，并且已经生效。</p>
      </div>
    </div>
    <security-verify v-else-if="stepActive === 0"
      :user="user"
      :step="step"
      :timeout="timeout"
      :times="times"
      :loading="loading"
      @send="handleSend"
      @verify="handleVerify"
      />
    <div class="close_content">
      <i class="el-icon-close" @click="handleClose" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from 'nuxt-property-decorator'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { Security, resufulInfo } from '@/types/resuful'
import passport from '@/types/passport'
import securityVerify from './verify.vue'
import { Maps, Rule } from 'kenote-config-helper'
import { Form as ElForm, FormItem as ElFormItem } from 'element-ui'

@Component({
  name: 'security-email',
  components: {
    securityVerify
  },
  mounted () {
    let self: R = this as R
    self.stepActive = self.active
  }
})
export default class R extends Vue {

  @Prop({ default: 0 }) active!: number
  @Prop({ default: null }) user!: responseUserDocument | null
  @Prop({ default: 900 }) timeout!: number
  @Prop({ default: 60 }) step!: number
  @Prop({ default: 0 }) times!: number
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: undefined }) unique!: (type: 'username' | 'email' | 'mobile', value: string) => Promise<boolean>

  @Provide() stepActive: number = 0
  @Provide() values: passport.setEmail = {
    email: undefined,
    code: undefined
  }
  @Provide() rules: Maps<Rule[]> = {
    email: [
      { required: true, message: '请输入邮箱地址' },
      { type: 'email', message: '请输入正确的邮箱地址，如 example@163.com', trigger: ['blur', 'change'] },
      { validator: this.validateEmail, trigger: ['blur', 'change'] }
    ],
    code: [
      { required: true, message: '请输入验证码' }
    ]
  }

  @Watch('active')
  onChangeActive(value: number): void {
    this.stepActive = value
  }

  handleClose (): void {
    this.$emit('close', null)
  }

  handleVerify (verify: Security.verifyCode): void {
    this.$emit('verifycode', verify)
  }

  handleSend (data: Security.sendCode): void {
    this.$emit('sendcode', data)
  }

  async validateEmail (rule: any, value: any, callback: (message?: string) => any): Promise<(message?: string) => any> {
    let valid: boolean = await this.unique('email', value)
    if (!value) {
      return callback('该邮箱已绑定其他帐号')
    }
    return callback()
  }

  handleSendEmail (): void {
    let emailItem: ElFormItem = <ElFormItem> this.$refs['email']
    if (emailItem.$el.className.indexOf('is-success') === -1) return
    let data: Security.sendCode = { type: 'email', name: this.values.email }
    this.$emit('sendcode', data)
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