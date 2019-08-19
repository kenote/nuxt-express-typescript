<template>
  <page v-if="steptag === 'start'">
    <lostpass-start @submit="handleStart" v-loading="loading" :loading="loading">
      <p class="service-terms">
        无法通过以上方式找回密码？ 请
        <a href="javascript:;">联系客服</a>
        <nuxt-link to="/login" class="ng-hide">立即登录</nuxt-link>
      </p>
    </lostpass-start>
  </page>
  <page v-else-if="steptag === 'submit'">
    <lostpass-form style="margin-top:0" @submit="handleSubmit" v-loading="loading" :loading="loading">
      <div slot="info" class="codeSent-info">
        <p>验证码已通过手机短信发送给您</p>
        <p>
          没有收到？
          <a v-if="times === 0" href="javascript:;" @click="handleStart(startData)">重新发送</a>
          <a v-else href="javascript:;">({{ times }} 秒后)重新发送</a>
           或 
          <a href="javascript:;" @click="handleGotoStart">选择其他方式</a>
        </p>
      </div>
      <p class="service-terms">
        无法通过以上方式找回密码？ 请
        <a href="javascript:;">联系客服</a>
        <a href="javascript:;" @click="handleGotoStart" class="ng-hide">返回</a>
      </p>
    </lostpass-form>
  </page>
</template>

<script lang="ts">
import 'vue-router'
import { Component, Vue, Provide, namespace, Watch } from 'nuxt-property-decorator'
import lostpassStart from '~/components/passport/lostpass-start.vue'
import lostpassForm from '~/components/passport/lostpass-form.vue'
import passport from '@/types/passport'
import httpClient from '@/utils/http'
import { resufulInfo, Register } from '@/types/resuful'
import { responseDocument } from '@/types/proxys/user'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'

const Setting: BindingHelpers = namespace(setting.name)

@Component({
  layout: 'passport',
  components: {
    lostpassStart,
    lostpassForm
  }
})
export default class R extends Vue {

  @Setting.State register!: Register.Config
  
  @Provide() loading: boolean = false
  @Provide() steptag: 'start' | 'submit' = 'start'
  @Provide() times: number = 0
  @Provide() startData: passport.lostpassStartData = { type: 'email', name: '' }

  handleStart (values: passport.lostpassStartData): void {
    let { type, name } = values
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let result: resufulInfo = await httpClient.put(`/api/v1/passport/resetpwd/code/${type}`, { name })
        this.loading = false
        if (result.Status.code === 0) {
          if (this.steptag === 'start') this.steptag = 'submit'
          this.startData = values
          this.mailPhoneStep()
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  handleSubmit (values: passport.lostpassSendData): void {
    let { type, name } = this.startData
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let result: resufulInfo = await httpClient.put(`/api/v1/passport/resetpwd/${type}`, { ...values, name })
        this.loading = false
        if (result.Status.code === 0) {
          this.$message.info('密码修改成功！')
          this.handleGotoLogin(3000)
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  mailPhoneStep (): void {
    this.times = this.register.mailphone_step
    let timer: NodeJS.Timeout | null = setInterval(() => {
      this.times --
      if (this.times <= 0) {
        clearInterval(<NodeJS.Timeout> timer)
        timer = null
      }
    }, 1000)
  }

  handleGotoStart (): void {
    this.steptag = 'start'
  }

  handleGotoLogin (time?: number): void {
    setTimeout(() => {
      this.$router.push({ path: '/login' })
    }, time || 3000)
  }

}
</script>