<template>
  <fragment>
    <div class="title">{{ title }}</div>
    <homepage-subtitle :content="content" />
    <div :class="className || 'logos'" v-if="data">
      <template v-for="(item, key) in data">
        <a v-if="typeof item.link === 'string'" :key="key" class="item" :href="item.link" target="_blank">
          <div v-if="item.image" class="img" :style="`background-image:url('${item.image}')`"></div>
          <div class="title">{{ item.title }}</div>
        </a>
        <a v-else :key="key" class="item" :href="item.link && item.link[0]" :target="item.link && item.link[1] || '_blank'">
          <div v-if="item.image" class="img" :style="`background-image:url('${item.image}')`"></div>
          <div class="title">{{ item.title }}</div>
        </a>
      </template>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop } from 'nuxt-property-decorator'
import * as homepage from '@/types/homepage'
import homepageSubtitle from '../subtitle.vue'

@Component({
  name: 'logos-container',
  components: {
    homepageSubtitle
  }
})
export default class R extends Vue {

  @Prop({ default: undefined }) title!: string
  @Prop({ default: undefined }) content!: string | string[]
  @Prop({ default: undefined }) data!: homepage.GroupItem[]
  @Prop({ default: undefined }) className!: string
  
}
</script>
