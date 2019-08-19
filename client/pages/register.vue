<template>
  <page v-if="steptag === 'invitation'">
    <passport-ticket name="邀请码" @submit="handleInvitation" v-loading="loading" :loading="loading">
      <p class="service-terms">
        系统已经关闭的注册入口，您必须拥有邀请码才能注册
      </p>
    </passport-ticket>
  </page>
  <page v-else-if="steptag === 'submitinfo'">
    <passport-register :unique="handleUnique" @submit="handleRegister" v-loading="loading" :loading="loading">
      <p class="service-terms">
        请您仔细阅读并同意遵守
        <a href="javascript:;">《服务条款》</a>
        <nuxt-link to="/login" class="ng-hide">立即登录</nuxt-link>
      </p>
    </passport-register>
  </page>
  <page v-else-if="steptag ==='finished'">
    <passport-finished :email="email" :timeout="register.email_verify.timeout">

    </passport-finished>
  </page>
</template>

<script lang="ts">
import { Component, Vue, Provide, namespace } from 'nuxt-property-decorator'
import passportTicket from '~/components/passport/ticket.vue'
import passportRegister from '~/components/passport/register.vue'
import passportFinished from '~/components/passport/finished.vue'
import httpClient from '@/utils/http'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'
import { Register, resufulInfo } from '@/types/resuful'
import { responseDocument as responseTicketDocument } from '@/types/proxys/ticket'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import passport from '@/types/passport'

const Setting: BindingHelpers = namespace(setting.name)

@Component({
  layout: 'passport',
  components: {
    passportTicket,
    passportRegister,
    passportFinished
  },
  mounted () {
    
  }
})
export default class R extends Vue {

  @Setting.State register!: Register.Config

  @Provide() steptag: 'invitation' | 'submitinfo' | 'validate' | 'finished' = 'invitation'
  @Provide() loading: boolean = false
  @Provide() cdkey: string = ''
  @Provide() email: string = ''
  
  handleInvitation (cdkey: string): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let result: resufulInfo = await httpClient.post(`/api/v1/passport/invitation`, { cdkey })
        this.loading = false
        if (result.Status.code === 0) {
          let { cdkey } = result.data as responseTicketDocument
          this.cdkey = cdkey
          this.steptag = 'submitinfo'
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  async handleUnique (type: 'username' | 'email', name: string): Promise<boolean | undefined> {
    try {
      let result: resufulInfo = await httpClient.put(`/api/v1/passport/check/${type}`, { name })
      if (result.Status.code === 0) {
        return result.data as boolean
      }
      return false
    } catch (error) {
      this.$message.warning(error.message)
    }
  }

  handleRegister (values: passport.Register): void {
    if (this.register.invitation) {
      values.invitation = this.cdkey
    }
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let result: resufulInfo = await httpClient.post(`/api/v1/passport/register`, values)
        this.loading = false
        if (result.Status.code === 0) {
          let { email } = result.data as responseUserDocument
          this.steptag = 'finished'
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }
}
</script>