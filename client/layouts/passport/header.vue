<template>
  <div class="layout-header">
    <div class="layout-header-warpper">
      <div class="header_pc">
        <nuxt-link to="/">
          <img src="~/assets/images/logo.png" height="32" />
        </nuxt-link>
        <div class="list">
          <nuxt-link to="/">文档中心</nuxt-link>
          <template v-if="auth">
            <nuxt-link class="console" to="/console">控制台</nuxt-link>
          </template>
          <template v-else>
            <nuxt-link to="/login">登录</nuxt-link>
          </template>
          
          <nuxt-link to="/">首页</nuxt-link>
        </div>
      </div>
      <div class="header_mobile">
        <span>{{ title }}</span>
      </div>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop } from 'nuxt-property-decorator'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'

@Component({
  name: 'passport-header',
  mounted () {
    
  }
})
export default class  extends Vue {

  @Prop({ default: null }) auth!: responseUserDocument
  @Prop({ default: undefined }) title!: string
}
</script>