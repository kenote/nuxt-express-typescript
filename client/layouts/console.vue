<template>
  <error-page v-if="selectedChannel.id === 9999" />
  <div class="console_warpper" v-else>
    <console-header
      :auth="user"
      :channels="channels"
      :current-channel="selectedChannel"
      :user-entrance="userEntrance"
      :select-channel="handleSelectChannel"
      >

    </console-header>
    <div class="bodyer">
      <div class="sidebar-nav" v-bind:style="collapse ? 'flex: 0 0 65px' : 'flex: 0 0 260px'" >
        <div style="height: calc(100% - 24px);overflow-y:auto;" v-loading="loading.channel">
          <template v-for="(channel, key) in channels" >
            <el-collapse-transition :key="key" v-if="channel.id === selectedChannel.id">
              <sidebar-menu v-if="!loading.channel"
                class="auth-sider-menu"
                :sidebar="channel.navs" 
                :defaultActive="$route.path"
                backgroundColor="#444c54"
                textColor="#fff"
                activeTextColor="#ffd04b"
                :collapse="collapse"
                :router="true"
                :auth="user"
                />
            </el-collapse-transition>
          </template>
        </div>
        <div class="menu-collapsed" @click="handleCollapse">
          <i class="iconfont" v-bind:class="collapse ? 'icon-menu-unfold' : 'icon-menu-fold'"></i>
        </div>
      </div>
      <div class="console-page" >
        <nuxt v-if="permission"></nuxt>
        <error-page v-else :statusCode="403" message="Forbidden" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Route } from 'vue-router'
import { Component, Vue, Provide, namespace, Watch } from 'nuxt-property-decorator'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import { KenoteConfig, Maps, getChannelId } from 'kenote-config-helper'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'
import consoleHeader from './console/header.vue'
import sidebarMenu from '~/components/sidebar/menu.vue'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { Dropdown } from '@/types'
import { map } from 'lodash'
import '~/assets/scss/console/warpper.scss'
import '~/assets/scss/console/page.scss'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  components: {
    consoleHeader,
    sidebarMenu
  },
  async mounted () {
    document.body.className = 'console_body'
    let self: R = this as R
    await self.updateChannel(self.$route.path)
  },
})
export default class R extends Vue {

  @Auth.State user!: responseUserDocument
  @Setting.State channels!: KenoteConfig.Channel[]
  @Setting.State userEntrance!: Dropdown.MenuItem[]
  @Setting.State loading!: Maps<boolean>
  @Setting.Action selectChannel!: (id: number) => void
  @Setting.Getter selectedChannel!: KenoteConfig.Channel
  @Setting.Getter channelStore

  @Provide() permission: boolean = true

  @Watch('$route')
  async onRouteChange (route: Route): Promise<void> {
    await this.updateChannel(route.path)
  }

  @Provide() collapse: boolean = false

  handleSelectChannel (value: number): void {
    if (this.selectedChannel.id === value) return
    let channel: KenoteConfig.Channel = this.channels.find( o => o.id === value )!
    this.$router.push(channel.default!)
  }

  handleCollapse () {
    this.collapse = !this.collapse
  }

  async updateChannel (routerPath: string): Promise<void> {
    if (!this.user) return
    let { group, teams, access } = this.user
    //let pageFlag: any = 
    let permission: boolean = true
    if (group.level < 9000 && permission) {
      let iaccess: string[] = (access || []).length > 0 ? access : Array.from(new Set(map(teams, 'access').toString().split(',')))
      permission = iaccess.includes(routerPath)
    }
    this.permission = permission
    let channelId: number = getChannelId(this.channels, routerPath)
    if (this.selectedChannel.id === channelId) return
    await this.selectChannel(channelId)
    this.collapse = false
  }
  
}
</script>