<template>
  <fragment v-if="multiple">
    <el-tabs v-model="activeGroup" @tab-click="handleClickGroup" type="card" style="margin-right: 15px">
      <el-tab-pane v-for="group in data" :key="group.key" :label="group.name" :name="group.key">
        <el-checkbox-group v-model="values" @change="handleCheckChange" style="max-height:120px;overflow-y:auto;">
          <template v-for="item in group.children || []">
            <el-checkbox :label="item.key" :key="item.key">{{ item.name }}</el-checkbox>
          </template>
        </el-checkbox-group>
      </el-tab-pane>
    </el-tabs>
  </fragment>
  <fragment v-else>
    <el-cascader :props="options" :options="data" v-model="values" @change="handleCheckChange" size="small" />
  </fragment>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Model, Watch } from 'nuxt-property-decorator'
import { KeyMap } from 'kenote-config-helper'
import { GroupData } from '@/types'

@Component({
  name: 'group-picker',
  created () {
    let self: R = this as R 
    if (self.fetch) {
      this.$emit('fetch-data', self.fetch, self.label || 'group-data', (data: GroupData[]): void => {
        self.data = data
      })
    }
    if (self.value && self.multiple) {
      self.values = self.value as string[]
    }
  }
})
export default class R extends Vue {

  @Prop({ default: undefined }) label!: string
  @Prop({ default: undefined }) fetch!: string
  // @Prop({ default: null }) data!: GroupData[]
  @Prop({ default: false }) multiple!: boolean
  @Prop({ default: false }) grouping!: boolean
  
  @Provide() data: GroupData[] = []
  @Provide() activeGroup: string = ''
  @Provide() values: string[] | string = []
  @Provide() options: any = {
    label: 'name',
    value: 'key'
  }

  @Model('update') readonly value!: string[] | string

  @Watch('data')
  onDataChange (vals: GroupData[], oldVals: GroupData[]): void {
    if (vals && vals.length > 0) {
      if (this.multiple) {
        this.activeGroup = vals[0].key
      }
      else {
        let values: string[] = [ this.value as string ]
        for (let val of vals) {
          let item: KeyMap<string> | undefined = val.children.find( o => o.key == this.value )
          if (item) {
            values.splice(0, 0, val.key)
            break
          }
        }
        this.values = values
      }
    }
  }

  @Watch('value')
  onValueChange (val: string[] | string, oldVal: string[] | string): void {
    if (this.multiple) {
      this.values = val || []
    }
    else if (!val) {
      this.values = [ undefined! ]
    }
  }

  handleClickGroup (group: any, event: MouseEvent): void {
    if (!this.grouping) return
    this.values = []
    this.$emit('update', this.values)
  }

  handleCheckChange (values: string[]): void {
    this.$emit('update', this.multiple ? values : values[1])
  }
  
}
</script>