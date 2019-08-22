<template>
  <el-breadcrumb separator="/">
    <template v-if="breadcrumb">
      <el-breadcrumb-item v-for="(item, key) in breadcrumb" :key="key" >{{ item.name }}</el-breadcrumb-item>
    </template>
  </el-breadcrumb>
</template>

<script lang="ts">
import { Route } from 'vue-router'
import { Component, Vue, Provide, Prop, Watch } from 'nuxt-property-decorator'
import { KenoteConfig, Channel, Navigation } from 'kenote-config-helper'
import { oc } from 'ts-optchain'

@Component({
  name: 'breadcrumb',
  mounted () {
    let self: R = this as R
    self.updateBreadcrumb(self.channel)
  }
})
export default class R extends Vue {

  @Prop({ default: undefined }) channel!: KenoteConfig.Channel
  @Prop({ default: undefined }) route!: Route

  @Provide() breadcrumb: Navigation[] = []

  @Watch('channel')
  onChannelChange (channel: KenoteConfig.Channel) {
    this.updateBreadcrumb(channel)
  }

  updateBreadcrumb (channel: KenoteConfig.Channel): void {
    let breadcrumb: Navigation[] = []
    if (channel) {
      breadcrumb.push({
        name: channel.name,
        index: channel.default!
      })
      if (this.route) {
        let ichannel: KenoteConfig.Channel = JSON.parse(JSON.stringify(channel))
        let menu: Navigation = new Channel(ichannel).find(this.route.path)!
        if (oc(menu).maps()) {
          breadcrumb = [ ...breadcrumb, ...menu.maps! ]
        }
      }
    }
    this.breadcrumb = breadcrumb
  }
}
</script>