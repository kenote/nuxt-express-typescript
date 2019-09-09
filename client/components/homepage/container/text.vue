<template>
  <fragment>
    <div class="title">{{ title }}</div>
    <template v-if="content">
      <template v-if="typeof content === 'string'">
        <p>{{ content }}</p>
      </template>
      <template v-else>
        <p v-for="(text, i) in content" :key="i">{{ text }}</p>
      </template>
    </template>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop } from 'nuxt-property-decorator'
import * as homepage from '@/types/homepage'

@Component({
  name: 'text-container'
})
export default class R extends Vue {

  @Prop({ default: undefined }) title!: string
  @Prop({ default: undefined }) content!: string | string[]
  
}
</script>
