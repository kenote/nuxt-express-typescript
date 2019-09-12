<template>
  <fragment>
    <div class="layout-footer">
      <div class="container top">
        <div class="left" v-if="navigation">
          <div v-for="(item, key) in navigation" :key="key" class="menu" >
            <div class="title">{{ item.title }}</div>
            <text-link v-for="(text, k) in item.content" :key="k" :data="text.slice(1)" :text="text[0] || ''"></text-link>
          </div>
          <div class="line"></div>
        </div>
        <div class="right" v-if="support && support.links">
          <div v-for="(item, key) in support.links" :key="key" class="menu" >
            <div class="title">{{ item.title }}</div>
            <fragment v-for="(text, k) in item.content" :key="k">
              <template v-if="Array.isArray(text)">
                <template v-if="isEmail(text[1] || '')">
                  <span>{{ text[0] || '' }}<a :href="text[2] || ''" class="inline">{{ text[1] || '' }}</a></span>
                </template>
                <text-link v-else :data="text.slice(1)" :text="text[0] || ''"></text-link>
              </template>
              <a v-else class="normal">{{ text }}</a>
            </fragment>
          </div>
        </div>
        <div class="links" v-if="support && support.follow">
          <template v-for="(item, key) in support.follow">
            <fragment :key="key">
              <a v-if="item.content[1][0] === 'qrcode'" :class="item.content[0]">
                <div class="qrcode">
                  <img :src="item.content[1][1]" :width="92" />
                  <div class="triangle-down" />
                </div>
              </a>
              <a v-else :class="item.content[0]" :href="item.content[1][1]" :target="item.content[1][2]"></a>
            </fragment>
          </template>
        </div>
      </div>
      <div class="line"></div>
      <div class="icp">
        {{ copyright }}
        <no-ssr>
          <div v-if="description" v-html="md.render(description)"></div>
        </no-ssr>
        <fragment v-if="icps">
          <fragment v-for="(item, key) in icps" :key="key">
            <img v-if="item.image" :src="item.image" />
            <a :href="item.link" :target="item.target">{{ item.name }}</a>
          </fragment>
        </fragment>
      </div>
    </div>
  </fragment>
</template>


<script lang="ts">
import { Component, Vue, Prop, Provide } from 'nuxt-property-decorator'
import homepage from '@/types/homepage'
import * as markdownIt from 'markdown-it'
import { Maps } from 'kenote-config-helper'
import textLink from '~/components/linktext.vue'
import { isEmail } from 'validator'

@Component({
  name: 'home-footer',
  components: {
    textLink
  },
  created () {
    let self: R = this as R
    if (self.data) {
      let { copyright, description, icps, navigation, support } = self.data
      if (copyright) {
        self.copyright = copyright
      }
      self.description = description
      if (icps) {
        self.icps = icps.map( o => {
          let [ name, link, target, image ] = o
          return { name, link, target, image }
        })
      }
      self.navigation = navigation
      self.support = support
    }
  }
})
export default class R extends Vue {

  @Prop({ default: undefined }) data!: homepage.Footer

  @Provide() copyright?: string = '© 2019 Kenote 前端实验室'
  @Provide() description?: string = undefined
  @Provide() icps?: Record<'name' | 'link' | 'target' | 'image', string>[] = undefined
  @Provide() navigation?: homepage.GroupItem[] = undefined
  @Provide() support?: Maps<homepage.GroupItem[]> = undefined

  md = markdownIt()

  isEmail = isEmail
}
</script>