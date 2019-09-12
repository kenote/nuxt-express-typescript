<template>
  <home-page :auth="user" :setting="setting" :navigation="navigation['homepage'] || []" :footer="footer['homepage']">
    <page class="container"  v-bind:class="setting.class">
      <template v-if="sections">
        <homepage-section v-for="(section, key) in sections" 
          :key="key" 
          :class="section.className" 
          :background="section.background" 
          :container="section.container" />
      </template>
    </page>
    <el-backtop></el-backtop>
  </home-page>
</template>

<script lang="ts">
import { Route } from 'vue-router'
import { Component, Vue, Provide, namespace, Watch } from 'nuxt-property-decorator'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import homePage from '~/layouts/home/base.vue'
import homepage from '@/types/homepage'
import { parseCommand } from '@/utils'
import { Command } from '@/types'
import { Maps, Navigation } from 'kenote-config-helper'
import '~/assets/scss/home/section.scss'

import homepageSection from '~/components/homepage/section.vue'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  components: {
    homePage,
    homepageSection
  },
  created () {
    let self: R = this as R
    self.updateRoutePage(self.$route.path)
  },
  mounted () {
    let self: R = this as R
    console.log(self.footer)
  }
})
export default class R extends Vue {

  @Auth.State user!: responseUserDocument
  @Setting.State homepage!: Maps<homepage.Page>
  @Setting.State navigation!: Maps<Navigation[]>
  @Setting.State footer!: Maps<homepage.Footer>

  @Provide() setting: homepage.Page = { class: '', header: { style: '' }, bodyer: {} }
  @Provide() collapse: number = 0

  @Provide() sections: homepage.Section[] = []

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
      let isRoute:boolean = Object.keys(this.homepage).includes(key)
      if (!isRoute) {
        this.$router.push('/home')
        return
      }
      this.setting = this.homepage[key] || { class: '', header: { style: '' }, bodyer: {} }
      this.sections = this.setting.bodyer.sections!
    }
  }

  handleCommand (value: string): void {
    let command: Command.Value = parseCommand(value)!
    console.log(command)
    if (!command) {
      console.log(value)
      location.href = value
      return
    }
    if (command.type === 'command') {
      
    }
    else if (command.type === 'router') {
      this.$router.push(command.path)
    }
    else {
      
    }
  }
  
}
</script>