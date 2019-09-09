<template>
  <fragment>
    <div class="title">{{ title }}</div>
    <homepage-subtitle :content="content" />
    <el-collapse class="collapse" v-model="collapse" accordion>
      <template v-for="(group, n) in data">
        <el-collapse-item :key="n" :title="group.title" :name="n">
          <div class="container">
            <div v-for="(item, k) in group.content" :key="k" class="item">
              <div class="title">{{ item.title }}</div>
              <fragment v-for="(text, t) in item.content" :key="t">
                <div class="label">{{ text.title }}</div>
                <div v-if="typeof text.content === 'string'" class="value">{{ text.content }}</div>
                <ul v-else>
                  <li v-for="(label, i) in text.content" :key="i">{{ label }}</li>
                </ul>
              </fragment>
            </div>
          </div>
        </el-collapse-item>
      </template>
    </el-collapse>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop } from 'nuxt-property-decorator'
import * as homepage from '@/types/homepage'
import homepageSubtitle from '../subtitle.vue'

@Component({
  name: 'collapse-container',
  components: {
    homepageSubtitle
  }
})
export default class R extends Vue {

  @Prop({ default: undefined }) title!: string
  @Prop({ default: undefined }) content!: string | string[]
  @Prop({ default: undefined }) data!: homepage.GroupItem[]

  @Provide() collapse: number = 0
  
}
</script>
