<template>
  <header>
    <div class="header-start">
      <div class="header-link-box">
        <nuxt-link class="header-link logo" to="/">
          <img src="~/assets/images/logo.png" style="height:24px" />
        </nuxt-link>
      </div>
      <el-dropdown placement="top-start" trigger="click" @visible-change="handleVisible">
        <a class="header-link" v-bind:class="visible ? 'active' : ''">
          <span class="el-dropdown-link">
            <i class="el-icon-menu el-icon--left"></i>{{ currentChannel.name }}
          </span>
        </a>
        <el-dropdown-menu slot="dropdown" class="header-link-dropdown">
          <template v-for="(channel, key) in platforms">
            <el-dropdown-item v-if="channel.id === 11" :key="key+1000" divided></el-dropdown-item>
            <el-dropdown-item :key="key" :command="channel.id">[{{ channel.id }}] {{ channel.name }}</el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="header-end">
      <auth-dropdown :auth="auth" :user-entrance="userEntrance" @command="handleCommand">

      </auth-dropdown>
    </div>
  </header>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide } from 'nuxt-property-decorator'
import { KenoteConfig } from 'kenote-config-helper'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { map } from 'lodash'
import authDropdown from './auth-dropdown.vue'
import { Dropdown, Command } from '@/types'
import { parseCommand } from '@/utils'
import httpClient from '@/utils/http'
import { resufulInfo } from '@/types/resuful'

@Component({
  name: 'console-header',
  components: {
    authDropdown
  },
  created () {
    let self: R = this as R
    if (!self.auth) return
    let platform!: number[]
    let { group, teams } = self.auth
    if (group.level < 9000) {
      platform = Array.from(new Set(map(teams, 'platform').toString().split(',').map(Number)))
    }
    self.platforms = self.filterChannels(platform)
  }
})
export default class R extends Vue {

  @Prop({ default: () => setting.defaultChannel }) currentChannel!: KenoteConfig.Channel
  @Prop({ default: null }) auth!: responseUserDocument
  @Prop({ default: [] }) channels!: KenoteConfig.Channel[]
  @Prop({ default: [] }) userEntrance!: Dropdown.MenuItem[]

  @Provide() visible: boolean = false
  @Provide() platforms: KenoteConfig.Channel[] = []
  @Provide() command: (value: string) => void = value => {}

  handleVisible (visible: boolean): void {
    this.visible = visible
  }

  filterChannels (platform?: number[]): KenoteConfig.Channel[] {
    if (!platform) return this.channels
    return this.channels.filter( o => platform.includes(o.id) )
  }

  handleCommand (value: string): void {
    let command: Command.Value = parseCommand(value)!
    if (!command) return
    if (command.type === 'command') {
      switch (command.path) {
        case 'logout':
          this.logout()
          break
        default:
          break
      }
    }
    else if (command.type === 'router') {
      this.$router.push(command.path)
    }
  }

  logout (): void {
    setTimeout(async (): Promise<void> => {
      try {
        let result: resufulInfo = await httpClient.get(`/api/v1/passport/logout`, null)
        if (result.Status.code === 0) {
          this.$store.commit(`${auth.name}/${auth.types.SET}`, null)
          this.$router.push(`/login?url_callback=${this.$route.path}`)
          return
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }
  
}
</script>