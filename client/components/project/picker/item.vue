<template>
  <fragment>
    <div v-for="(val, key) in values" :key="key">
      <el-select v-model="val.id" placeholder="请选择道具" filterable size="small" @change="handleChangeValue">
        <el-option v-for="item in data" :key="item.key" :label="`[${item.key}] ${item.name}`" :value="item.key"></el-option>
      </el-select>
      <el-input-number v-model="val.num" size="small" controls-position="right" :min="1" :precision="0" @change="handleChangeValue"></el-input-number>
      <el-button icon="el-icon-close" circle size="mini" style="margin-left:50px" @click="handleRemoveItem(key)"></el-button>
    </div>
    <el-button size="small" @click="handleAddItem" style="width:330px" :disabled="isAddItem()">添加道具</el-button>
  </fragment>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Model, Watch } from 'nuxt-property-decorator'
import { KeyMap } from 'kenote-config-helper'
import { ItemModel } from '@/types/project'

interface Values {
  id     ?: string | number
  num     : number
}

@Component({
  name: 'item-picker',
  created () {
    let self: R = this as R 
    if (self.fetch) {
      this.$emit('fetch-data', self.fetch, 'item', (data: KeyMap<string>[]): void => {
        self.data = data
      })
    }
    if (self.value) {
      self.values = self.value.map(parseValue)
    }
  }
})
export default class R extends Vue {

  @Prop({ default: undefined }) fetch!: string
  // @Prop({ default: null }) data!: KeyMap<string>[]

  @Provide() data: ItemModel[] = []
  @Provide() values: Values[] = []

  @Model('update') readonly value!: string[]

  @Watch('value')
  onValueChange (val: string[], oldVal: string[]): void {
    if (val.length === 1 && val[0] === undefined) {
      this.values = []
    }
  }

  handleAddItem (): void {
    this.values.push({ id: '', num: 1 })
    this.handleChangeValue()
  }

  handleRemoveItem (key: number): void {
    this.values.splice(key, 1)
    this.handleChangeValue()
  }

  handleChangeValue (): void {
    let values: string[] = this.values.filter( o => o.id ).map( o => Object.values(o).join(',') )
    this.$emit('update', values)
  }

  isAddItem (): boolean {
    return !!this.values.find( o => !o.id )
  }
  
  
}

function parseValue (data: string): Values {
  let [id, num] = data.split(',')
  return {
    id, num: Number(num)
  }
}
</script>