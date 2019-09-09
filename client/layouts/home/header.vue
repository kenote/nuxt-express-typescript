<template>
  <div class="layout-header" :style="data && data.style">
    <div id="page_header" :class="fixed">
      <div class="container clearfix">
        <nuxt-link class="logo" to="/home">
          <img src="~/assets/images/logo.png" height="32" />
        </nuxt-link>
        <el-dropdown class="mobile-logo" @command="handleCommand">
          <span class="el-dropdown-link">
            <nuxt-link to="/home">
              <img src="~/assets/images/logo.png" height="32" />
            </nuxt-link>
          </span>
          <el-dropdown-menu slot="dropdown">
            <template v-for="(nav, key) in navigation">
              <el-dropdown-item v-if="!nav.children" :key="key" :command="`router:${nav.index}`">{{ nav.name }}</el-dropdown-item>
            </template>
          </el-dropdown-menu>
        </el-dropdown>
        <div class="navs">
          <template v-for="(nav, key) in navigation">
            <template v-if="nav.children">
              <el-dropdown :key="key" class="nav">
                <span class="el-dropdown-link">
                  {{ nav.name }}<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <template v-for="(item, k) in nav.children">
                    <el-dropdown-item :key="k" :command="item.index">{{ item.name }}</el-dropdown-item>
                  </template>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
            <a v-else-if="!/^(\/)/.test(nav.index)" :key="key" :href="nav.index" target="_blank">{{ nav.name }}</a>
            <nuxt-link v-else :key="key" class="nav" :to="nav.index">{{ nav.name }}</nuxt-link>
          </template>
        </div>
        <div class="side-navs">
          <template v-if="auth">
            <nuxt-link class="nav console" to="/console">控制台</nuxt-link>
            <el-dropdown class="nav" @command="handleCommand">
              <span class="el-dropdown-link">
                <i class="iconfont icon-account account"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>账户名 <span style="color:#999999; margin-left:15px;">thondery</span></el-dropdown-item>
                <el-dropdown-item>未读消息</el-dropdown-item>
                <el-dropdown-item>我的工单</el-dropdown-item>
                <el-dropdown-item command="command:logout">退出</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
          <template v-else>
            <nuxt-link class="nav login" to="/login">登录</nuxt-link>
            <nuxt-link class="nav register" to="/register">注册</nuxt-link>
            <nuxt-link class="nav console" to="/console">控制台</nuxt-link>
          </template>
        </div>
      </div>
    </div>
    <div class="summit" v-if="data && data.summit">
      <img :src="data.summit" />
    </div>
    
    <div class="slide" v-if="data && data.slide">
      <template v-if="data.slide.title">
        <transition 
          :enter-active-class="`animated ${data.slide.title.enterActive || 'fadeInDown'}`"  
           >
          <div class="title" v-show="show">{{ data.slide.title.content }}</div>
        </transition>
      </template>
      <template v-if="data.slide.subTitle">
        <transition v-for="(content, key) in data.slide.subTitle.content" :key="key"
          :enter-active-class="`animated ${data.slide.subTitle.enterActive || 'fadeIn delay-1s'}`"  
           >
          <div class="sub-title" v-show="show">{{ content }}</div>
        </transition>
      </template>
      <template v-if="data.slide.buttons">
        <transition 
          :enter-active-class="`animated ${data.slide.buttons.enterActive || 'fadeInUp delay-1s'}`"  
          
          :duration="3000" >
          <div class="buttons" v-show="show">
            <a v-for="(content, key) in data.slide.buttons.content" :key="key" 
              :class="content.type || 'up_button'"
              :href="content.link"
              :target="content.target"
              >
              {{ content.name }}
            </a>
          </div>
        </transition>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop, Watch } from 'nuxt-property-decorator'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
// import lineSvg from '~/assets/images/line.svg'
import { Dropdown, Command } from '@/types'
import { parseCommand } from '@/utils'
import httpClient from '@/utils/http'
import { resufulInfo } from '@/types/resuful'
import * as auth from '~/store/modules/auth'
import homepage from '@/types/homepage'
import { Maps, Navigation } from 'kenote-config-helper'

@Component({
  name: 'home-header',
  mounted () {
    let self: R = this as R
    window.addEventListener('scroll', self.handleScroll)
    self.show = true
  },
  destroyed () {
    let self: R = this as R
    window.removeEventListener('scroll', self.handleScroll)
  }
})
export default class R extends Vue {

  @Prop({ default: null }) auth!: responseUserDocument
  @Prop({ default: undefined }) data!: homepage.Header
  @Prop({ default: [] }) navigation!: Navigation[]

  @Provide() fixed: string = ''
  @Provide() show: boolean = false

  @Watch('data')
  onDataChange (val) {
    
  }

  handleScroll (): void {
    let scrollTop: number = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
    if (scrollTop > 50) {
      this.fixed = 'page-fixed'
    }
    else {
      this.fixed = ''
    }
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
          // this.$router.push(`/login?url_callback=${this.$route.path}`)
          return
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }
}
</script>

<style lang="scss">
.home_body .home_warpper .layout-header {
  background-color: #f3f3f4;
  background-image: linear-gradient(312deg, rgb(58, 231, 243) 0%, rgb(30, 150, 229) 100%);
  height: 620px;

  #page_header {
    width: 100%;
    height: 80px;
    position: fixed;
    color: #fff;
    font-size: 16px;
    z-index: 1000;
    transition: all .3s ease-in-out;

    &.page-fixed {
      background-color: #ffffffcc !important;
      color: #97a1ab;
      border-bottom: 1px solid #e1e2e4;

      .container .side-navs .nav {

        &:hover {
          color: #e1e2e4;
        }
      }

      .container .side-navs .console {
        border: 1px solid #97a1ab;

        &:hover {
          color: #97a1ab;
          background-color: #e1e2e4;
        }
      }

      .container .side-navs .nav .account {
        border: 1px solid #97a1ab;

        &:hover {
          color: #e1e2e4;
          border: 1px solid #e1e2e4;
        }
      }
    }

    .container {
      position: relative;
      max-width: 1170px;
      margin-left: auto;
      margin-right: auto;
      padding: 0px 10px;
      min-width: 320px;

      .logo {
        display: inline-block;
        padding-top: 21px;
        width: 154px;
      }

      .mobile-logo {
        display: none;
      }

      .navs {
        display: -ms-inline-flexbox;
        display: inline-flex;
        -ms-flex-pack: justify;
        //justify-content: space-between;
        width: calc(100% - 443px);
        max-width: 720px;
        vertical-align: top;
        margin-left: 38px;
        height: 80px;
        padding-top: 20px;

        .nav {
          display: inline-flex;
          -ms-flex-pack: center;
          justify-content: center;
          -ms-flex-align: center;
          align-items: center;
          height: 40px;
          line-height: 40px;
          padding: 0 12px;
          text-decoration: none;
          color: inherit;
        }
      }

      .side-navs {
        float: right;
        text-align: right;
        height: 80px;
        padding-top: 20px;

        .nav {
          display: inline-block;
          height: 40px;
          line-height: 40px;
          padding: 0 10px;
          cursor: pointer;
          vertical-align: top;
          text-decoration: none;
          color: inherit;

          .account {
            font-size: 28px;
            border: 1px #fff solid;
            border-radius: 18px;
            padding: 2px;
          }
        }

        .console {
          border: 1px solid #fff;
          border-radius: 6px;
          height: 32px;
          line-height: 30px;
          margin-top: 4px;
          margin-left: 10px;
          margin-right: 5px;
          padding: 0 15px;

          &:hover {
            background-color: #77e3f7ba;
          }
        }

        @media (max-width: 480px) {
          .register {
            display: none;
          }
        }
      }

      @media (max-width: 767px) {
        .mobile-logo {
          display: inline-block;
          padding-top: 21px;
        }
        .navs, .logo {
          display: none;
        }
      }
    }
  }

  .summit {
    position: absolute;
    bottom: 0;
    left: 50%;
    margin-left: -691px;
  }

  .slide {
    position: absolute;
    left: 0;
    top: 180px;
    width: 100%;
    text-align: left;
    padding-left: calc((100vw - 1170px) / 2 + 117px);
    //opacity: 0;

    .title {
      font-size: 36px;
      font-weight: 400;
      margin-bottom: 15px;
    }

    .sub-title {
      font-size: 16px;
      margin-top: 8px;
    }

    .buttons {
      margin-top: 50px;

      .up_button {
        display: inline-block;
        width: 140px;
        height: 46px;
        line-height: 44px;
        border-radius: 6px;
        border: 1px solid #fff;
        font-size: 18px;
        text-align: center;
        transition: background .2s linear,opacity .2s linear;
        font-weight: 400;
        cursor: pointer;
        background-color: #ffffff;
        color: rgb(46, 192, 236);

        &:hover {
          background-color: #bde8ff;
        }
      }
    }
  }

  @media (max-width: 1170px) {
    .slide {
      padding: 0 10%;
    }
  }

  @media (max-width: 359px) {
    .slide {
      padding: 0 12px;
    }
  }

  @media (max-width: 480px) {
    .slide .title {
      font-size: 28px;
    }
  }
}
</style>