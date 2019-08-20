<template>
  <page>

  </page>
</template>

<script lang="ts">
import { Component, Vue, Provide, namespace } from 'nuxt-property-decorator'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'

const Setting: BindingHelpers = namespace(setting.name)

@Component({
  layout: 'dashboard',
  middleware: ['authenticated'],
  mounted () {
    
  }
})
export default class R extends Vue {

  @Setting.Getter selectedChannel
  @Setting.Getter channelStore
  
}
</script>