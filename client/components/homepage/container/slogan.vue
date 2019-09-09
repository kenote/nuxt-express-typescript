<template>
  <fragment>
    <div class="title">{{ title }}</div>
    <homepage-subtitle :content="content" />
    <div class="slogan" v-if="data">
      <template v-for="(item, key) in data">
        <div class="item" :key="key">
          <div class="title">{{ item.title }}</div>
          <div class="content">{{ item.content }}</div>
        </div>
      </template>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop } from 'nuxt-property-decorator'
import * as homepage from '@/types/homepage'
import homepageSubtitle from '../subtitle.vue'

@Component({
  name: 'slogan-container',
  components: {
    homepageSubtitle
  }
})
export default class R extends Vue {

  @Prop({ default: undefined }) title!: string
  @Prop({ default: undefined }) content!: string | string[]
  @Prop({ default: undefined }) data!: homepage.GroupItem[]
  
}
</script>
