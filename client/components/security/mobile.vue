<template>
  <div class="security-container">
    <el-steps :active="stepActive" finish-status="success" align-center>
      <el-step title="验证身份"></el-step>
      <el-step title="设置手机"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    <div v-if="stepActive === 1" class="main-content">
      <el-form ref="theForm" label-width="150px" :model="values" :rules="rules" @submit.native.prevent="submitForm">
        <el-form-item ref="mobile" prop="mobile" :rules="rules.mobile" label="手机号码">
          <el-input placeholder="请输入手机号码" v-model="values.mobile" style="width:300px;" />
        </el-form-item>
        <el-form-item prop="code" :rules="rules.code" label="验证码" style="margin-bottom: 42px;">
          <el-input placeholder="请输入验证码" v-model="values.code" style="width:200px;" />
          <el-button v-if="times === 0" @click="handleSendMobile">发送验证码</el-button>
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
        <h2>手机设置成功</h2>
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
import { Security } from '@/types/resuful'
import passport from '@/types/passport'
import securityVerify from './verify.vue'
import { Maps, Rule } from 'kenote-config-helper'
import { Form as ElForm, FormItem as ElFormItem } from 'element-ui'
import { isMobilePhone } from 'validator'

@Component({
  name: 'security-mobile',
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
  @Provide() values: passport.setMobile = {
    mobile: undefined,
    code: undefined
  }
  @Provide() rules: Maps<Rule[]> = {
    mobile: [
      { required: true, message: '请输入手机号码' },
      { validator: this.validateMobile, trigger: ['blur', 'change'] }
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

  async validateMobile (rule: any, value: any, callback: (message?: string) => any): Promise<(message?: string) => any> {
    let valid: boolean = isMobilePhone(value, 'zh-CN')
    if (!valid) {
      return callback('请输入正确的手机号码，且不可使用虚拟手机号码')
    }
    valid = await this.unique('mobile', value)
    if (!value) {
      return callback('该邮箱已绑定其他帐号')
    }
    return callback()
  }

  handleSendMobile (): void {
    let mobileItem: ElFormItem = <ElFormItem> this.$refs['mobile']
    if (mobileItem.$el.className.indexOf('is-success') === -1) return
    let data: Security.sendCode = { type: 'mobile', name: this.values.mobile }
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