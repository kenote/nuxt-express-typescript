<template>
  <page>
    <div class="landing-activity" v-if="activitys">
      <el-carousel height="180px" indicator-position="outside" arrow="never" v-if="activitys.length > 1">
        <el-carousel-item v-for="(activity, key) in activitys" :key="key">
          <p v-for="(item, i) in activity.main_title" :key="i" class="main-title">{{ item }}</p>
          <p class="secondary-title">{{ activity.secondary_title }}</p>
        </el-carousel-item>
      </el-carousel>
      <fragment v-if="activitys.length === 1">
        <p v-for="(item, key) in activitys[0].main_title" :key="key" class="main-title">{{ item }}</p>
        <p class="secondary-title">{{ activitys[0].secondary_title }}</p>
      </fragment>
    </div>
    <passport-login @submit="handleLogin" v-loading="loading" :loading="loading">
      <p class="service-terms">
        <nuxt-link to="/lostpass">忘记密码</nuxt-link>
        <nuxt-link to="/register" class="ng-hide">立即注册</nuxt-link>
      </p>
    </passport-login>
  </page>
</template>

<script lang="ts">
import 'vue-router'
import { Component, Vue, Provide, namespace, Watch } from 'nuxt-property-decorator'
import passportLogin from '~/components/passport/login.vue'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'
import * as singlepage from '@/types/singlepage'
import httpClient from '@/utils/http'
import { resufulInfo } from '@/types/resuful'
import passport from '@/types/passport'
import { responseDocument, registerDocument } from '@/types/proxys/user'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  layout: 'passport',
  components: {
    passportLogin
  },
  created () {
    let self: R = this as R
    self.activitys = self.singlepages.find( o => o.key === 'login' )!.activitys
  }
})
export default class R extends Vue {

  @Setting.State register
  @Setting.State singlepages!: singlepage.Item[]
  @Auth.State user!: registerDocument | null

  @Provide() activitys!: singlepage.Activity[]
  @Provide() loading: boolean = false

  handleLogin (values: passport.Login): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let result: resufulInfo = await httpClient.post(`/api/v1/passport/login`, values)
        this.loading = false
        if (result.Status.code === 0) {
          this.$store.commit(`${auth.name}/${auth.types.SET}`, result.data as responseDocument)
          let { url_callback } = this.$route.query
          this.$router.push(url_callback as string || '/')
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