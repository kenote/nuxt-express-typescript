<template>
  <div :class="className || 'sub-title'" v-if="content">
    <template v-if="typeof content === 'string'">
      <p>{{ content }}</p>
    </template>
    <template v-else >
      <p v-for="(text, i) in content" :key="i">{{ text }}</p>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop } from 'nuxt-property-decorator'

@Component({
  name: 'homepage-subtitle',
})
export default class R extends Vue {

  @Prop({ default: undefined }) content!: string | string[] | undefined
  @Prop({ default: undefined }) className!: string
  
}
</script>
