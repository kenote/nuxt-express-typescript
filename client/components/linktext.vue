<template>
  <fragment v-if="/^(\/)/.test(link)">
    <nuxt-link :to="link" >{{ text }}</nuxt-link>
  </fragment>
  <fragment v-else>
    <a :href="link" :target="target" >{{ text }}</a>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop } from 'nuxt-property-decorator'

@Component({
  name: 'link-text',
  created () {
    let self: R = this as R
    let [ link, target ] = self.data || ['', '']
    self.link = link
    self.target = target
  }
})
export default class R extends Vue {

  @Prop({ default: undefined }) data!: string[]
  @Prop({ default: undefined }) text!: string

  @Provide() link?: string = undefined
  @Provide() target?: string = undefined
  
}
</script>
