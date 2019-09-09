<template>
  <fragment>
    <div class="title">{{ title }}</div>
    <homepage-subtitle :content="content" />
    <el-timeline class="timeline" v-if="data">
      <el-timeline-item v-for="(item, key) in data" :key="key" :timestamp="item.title" placement="top" type="primary">
        <template v-for="(text, k) in item.content">
          <h5 :key="k" v-if="typeof text === 'string'">{{ text }}</h5>
          <link-text :key="k" v-else :text="text.title" :data="text.link" />
        </template>
      </el-timeline-item>
    </el-timeline>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop } from 'nuxt-property-decorator'
import * as homepage from '@/types/homepage'
import homepageSubtitle from '../subtitle.vue'
import linkText from '../../linktext.vue'

@Component({
  name: 'timeline-container',
  components: {
    homepageSubtitle,
    linkText
  }
})
export default class R extends Vue {

  @Prop({ default: undefined }) title!: string
  @Prop({ default: undefined }) content!: string | string[]
  @Prop({ default: undefined }) data!: homepage.GroupItem[][]
  
}
</script>
