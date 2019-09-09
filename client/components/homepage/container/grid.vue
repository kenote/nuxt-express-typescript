<template>
  <fragment>
    <div class="title">{{ title }}</div>
    <homepage-subtitle :content="content" />
    <div class="gridbox" v-bind:class="className">
      <div class="item" v-for="(item, key) in data" :key="key">
        <img :src="item.image" />
        <div class="title">{{ item.title }}</div>
        <template v-if="typeof item.content === 'string'">
          <p>{{ item.content }}</p>
        </template>
        <template v-else>
          <p v-for="(text, k) in item.content" :key="k">{{ text }}</p>
        </template>
        <template v-if="item.button">
          <nuxt-link v-if="/^(\/)/.test(item.button[1] || '')" class="up_button" :to="item.button[1]">{{ item.button[0] }}</nuxt-link>
          <a v-else class="up_button" :href="item.button[1]" :target="item.button[2]" >{{ item.button[0] }}</a>
        </template>
      </div>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop } from 'nuxt-property-decorator'
import * as homepage from '@/types/homepage'
import homepageSubtitle from '../subtitle.vue'

@Component({
  name: 'grid-container',
  components: {
    homepageSubtitle
  }
})
export default class R extends Vue {

  @Prop({ default: undefined }) title!: string
  @Prop({ default: undefined }) content!: string | string[]
  @Prop({ default: undefined }) data!: homepage.GroupItem[]
  @Prop({ default: 2 }) columns!: number
  @Prop({ default: undefined }) className!: string
  
}
</script>
