<template>
  <page>
    <breadcrumb :channel="selectedChannel" :route="$route" />
  </page>
</template>

<script lang="ts">
import { Component, Vue, Provide, namespace } from 'nuxt-property-decorator'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'
import { Channel, KenoteConfig } from 'kenote-config-helper'

const Setting: BindingHelpers = namespace(setting.name)

@Component({
  layout: 'console',
  middleware: ['authenticated'],
  components: {
    
  },
  mounted () {
    let self: R = this as R
  }
})
export default class R extends Vue {

  @Setting.Getter selectedChannel!: KenoteConfig.Channel
  
}
</script>