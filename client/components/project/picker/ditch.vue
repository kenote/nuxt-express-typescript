<template>
  <div style="margin-right: 15px" v-loading="loading">

    <div>
      <el-checkbox :indeterminate="isIndeterminateAll" v-model="checkAll" @change="handleCheckAllChange" style="margin-right:30px;">全选</el-checkbox>
      <el-input size="mini" v-model="searchall" style="width: 150px;" @change="handleInputSearch" >
        <i slot="suffix" class="el-icon-error" @click="handleCleanSearchAll" v-if="searchall"></i>
      </el-input>
      <el-checkbox-group v-model="values" @change="handleCheckChange" style="max-height:120px;overflow-y:auto;">
        <template v-for="ditch in ditchs">
          <el-checkbox :label="ditch.label" :key="ditch._id" v-show="searchAllDitch(ditch.name)">{{ ditch.name }}</el-checkbox>
        </template>
      </el-checkbox-group>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'nuxt-property-decorator'
import { responseDocument as responseDitchDocument } from '@/types/proxys/ditch'

@Component({
  name: 'ditch-picker',
  created () {
    let self: R = this as R
    self.$emit('get-ditchs')
  }
})
export default class R extends Vue {

  @Prop({ default: [] }) ditchs!: responseDitchDocument[]
  @Prop({ default: false }) loading!: boolean

  @Provide() searchall: string = ''
  @Provide() values: string[] = []
  @Provide() checkAll: boolean = false
  @Provide() isIndeterminateAll: boolean = false

  searchAllDitch (value: string): boolean {
    if (this.searchall === '*') return true
    return new RegExp(this.searchall).test(value)
  }

  handleCheckChange (values: string[]): void {
    let checkedCount = values.length
    this.checkAll = checkedCount === this.ditchs.length
    this.isIndeterminateAll = checkedCount > 0 && checkedCount < this.ditchs.length 
    // this.selectedPlan = ''
    this.$emit('change', values)
  }

  handleCheckAllChange (value: any): void {
    let _ditchs: responseDitchDocument[] = this.ditchs
    if (value) {
      this.values = Array.from(new Set(this.values.concat(_ditchs.map( o => o.label ))))
    }
    else {
      this.values = this.values.filter( v => _ditchs.map( o => o.label ).indexOf(v) === -1 )
    }
    this.isIndeterminateAll = false
    this.$emit('change', this.values)
  }

  handleInputSearch (value: string): void {
    console.log(value)
  }

  handleCleanSearchAll (): void {
    this.searchall = ''
  }
  
}
</script>