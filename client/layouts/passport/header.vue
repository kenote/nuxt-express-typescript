<template>
  <div class="layout-header">
    <div class="layout-header-warpper">
      <div class="header_pc">
        <nuxt-link to="/">
          <img src="~/assets/images/logo.png" height="32" />
        </nuxt-link>
        <div class="list">
          <nuxt-link to="/">文档中心</nuxt-link>
          <nuxt-link to="/login">登录</nuxt-link>
          <nuxt-link to="/">首页</nuxt-link>
        </div>
      </div>
      <div class="header_mobile">
        <span>登录</span>
      </div>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide } from 'nuxt-property-decorator'

@Component({
  name: 'passport-header',
  mounted () {
    
  }
})
export default class  extends Vue {}
</script>