<template>
  <fragment>
    <slot v-if="projectTag"></slot>
    <el-row v-else :gutter="12">
      <el-col :span="6" v-for="(item, key) in projects" :key="key">
        <el-card shadow="hover">
          <div @click="handleChange(item.label)">
            <span>[{{ item.id }}] {{ item.name }}</span>
            <div class="box">{{ item.description }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!-- 底部选项 -->
    <div class="baseinfo" >
      <div class="submit-box" v-bind:class="showSubmit ? 'is-show' : ''">
        <el-select v-model="projectTag" placeholder="请选择项目" style="margin-right: 10px" @change="handleChange">
          <el-option
            v-for="item in projects"
            :key="item.label"
            :label="`[${item.id}] ${item.name}`"
            :value="item.label">
          </el-option>
        </el-select>
        <slot name="baseinfo"></slot>
      </div>
    </div>
  </fragment>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Watch } from 'nuxt-property-decorator'
import { KenoteConfig } from 'kenote-config-helper'

@Component({
  name: 'project-screen'
})
export default class R extends Vue {

  @Prop({ default: false }) showSubmit!: boolean
  @Prop({ default: [] }) projects!: KenoteConfig.Channel[]
  @Prop({ default: undefined }) tag!: string

  @Provide() projectTag: string = ''

  @Watch('tag')
  onTagChange (val: string, oldVal: string): void {
    this.projectTag = val
  }

  handleChange (value) {
    this.$emit('change', value)
  }
  
}
</script>

<style lang="scss" scoped>
.box {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: #999;
  height: 70px;
  border-top: 1px solid #ccc;
  padding-top: 8px;
  margin-top: 8px;
}
</style>