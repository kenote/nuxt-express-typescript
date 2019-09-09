<template>
  <section :class="className" :style="background">
    <template v-if="container">
      <!-- 文字简介 -->
      <template v-if="container.type === 'none'">
        <text-container :title="container.title" :content="container.content" />
      </template>
      <!-- 标语口号 -->
      <template v-else-if="container.type === 'slogan'">
        <slogan-container :title="container.title" :content="container.content" :data="container.groups" />
      </template>
      <!-- 时间线 -->
      <template v-else-if="container.type === 'timeline'">
        <timeline-container :title="container.title" :content="container.content" :data="container.groups" />
      </template>
      <!-- 折叠面板 -->
      <template v-else-if="container.type === 'collapse'">
        <collapse-container :title="container.title" :content="container.content" :data="container.groups" />
      </template>
      <!-- 栅格化 -->
      <template v-else-if="/^(grid)/.test(container.type)">
        <grid-container 
          :columns="Number(container.type.replace(/^(grid)\-(\d+)/i, '$2'))"
          :class-name="container.className"
          :title="container.title" 
          :content="container.content" 
          :data="container.groups" />
      </template>
      <!-- 地图 -->
      <template v-else-if="container.type === 'mapcontent'">
        <map-container :title="container.title" :content="container.content" :data="container.groups" />
      </template>
      <!-- logo墙/友情链接 -->
      <template v-else-if="['logos', 'links'].includes(container.type)">
        <logos-container 
          :title="container.title" 
          :class-name="container.className || container.type"
          :content="container.content" 
          :data="container.groups" />
      </template>
      <!-- section -->
      <template v-else-if="/^(section)/.test(container.type)">
        <section-container :content="container.content" :data="container.groups" />
      </template>

    </template>
  </section>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop } from 'nuxt-property-decorator'
import * as homepage from '@/types/homepage'
import textContainer from './container/text.vue'
import sloganContainer from './container/slogan.vue'
import timelineContainer from './container/timeline.vue'
import collapseContainer from './container/collapse.vue'
import gridContainer from './container/grid.vue'
import mapContainer from './container/map.vue'
import logosContainer from './container/logos.vue'
import sectionContainer from './container/section.vue'

@Component({
  name: 'homepage-section',
  components: {
    textContainer,
    sloganContainer,
    timelineContainer,
    collapseContainer,
    gridContainer,
    mapContainer,
    logosContainer,
    sectionContainer
  },
  created () {
    let self: R = this as R
  }
})
export default class R extends Vue {

  @Prop({ default: undefined }) className!: string
  @Prop({ default: undefined }) background!: homepage.Background
  @Prop({ default: undefined }) container!: homepage.Container
  
}
</script>
