<template>
  <div class="console_warpper">
    <console-header
      :auth="user"
      :channels="channels"
      :current-channel="selectedChannel"
      :user-entrance="userEntrance"
      >

    </console-header>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, namespace } from 'nuxt-property-decorator'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import { KenoteConfig } from 'kenote-config-helper'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'
import consoleHeader from './console/header.vue'
import '~/assets/scss/console/warpper.scss'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { Dropdown } from '@/types'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  components: {
    consoleHeader
  },
  mounted () {
    document.body.className = 'console_body'
  }
})
export default class R extends Vue {

  @Auth.State user!: responseUserDocument
  @Setting.State channels!: KenoteConfig.Channel[]
  @Setting.State userEntrance!: Dropdown.MenuItem[]
  @Setting.Action selectChannel!: (id: number) => void
  @Setting.Getter selectedChannel!: KenoteConfig.Channel
  @Setting.Getter channelStore
  
}
</script>