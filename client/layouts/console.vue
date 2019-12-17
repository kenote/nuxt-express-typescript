<template>
  <error-page v-if="selectedChannel.id === 0 && $route.path !== '/console'" />
  <div class="console_warpper" v-else>
    <console-header
      :auth="user"
      :channels="channels"
      :current-channel="selectedChannel"
      :user-entrance="userEntrance"
      :select-channel="handleSelectChannel"
      >

    </console-header>
    <div class="bodyer" v-bind:style="collapse ? 'left:-250px' : ''">
      <div class="sidebar-nav" v-bind:style="'flex: 0 0 260px'" v-if="$route.path !== '/console'">
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
                :collapse="false"
                :router="true"
                :auth="user"
                />
            </el-collapse-transition>
          </template>
        </div>
        <!--<div class="menu-collapsed" @click="handleCollapse">
          <i class="iconfont" v-bind:class="collapse ? 'icon-menu-unfold' : 'icon-menu-fold'"></i>
        </div>-->
        <div class="collapse">
          <el-button size="medium" class="iconfont" v-bind:icon="collapse ? 'icon-menu-unfold' : 'icon-menu-fold'" circle @click="handleCollapse"></el-button>
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
import { FlagItem } from '@/types/resuful'
import { map } from 'lodash'
import { oc } from 'ts-optchain'
import { getAccess } from '@/utils/user'
import { getMetaInfo } from '@/utils'
import '~/assets/scss/console/warpper.scss'
import '~/assets/scss/console/page.scss'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  components: {
    consoleHeader,
    sidebarMenu
  },
  head () {
    let self: R = this as R
    return getMetaInfo(self.metas)
  },
  async mounted () {
    document.body.className = 'console_body'
    let self: R = this as R
    await self.updateChannel(self.$route.path)
  },
})
export default class R extends Vue {

  @Auth.State user!: responseUserDocument
  @Setting.State metas!: Maps<string | undefined>
  @Setting.State channels!: KenoteConfig.Channel[]
  @Setting.State userEntrance!: Dropdown.MenuItem[]
  @Setting.State loading!: Maps<boolean>
  @Setting.State flags!: FlagItem[]
  @Setting.Action selectChannel!: (id: number) => void
  @Setting.Getter selectedChannel!: KenoteConfig.Channel

  @Provide() permission: boolean = true

  @Watch('$route')
  async onRouteChange (route: Route): Promise<void> {
    await this.updateChannel(route.path)
  }

  @Watch('permission')
  onPermissionChange (permission: boolean): void {
    // if (!permission) {
    //   this.$router.replace('/account/baseinfo')
    // }
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
    let pageFlag: FlagItem = this.flags[routerPath]
    let permission: boolean = oc(pageFlag).access(1000) <= group.level
    if (group.level < 9000 && permission) {
      // let iaccess: string[] = (access || []).length > 0 ? access : Array.from(new Set(map(teams, 'access').toString().split(',')))
      let iaccess: string[] = getAccess(this.user)
      permission = iaccess.includes(routerPath)
    }
    let channelId: number = getChannelId(this.channels, routerPath)
    if (this.selectedChannel.id === channelId) return
    await this.selectChannel(channelId)
    this.permission = permission
    this.collapse = false
  }
  
}
</script>