<template>
  <div class="home_warpper">
    <home-header ref="header"  
      :auth="auth" 
      :data="setting && setting.header"
      :navigation="navigation" >
      
    </home-header>
    
    <slot></slot>
    <home-footer>

    </home-footer>
  </div>
</template>

<script lang="ts">
import { Route } from 'vue-router'
import { Component, Vue, Provide, Prop, namespace, Watch } from 'nuxt-property-decorator'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import '~/assets/scss/home/warpper.scss'
import homeHeader from './header.vue'
import homeFooter from './footer.vue'
import homepage from '@/types/homepage'
import { Maps, Navigation } from 'kenote-config-helper'
import { oc } from 'ts-optchain'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  name: 'homepage',
  components: {
    homeHeader,
    homeFooter
  },
  created () {
    let self: R = this as R
    //self.updateRoutePage(self.$route.path)
  },
  mounted () {
    let self: R = this as R
    //self.updateRoutePage(self.$route.path)
    document.body.className = 'home_body'
    if (!self.setting) return
    let { header } = self.setting
    
  },
  head () {
    return {
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no'
        }
      ],
      /*style: [
        { cssText: '', type: 'text/css' }
      ]*/
    }
  }
})
export default class R extends Vue {

  //@Auth.State user!: responseUserDocument
  //@Setting.State homepage!: Maps<homepage.Page>

  @Prop({ default: null }) auth!: responseUserDocument
  @Prop({ default: undefined }) homepage!: Maps<homepage.Page>
  @Prop({ default: undefined }) setting!: homepage.Page
  @Prop({ default: [] }) navigation!: Navigation[]

  /*@Provide() setting: homepage.Page = { header: { style: '' }, bodyer: {} }

  @Watch('$route')
  onRouteChange (route: Route): void {
    this.updateRoutePage(route.path)
  }

  updateRoutePage (routePath: string): void {
    if (this.homepage) {
      let key: string = routePath
      if (['/', '/home'].includes(routePath)) {
        key = 'home'
      }
      key = key.replace(/^\/(home)\//, '')
      this.setting = this.homepage[key] || { header: { style: '' }, bodyer: {} }
    }
  }*/
  
}
</script>
