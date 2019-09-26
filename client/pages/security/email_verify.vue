<template>
  <div v-loading="loading" element-loading-text="邮箱校验中 ..." element-loading-spinner="el-icon-loading" class="all-landing-body">
    <transition name="el-fade-in">
      <div class="landing-body verify-result" v-if="!loading">
        <div class="verify-result-box" v-bind:class="status">
          <i :class="icon"></i>
          <div class="verify-result-content">
            <h1>{{ message }}</h1>
            <nuxt-link to="/">返回首页</nuxt-link>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, namespace } from 'nuxt-property-decorator'
import { resufulInfo } from '@/types/resuful'
import httpClient from '@/utils/http'

const icons = {
  success   : 'el-icon-success',
  warning   : 'el-icon-warning',
  error     : 'el-icon-error'
}

@Component({
  layout: 'passport',
  created () {
    let self: R = this as R
    let { token, id } = this.$route.query
    self.handleVerifyEmail(token, id)
  }
})
export default class R extends Vue {

  @Provide() loading: boolean = false
  @Provide() message?: string = ''
  @Provide() status: string = 'warning'
  @Provide() icon?: string = ''

  handleVerifyEmail (token: any, id: any): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let result: resufulInfo = await httpClient.post(`/api/v1/passport/verify/email`, { token, id })
        this.loading = false
        this.message = result.Status.code === 0 ? '邮箱验证通过' : result.Status.message
        this.$data.status = result.Status.code === 0 ? 'success' : result.data
        this.$data.icon = icons[this.status]
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }
  
}
</script>

<style lang="scss" scoped>
.all-landing-body {
  width: 100%!important;
  height: 100%;
  position: absolute!important;
  bottom: 0;
}
.verify-result {
  margin-top: 130px!important;
}
</style>