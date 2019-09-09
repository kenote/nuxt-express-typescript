<template>
  <fragment>
    <div v-if="styles" class="lines" :style="styles" />
    <div class="container" v-bind:class="className">
      <template v-if="data">
        <fragment v-for="(item, key) in data" :key="key">
          <template v-if="item.image">
            <div v-if="/(\s|\;)/.test(item.image)" :class="item.title" :style="item.image" />
            <div v-else :class="item.title">
              <img :src="item.image" />
            </div>
          </template>
          <div v-else-if="Array.isArray(item.content)" :class="item.title">
            <div v-for="(block, n) in item.content" :key="n" class="block">
              <div class="title">{{ block.title }}</div>
              <div class="numbers">
                <template v-for="(text, i) in block.content">
                  <div :key="i" v-if="i % 2 === 0" class="item">
                    <div :class="text.replace(/^\{(\w+|)\}([\S|\s]+)$/, '$1') || 'text'">{{ text.replace(/^(\{)(\w+|)(\})/, '') }}</div>
                    <div class="text">{{ block.content[i+1] || '' }}</div>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <div v-else :class="item.title">
            <div class="title">{{ item.content.title }}</div>
            <homepage-subtitle v-if="item.content.content" :content="item.content.content" class-name="description" />
            <template v-if="item.button">
              <nuxt-link v-if="/^(\/)/.test(item.button[1] || '')" class="up_button major" :to="item.button[1]">{{ item.button[0] }}</nuxt-link>
              <a v-else class="up_button major" :href="item.button[1]" :target="item.button[2]" >{{ item.button[0] }}</a>
            </template>
          </div>
        </fragment>
      </template>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop } from 'nuxt-property-decorator'
import * as homepage from '@/types/homepage'
import homepageSubtitle from '../subtitle.vue'

@Component({
  name: 'section-container',
  components: {
    homepageSubtitle
  },
  created () {
    let self: R = this as R
    if (!self.content) return
    if (typeof self.content !== 'string') {
      let [ className, styles ] = self.content || [ undefined, '' ]
      self.className = className
      self.styles = styles
    }
  }
})
export default class R extends Vue {

  @Prop({ default: undefined }) content!: string | string[]
  @Prop({ default: undefined }) data!: homepage.GroupItem[]

  @Provide() className?: string = undefined
  @Provide() styles?: string = undefined
  
}
</script>
