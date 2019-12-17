<template>
  <div class="form-container">
    <h2>编辑用户</h2>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="submitForm" label-width="150px">
      <el-form-item prop="username" :rules="rules.username" label="用户名">
        <el-input v-model="values.username" style="width:300px;" />
      </el-form-item>
      <el-form-item prop="nickname" :rules="rules.nickname" label="昵称">
        <el-input v-model="values.nickname" style="width:300px;" />
      </el-form-item>
      <el-form-item label="性别">
        <el-radio-group v-model="values.sex">
          <el-radio v-for="(item, key) in sexConfig" :key="key" :label="key">{{ item }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="email" :rules="rules.email" label="电子邮箱">
        <el-input v-model="values.email" style="width:300px;" />
      </el-form-item>
      <el-form-item prop="mobile" :rules="rules.mobile" label="手机号码">
        <el-input v-model="values.mobile" style="width:300px;" />
      </el-form-item>
      <el-form-item label="绑定">
        <el-checkbox-group v-model="values.binds">
          <el-checkbox v-for="(name, key) in bindConfig" :key="key" :label="key">{{ name }}</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item >
        <el-button type="primary" native-type="submit" :loading="loading">提 交</el-button>
        <el-button type="success" @click="handleBack">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Watch } from 'nuxt-property-decorator'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { Ucenter } from '@/types'
import { Maps, Rule } from 'kenote-config-helper'
import { oc } from 'ts-optchain'
import { isMobilePhone } from 'validator'
import { Form as ElForm } from 'element-ui'

@Component({
  name: 'ucenter-user-edit',
  created () {
    let self: R = this as R 
    if (self.data) {
      self.values = {
        ...self.values,
        username: self.data.username,
        nickname: self.data.nickname,
        sex: self.data.sex,
        email: self.data.email,
        mobile: self.data.mobile,
        binds: self.data.binds
      }
    }
  }
})
export default class R extends Vue {

  @Prop({ default: false }) loading!: boolean
  @Prop({ default: null }) data!: responseUserDocument | null
  @Prop({ default: undefined }) unique!: (type: 'username' | 'email' | 'mobile', _id: string, value: string) => Promise<boolean>

  @Provide() values: Ucenter.EditUser = {
    binds: [],
    sex: 0
  }
  @Provide() rules: Maps<Rule[]> = {
    username: [
      { required: true, message: '用户名不能为空' },
      { validator: this.validateUsername, trigger: ['blur', 'change'] }
    ],
    nickname: [
      { validator: this.validateNickname, trigger: ['blur', 'change'] }
    ],
    email: [
      { required: true, message: '请输入邮箱地址' },
      { type: 'email', message: '请输入正确的邮箱地址，如 example@163.com', trigger: ['blur', 'change'] },
      { validator: this.validateEmail, trigger: ['blur', 'change'] }
    ],
    mobile: [
      { validator: this.validateMobile, trigger: ['blur', 'change'] }
    ],
  }
  @Provide() sexConfig: string[] = [ '未知', '男', '女' ]
  @Provide() bindConfig: Record<'email' | 'mobile', string> = {
    email: '电子邮箱',
    mobile: '手机号码'
  }

  async validateUsername (rule: any, value: any, callback: (message?: string) => any): Promise<(message?: string) => any> {
    let valid: boolean = /^[a-zA-Z]{1}[a-zA-Z0-9\_\-]/.test(value)
    if (!valid) {
      return callback('英文字符开头，支持小写英文、数字、下划线和中划线组合')
    }
    if (value.length > 20 || value.length < 5) {
      return callback('账号名限定 5 - 20 位字符')
    }
    valid = await this.unique('username', oc(this.data)._id(), value)
    if (!valid) {
      return callback('该账号已占用')
    }
    return callback()
  }

  validateNickname (rule: any, value: any, callback: (message?: string) => any): (message?: string) => any {
    if (!value) return callback()
    let valid: boolean = /^[\d\w\u4e00-\u9fa5\-]{2,15}$/.test(value)
    if (!valid) {
      return callback('昵称可以是2-15位的中文,英文,数字,下划线、减号')
    }
    return callback()
  }

  async validateEmail (rule: any, value: any, callback: (message?: string) => any): Promise<(message?: string) => any> {
    let valid: boolean = await this.unique('email', oc(this.data)._id(), value)
    if (!valid) {
      return callback('该邮箱已占用')
    }
    return callback()
  }

  async validateMobile (rule: any, value: any, callback: (message?: string) => any): Promise<(message?: string) => any> {
    if (!value) return callback()
    let valid: boolean = isMobilePhone(value, 'zh-CN')
    if (!valid) {
      return callback('请输入正确的手机号码，且不可使用虚拟手机号码')
    }
    valid = await this.unique('mobile', oc(this.data)._id(), value)
    if (!value) {
      return callback('该邮箱已绑定其他帐号')
    }
    return callback()
  }

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        this.$emit('submit', oc(this.data)._id(), this.values)
      }
      else {
        return false
      }
    })
  }

  handleBack (): void {
    this.$emit('goback', null)
  }
  
}
</script>