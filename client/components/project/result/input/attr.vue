<template>
  <div>
    <el-input placeholder="请输入内容" v-model="values.val" class="input-with-select" style="width:300px;" @change="handleValueChange">
      <template slot="prepend" >
        <el-select v-model="values.key" placeholder="请选择" style="width:100px;" @change="handleSelectChange">
          <el-option v-for="(item, key) in data" :key="key" :label="key" :value="key"></el-option>
        </el-select>
        <el-select v-if="mode" v-model="values[mode.key]" placeholder="请选择" style="width:100px;margin-left:10px" @change="handleSelectModeChange">
          <el-option v-for="(item, key) in mode.data" :key="key" :label="item.name" :value="item.key"></el-option>
        </el-select>
      </template>
    </el-input>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Watch } from 'nuxt-property-decorator'
import { Maps, Queryer, KeyMap } from 'kenote-config-helper'
import { oc } from 'ts-optchain'

@Component({
  name: 'input-attr',
  created () {
    let self: R = this as R 
    let values: any = {
      key: Object.keys(self.data)[0],
      val: self.data[Object.keys(self.data)[0]]
    }
    if (self.mode) {
      values[self.mode.key] = self.mode.default
      let item: KeyMap<any> | {} = oc(self.mode).data([]).find( o => o.key = self.mode.default ) || {}
      values['val'] = values['val'][item['index'] || 0]
    }
    self.values = values
  },
  mounted () {
    let self: R = this as R
    this.$emit('change', self.values)
  }
})
export default class R extends Vue {

  @Watch('values')
  onValueChange(val: string, oldVal: string): void {
    this.$emit('change', this.values)
  }

  @Prop({ default: undefined }) data!: Maps<any>
  @Prop({ default: undefined }) mode!: Queryer

  @Provide() values: any = {}
  @Provide() options: any[] = []

  handleSelectChange (value: any): void {
    this.values['val'] = this.data[value]
    this.$emit('change', this.values)
  }

  handleSelectModeChange (value: any): void {
    console.log(value)
    let item: KeyMap<any> | {} = oc(this.mode).data([]).find( o => o.key === value ) || {}
    console.log( this.data[Object.keys(this.data)[0]][item['index'] || 0] , item)
    this.values['val'] = this.data[Object.keys(this.data)[0]][item['index'] || 0]
    this.$emit('change', this.values)
  }

  handleValueChange (value: any): void {
    this.$emit('change', this.values)
  }
  
}
</script>