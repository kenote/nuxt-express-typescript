<template>
  <el-menu ref="sidebar"
    :default-active="defaultActive"
    :background-color="backgroundColor"
    :text-color="textColor"
    :collapse="collapse"
    :router="router"
    :unique-opened="true"
    :active-text-color="activeTextColor">
    <sidebar-menu-item
      v-for="(menu, key) in navs" 
      :key="key" 
      :name="menu.name" 
      :icon="menu.icon" 
      :index="menu.index" 
      :children="menu.children" 
      :disabled="menu.disabled" />
  </el-menu>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide } from 'nuxt-property-decorator'
import { Sidebar } from '@/types'
import sidebarMenuItem from './menu-item.vue'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { Navigation, accessNavs } from 'kenote-config-helper'
import { map } from 'lodash'

@Component({
  name: 'sidebar-menu',
  components: {
    sidebarMenuItem
  },
  created () {
    let self: R = this as R
    self.updateNavs()
  }
})
export default class R extends Vue {

  @Prop({ default: null }) auth!: responseUserDocument
  @Prop({ default: [] }) sidebar!: Sidebar.MenuItem[]
  @Prop({ default: '' }) defaultActive!: string
  @Prop({ default: false }) router!: boolean
  @Prop({ default: false }) collapse!: boolean
  @Prop() backgroundColor!: string
  @Prop() textColor!: string
  @Prop() activeTextColor!: string

  @Provide() navs: Navigation[] = []

  updateNavs (): void {  
    if (!this.auth) return
    let iaccess!: string[]
    let { group, teams, access } = this.auth
    if (group.level < 9000) {
      iaccess = (access || []).length > 0 ? access : Array.from(new Set(map(teams, 'access').toString().split(',')))
    }
    this.navs = accessNavs(this.sidebar, iaccess!)
  }

}
</script>