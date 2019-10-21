<template>
  <page>
    <breadcrumb :channel="selectedChannel" :route="$route" />
    
  </page>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, namespace } from 'nuxt-property-decorator'
import { BindingHelpers } from 'vuex-class/lib/bindings'
import * as setting from '~/store/modules/setting'
import * as auth from '~/store/modules/auth'
import { KenoteConfig } from 'kenote-config-helper'
import httpClient from '@/utils/http'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'
import { responseDocument as responseGroupDocument } from '@/types/proxys/group'
import { HeaderOptions, resufulInfo } from '@/types/resuful'
import { Ucenter, listDocument } from '@/types'

const Setting: BindingHelpers = namespace(setting.name)
const Auth: BindingHelpers = namespace(auth.name)

@Component({
  layout: 'console',
  middleware: ['authenticated'],
})
export default class R extends Vue {

  @Setting.Getter selectedChannel!: KenoteConfig.Channel
  @Auth.State token!: string
  @Auth.State user!: responseUserDocument
  
}
</script>