<template>
  <el-submenu v-if="children && children.length > 0 && !/^(\/)/.test(index)" :index="index || ''" :disabled="subdisabled" v-show="!subdisabled">
    <template slot="title">
      <i v-if="icon" v-bind:class="icon"></i>
      <span>{{ name }}</span>
    </template>
    <template v-for="(menu, key) in children">
      <sidebar-menu-item :key="key" :index="menu.index" :name="menu.name" :icon="menu.icon" :children="menu.children" :disabled="menu.disabled" v-show="!menu.disabled" />
    </template>
  </el-submenu>
  <el-menu-item v-else :index="index" :disabled="disabled">
    <i v-if="icon" v-bind:class="icon"></i>
    <span slot="title">{{ name }}</span>
  </el-menu-item>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide } from 'nuxt-property-decorator'
import { Sidebar } from '@/types'

@Component({
  name: 'sidebar-menu-item',
  created () {
    let self: R = this as R 
    if (self.children) {
      self.subdisabled = !self.children.find( o => !o['disabled'] )
    }
  }
})
export default class R extends Vue {

  @Prop({ default: '' }) name!: string
  @Prop({ default: '' }) index!: string
  @Prop({ default: '' }) icon!: string
  @Prop({ default: undefined }) children!: Sidebar.MenuItem[]
  @Prop({ default: false }) disabled!: boolean

  @Provide() subdisabled: boolean = false
}
</script>