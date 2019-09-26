<template>
  <div class="passport_warpper">
    <passport-header :auth="user" :title="titleName">
      <nuxt class="layout-body" />
    </passport-header>
    
    <passport-footer />
    
  </div>
</template>

<script lang="ts">
import { Route } from 'vue-router'
import { Component, Vue, Provide, Watch, namespace } from 'nuxt-property-decorator'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import passportHeader from './passport/header.vue'
import passportFooter from './passport/footer.vue'
import '~/assets/scss/passport/warpper.scss'
import { Register } from '@/types/resuful'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  components: {
    passportHeader,
    passportFooter
  },
  created () {
    let self: R = this as R
    self.updatePageTitle(self.$route.path)
  },
  mounted () {
    document.body.className = 'passport_body'
  },
  head () {
    return {
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no'
        }
      ]
    }
  }
})
export default class R extends Vue {

  @Auth.State user!: responseUserDocument
  @Setting.State register!: Register.Config
  
  @Provide() titleName: string = ''

  @Watch('$route')
  async onRouteChange (route: Route): Promise<void> {
    this.updatePageTitle(route.path)
  }

  updatePageTitle (routerPath: string): void {
    let { page_title } = this.register
    this.titleName = page_title[routerPath]
  }
  
}
</script>
