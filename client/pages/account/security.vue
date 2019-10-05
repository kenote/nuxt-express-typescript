<template>
  <page>
    <breadcrumb :channel="selectedChannel" :route="$route" />
    <div class="security-container" v-if="!user.binds.includes('email')">
      <div class="main-content">
        <p>您的邮箱尚未被激活，请尽快激活；</p>
        <el-form>
          <el-form-item style="padding-left: 60px;">
            <el-button v-if="times === 0" type="primary" :loading="loading" @click="handleSendEmailVerify">发送激活邮件</el-button>
            <el-button v-else type="primary" disabled style="width: auto;">({{ times }} 秒) 发送激活邮件</el-button>
            <el-button :loading="refresh" @click="handleRefreshAuth">刷新状态</el-button>
          </el-form-item>
        </el-form>
        <div class="footer">
          <h2>激活邮箱</h2>
          <p>1、如未收到激活邮件可点击上方发送激活邮件按钮。</p>
          <p>2、如已经激活邮箱，请刷新本页面。</p>
        </div>
      </div>
    </div>
    <transition-group name="el-zoom-in-top" v-else>
      <security-password v-if="viewtype === 'password'" key="password"
        @close="handleClose"
        @sendcode="handleSendcode"
        @verifycode="handleVerifycode"
        :active="active"
        :user="user"
        :step="register.lost_pass.timeeout"
        :timeeout="register.mailphone_step"
        :times="times"
        :loading="loading"
        @submit="handleSubmitPassword"
        />
      <security-email v-else-if="viewtype === 'email'" key="email"
        @close="handleClose"
        @sendcode="handleSendcode"
        @verifycode="handleVerifycode"
        :active="active"
        :user="user"
        :step="register.lost_pass.timeeout"
        :timeeout="register.mailphone_step"
        :times="times"
        :loading="loading"
        :unique="handleUnique"
        @submit="handleSubmitEmail"
        />
      <security-mobile v-else-if="viewtype === 'mobile'" key="mobile"
        @close="handleClose"
        @sendcode="handleSendcode"
        @verifycode="handleVerifycode"
        :active="active"
        :user="user"
        :step="register.lost_pass.timeeout"
        :timeeout="register.mailphone_step"
        :times="times"
        :loading="loading"
        :unique="handleUnique"
        @submit="handleSubmitMobile"
        />
      <div v-else class="security-container" key="overview">
        <div class="panel" v-for="(item, key) in overview" :key="key">
          <div class="panel-body">
             <div class="panel-content">
               <h4>
                {{ item.name }}
                <i :class="item.icon" />
              </h4>
              <p v-if="item.data">{{ item.data.name }}：{{ format(item) }}</p>
              <p v-if="isString(item.description)">{{ item.description }}</p>
              <template v-else-if="isArray(item.description)">
                <p v-for="(p, k) in item.description" :key="k">{{ p }}</p>
              </template>
              <template v-else-if="isObject(item.description)">
                <h4>{{ item.description.title }}</h4>
                <ul class="row-inline">
                  <li v-for="(c, k) in item.description.content" :key="k">{{ c }}</li>
                </ul>
              </template>
             </div>
            <div class="panel-sidebar">
              <el-button v-if="item.type === 'success'" type="success" size="medium" @click="item.click && item.click()">修改</el-button>
              <el-button v-else-if="item.type === 'info'" type="warning" size="medium" @click="item.click && item.click()">设置</el-button>
              <el-button v-else type="danger" size="medium" @click="item.click && item.click()" :disabled="user && user.group.level > 1000">注销</el-button>
            </div>
          </div>
        </div>
      </div>
    </transition-group>
  </page>
</template>

<script lang="ts">
import { Component, Vue, Provide, namespace } from 'nuxt-property-decorator'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'
import { Channel, KenoteConfig } from 'kenote-config-helper'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { HeaderOptions, resufulInfo, Register, Security } from '@/types/resuful';
import httpClient from '@/utils/http'
import { clone, isString, isArray, isObject } from 'lodash'
import securityPassword from '~/components/security/password.vue'
import securityEmail from '~/components/security/email.vue'
import securityMobile from '~/components/security/mobile.vue'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    securityPassword,
    securityEmail,
    securityMobile
  },
  created () {
    let self: R = this as R
    self.updateSecurity()
  },
  mounted () {
    let self: R = this as R
  }
})
export default class R extends Vue {

  @Auth.State user!: responseUserDocument
  @Auth.State token!: string
  @Setting.Getter selectedChannel!: KenoteConfig.Channel
  @Setting.State register!: Register.Config

  @Provide() loading: boolean = false
  @Provide() refresh: boolean = false
  @Provide() times: number = 0
  @Provide() viewtype: Security.viewType = 'overview'
  @Provide() overview: Security.Overview[] = []
  @Provide() active: number = 0
  @Provide() verify_id: string | null = null

  isArray = isArray
  isObject = isObject
  isString = isString

  /**
   * 更新安全中心
   */
  updateSecurity (user?: responseUserDocument): void {
    let overview: Security.Overview[] = JSON.parse(JSON.stringify(this.register.security))
    for (let item of overview) {
      updateOverviewItem(item, 'email', user || this.user)
      updateOverviewItem(item, 'mobile', user || this.user)
      item.click = () => this.handleOverview(item.key)
    }
    this.overview = overview
  }

  /**
   * 格式化字符串
   */
  format (data: Security.Overview): string {
    let item: Security.Overview = this.register.security.find( o => o.key === data.key )!
    if (!data.data!.value)  return '--'
    if (!item.data!.format) return data.data!.value!
    let [ searchValue, replaceValue ] = item.data!.format
    return data.data!.value!.replace(searchValue, replaceValue as string)
  }

  /**
   * 切换视图
   */
  handleOverview (key: string): void {
    this.active = 0
    this.viewtype = ['password', 'email', 'mobile'].includes(key) ? key as Security.viewType : 'overview'
  }

  /**
   * 关闭视图
   */
  handleClose (): void {
    this.active = 0
    this.viewtype = 'overview'
  }

  /**
   * 发送验证码
   */
  handleSendcode (values: Security.sendCode): void {
    if (values.name) {
      values.verify_id = this.verify_id || ''
    }
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.put(`/api/v1/security/sendcode/${values.type}`, values, options)
        if (result.Status.code === 0) {
          this.mailPhoneStep()
          return
        }
      } catch (error) {
        this.$message.warning(error.message)
      }
    }, 300)
  }

  /**
   * 校验验证码
   */
  handleVerifycode (values: Security.verifyCode): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/security/verifycode`, values, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.verify_id = result.data._id
          this.active = 1
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  /**
   * 修改密码
   */
  handleSubmitPassword (values: Record<'password', string | undefined>): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/security/setpassword`, { ...values, verify_id: this.verify_id }, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.active = 3
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  /**
   * 验证名称是否占用
   */
  async handleUnique (type: 'username' | 'email' | 'mobile', value: string): Promise<boolean | undefined> {
    try {
      let options: HeaderOptions = {
        token: this.token
      }
      let result: resufulInfo = await httpClient.put(`/api/v1/security/check/${type}`, { name: value }, options)
      return result.data as boolean
    } catch (error) {
      this.$message.warning(error.message)
    }
  }

  /**
   * 设置邮箱
   */
  handleSubmitEmail (values: Security.setEmail): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/security/setemail`, { ...values, verify_id: this.verify_id }, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.$store.commit(`${auth.name}/${auth.types.EMAIL}`, values.email)
          let user = { 
            ...this.user,
            email: values.email,
            binds: Array.from(new Set([ ...this.user.binds, 'email' ]))
          }
          this.updateSecurity(user as responseUserDocument)
          this.active = 3
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  /**
   * 设置手机
   */
  handleSubmitMobile (values: Security.setMobile): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.post(`/api/v1/security/setmobile`, { ...values, verify_id: this.verify_id }, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.$store.commit(`${auth.name}/${auth.types.MOBILE}`, values.mobile)
          let user = { 
            ...this.user,
            mobile: values.mobile,
            binds: Array.from(new Set([ ...this.user.binds, 'mobile' ]))
          }
          this.updateSecurity(user as responseUserDocument)
          this.active = 3
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  /**
   * 等待 CD 时间
   */
  mailPhoneStep (): void {
    this.times = this.register.mailphone_step
    let timer: NodeJS.Timeout | null = setInterval(() => {
      this.times --
      if (this.times <= 0) {
        clearInterval(<NodeJS.Timeout> timer)
        timer = null
      }
    }, 1000)
  }

  /**
   * 发送激活邮件
   */
  handleSendEmailVerify (): void {
    this.loading = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.get(`/api/v1/security/email_verify`, null, options)
        this.loading = false
        if (result.Status.code === 0) {
          this.mailPhoneStep()
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.loading = false
        this.$message.warning(error.message)
      }
    }, 300)
  }

  /**
   * 刷新帐号
   */
  handleRefreshAuth (): void {
    this.refresh = true
    setTimeout(async (): Promise<void> => {
      try {
        let options: HeaderOptions = {
          token: this.token
        }
        let result: resufulInfo = await httpClient.get(`/api/v1/passport/accesstoken`, null, options)
        this.refresh = false
        if (result.Status.code === 0) {
          this.$store.commit(`${auth.name}/${auth.types.SET}`, result.data)
          return
        }
        this.$message.warning(result.Status.message!)
      } catch (error) {
        this.refresh = false
        this.$message.warning(error.message)
      }
    }, 300)
  }
  
}

/**
 * 更新视图单元
 */
function updateOverviewItem (item: Security.Overview, key: string, user: responseUserDocument): void {
  if (item.key === key && item.data) {
    item.data.value = user[key]
    let isBind: boolean = user.binds.indexOf(item.key) > -1
    item.type = isBind ? 'success' : 'info'
    item.icon = isBind ? 'el-icon-success success' : 'el-icon-info info'
  }
}
</script>

<style lang="scss">
.security-container {
  padding: 0 30px;
  font-family: Lantinghei;
  color: #444242;
  max-width: 960px;
  min-width: 960px;
  margin: auto;
  position: relative;

  .panel {
    //min-height: 180px;

    .panel-body {
      display: flex;
      justify-content: space-between;
      //align-items: center;
      min-height: 100px;
      padding: 44px 30px;

      .panel-content {
        padding: 0 20px 0 0;

        h4 {
          height: 26px;
          margin: 0 0 20px;
          line-height: 26px;
          font-size: 18px;
          font-weight: 400;

          i {
            font-size: 20px;

            &.success {
              color: #4CAF50;
            }

            &.info {
              color: #ffc107;
            }

            &.warning {
              color: #FF5722;
            }
          }

          &+p {
            margin-top: 20px;
          }

          &:not(:first-child) {
            margin-top: 20px;
            font-size: 1.2em;
          }
        }

        p {
          color: #747474;
          line-height: 1.8;
          margin: 0 ;
        }

        .row-inline {
          list-style: none;
          display: flex;
          padding: 0;

          &>li {
            margin: 0 30px 10px 0!important;
            color: #747474;

            &:before {
              width: 8px;
              height: 8px;
              background-color: #52acd9;
              color: #52acd9;
              display: inline-block;
              border-radius: 50%;
              margin-right: 5px;
              content: '';
            }
          }
        }
      }

      .panel-sidebar {
        display: flex;
        align-items: flex-end;
        padding: 0 30px 30px 0;

        .el-button {
          border-radius: 0;
        }
      }
    }
    
    &:not(:last-child) {
      border-bottom: 1px solid #ecedf1;
    }
  }
  
  .el-steps {
    margin-top: 80px;
  }

  .main-content {
    margin: auto;
    margin-top: 80px;

    p {
      margin: auto;
      width: 600px;
      border-bottom: 1px solid rgb(153, 153, 153);

      span {
        margin-left: 20px;
      }
    }

    .el-form {
      margin: 40px auto auto;
      width: 600px;

      .el-form-item {
        margin-bottom: 28px;
      }

      .el-form-item__label {
        //font-size: 13px;
        padding-right: 20px;
        color: #777;
      }

      .el-input__inner {
        border-radius: 0;
      }

      .el-button {
        border-radius: 0;
      }

      .el-button--primary {
        width: 150px;
      }
    }

    .footer {
      margin: auto;
      border-top: 1px dashed #e8e8e8;
      width: 700px;
      margin-top: 50px;
      padding: 15px 60px 0;

      h2 {
        font-size: 15px;
        margin-bottom: 16px;
      }

      p {
        line-height: 1.8;
        margin-left: 20px;
        border-bottom: 0;
        width: auto;
      }
    }

    .result {
      margin: 0 auto;
      text-align: center;

      i {
        color: #52c41a;
        font-size: 72px;
        line-height: 72px;
        margin-bottom: 24px;
      }

      h2 {
        font-size: 24px;
      }

      p {
        border-bottom: 0;
      }
    }
  }

  .close_content {
    position: absolute;
    top: -40px;
    right: 0;
    font-size: 24px;

    i {
      cursor: pointer;

      &:hover {
        color: #52acd9;
      }
    }
  }
}
</style>