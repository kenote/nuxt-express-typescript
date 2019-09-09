<template>
  <fragment>
    <div class="title">{{ title }}</div>
    <homepage-subtitle :content="content" />
    <fragment v-if="data">
      <template v-if="data.length > 1">
        <el-tabs v-model="activeName">
          <el-tab-pane v-for="(item, key) in data" :key="key" :label="item.title" :name="item.title" class="mapcontent">
            <no-ssr>
              <el-amap :vid="`amapDemo-${key}`"  
                :center="item.amap.center" 
                :amap-manager="amapManager" 
                :zoom="14" 
                :plugin="plugin" 
                :events="events" 
                class="map" >
                <el-amap-marker vid="component-marker" :position="item.amap.position" ></el-amap-marker>
              </el-amap>
            </no-ssr>
            <div class="content">
              <div class="title">{{ item.title }}</div>
              <fragment v-for="(text, k) in item.content" :key="k">
                <div class="caption">{{ text.title }}</div>
                <p>{{ text.content }}</p>
              </fragment>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
      <template v-else>
        <div v-for="(item, key) in data" :key="key" class="mapcontent">
          <no-ssr>
            <el-amap :vid="`amapDemo-${key}`"  
              :center="item.amap.center" 
              :amap-manager="amapManager" 
              :zoom="14" 
              :plugin="plugin" 
              :events="events" 
              class="map" >
              <el-amap-marker vid="component-marker" :position="item.amap.position" ></el-amap-marker>
            </el-amap>
          </no-ssr>
          <div class="content">
            <div class="title">{{ item.title }}</div>
            <fragment v-for="(text, k) in item.content" :key="k">
              <div class="caption">{{ text.title }}</div>
              <p>{{ text.content }}</p>
            </fragment>
          </div>
        </div>
      </template>
    </fragment>
  </fragment>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop } from 'nuxt-property-decorator'
import * as homepage from '@/types/homepage'
import homepageSubtitle from '../subtitle.vue'
import VueAMap from 'vue-amap'

@Component({
  name: 'map-container',
  components: {
    homepageSubtitle
  },
  created () {
    let self: R = this as R
    // 初始化vue-amap
    VueAMap.initAMapApiLoader({
      // 高德的key
      key: '4b5f2cf2cba25200cc6b68c398468899',
      // 插件集合
      plugin: ['AMap.Autocomplete', 'AMap.PlaceSearch', 'AMap.Scale', 'AMap.OverView', 'AMap.ToolBar', 'AMap.MapType', 'AMap.PolyEditor', 'AMap.CircleEditor'],
      // 高德 sdk 版本，默认为 1.4.4
      v: '1.4.4'
    })
    if (self.data) {
      self.activeName = self.data[0].title
    }
  }
})
export default class R extends Vue {

  @Prop({ default: undefined }) title!: string
  @Prop({ default: undefined }) content!: string | string[]
  @Prop({ default: undefined }) data!: homepage.GroupItem[]

  @Provide() activeName?: string = undefined
  @Provide() amapManager = new VueAMap.AMapManager()
  @Provide() events = {}
  @Provide() plugin = ['ToolBar', {
    pName: 'OverView',
    defaultType: 1,
    events: {
      init(o) {
        
      }
    }
  }]
  
}
</script>
