<template>
  <fragment>
    <div class="layout-footer">
      <div class="container top">
        <div class="left" v-show="true">
          <div class="menu">
            <div class="title">产品</div>
            <a href="#">CDN</a>
            <a href="#">直播云</a>
            <a href="#">云存储</a>
            <a href="#">点播云</a>
            <a href="#">云处理</a>
            <a href="#">安全防护</a>
            <a href="#">融合云存储</a>
          </div>
          <div class="menu">
            <div class="title">支持</div>
            <a href="#">产品文档</a>
            <a href="#">常见问题</a>
            <a href="#">服务条款</a>
          </div>
          <div class="menu">
            <div class="title">活动</div>
            <a href="#">又拍云联盟</a>
            <a href="#">Open Talk</a>
          </div>
          <div class="menu">
            <div class="title">关于</div>
            <a href="#">公司简介</a>
            <a href="#">加入我们</a>
            <a href="#">联系我们</a>
            <a href="#">合作伙伴</a>
            <a href="#">媒体报道</a>
          </div>
          <div class="line"></div>
        </div>
        <div class="right" v-show="true">
          <div class="menu">
            <div class="title">售前</div>
            <a class="normal">QQ: 200576786</a>
            <a class="normal">Tel：0571-81020203</a>
            <span>Email：<a href="#" class="inline">sales@upyun.com</a></span>
          </div>
          <div class="menu">
            <div class="title">售后</div>
            <a href="#">点击在线咨询</a>
            <a class="normal">Tel：0571-81020204</a>
            <span>Email：<a href="#" class="inline">support@upyun.com</a></span>
          </div>
        </div>
      </div>
      <div class="line"></div>
      <div class="icp">
        © 2019 Kenote 前端实验室
      </div>
    </div>
    <div class="layout-footer-mobile">
      © 2019 Kenote 前端实验室
    </div>
  </fragment>
</template>


<script lang="ts">
import { Component, Vue, Provide } from 'nuxt-property-decorator'

@Component({
  name: 'home-footer',
  mounted () {
    
  }
})
export default class  extends Vue {}
</script>