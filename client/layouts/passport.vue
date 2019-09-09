<template>
  <div class="passport_warpper">
    <passport-header :auth="user">
      <nuxt class="layout-body" />
    </passport-header>
    
    <passport-footer />
    
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, namespace } from 'nuxt-property-decorator'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import passportHeader from './passport/header.vue'
import passportFooter from './passport/footer.vue'
import '~/assets/scss/passport/warpper.scss'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  components: {
    passportHeader,
    passportFooter
  },
  mounted () {
    document.body.className = 'passport_body'
  },
  head () {
    return {
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no'
        }
      ]
    }
  }
})
export default class  extends Vue {

  @Auth.State user!: responseUserDocument  
  
}
</script>

<style lang="scss">


</style>
