<template>
  <div style="margin-right: 15px">

    <div>
      <el-checkbox v-if="multiple" :indeterminate="isIndeterminateAll" v-model="checkAll" @change="handleCheckAllChange" style="margin-right:30px;">全选</el-checkbox>
      <el-input size="mini" v-model="searchall" style="width: 150px;" @change="handleInputSearch" placeholder="检索内容" >
        <i slot="suffix" class="el-icon-error" @click="handleCleanSearchAll" v-if="searchall"></i>
      </el-input>
      <el-checkbox-group v-if="multiple" v-model="values" @change="handleCheckChange" style="max-height:120px;overflow-y:auto;">
        <template v-for="ditch in data">
          <el-checkbox :label="ditch.label" :key="ditch._id" v-show="searchAllDitch(ditch.name)">{{ ditch.name }}</el-checkbox>
        </template>
      </el-checkbox-group>
      <el-radio-group v-else v-model="values" @change="handleCheckChange" style="max-height:120px;overflow-y:auto;display:block;line-height:40px;margin-top:8px;">
        <template v-for="ditch in data">
          <el-radio :label="ditch.label" :key="ditch._id" v-show="searchAllDitch(ditch.name)">{{ ditch.name }}</el-radio>
        </template>
      </el-radio-group>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Watch, Model } from 'nuxt-property-decorator'
import { responseDocument as responseDitchDocument } from '@/types/proxys/ditch'

@Component({
  name: 'ditch2-picker',
  created () {
    let self: R = this as R 
    self.$emit('get-ditchs', (data: responseDitchDocument[]) => {
      self.data = data
    })
    self.values = self.value || []
  }
})
export default class R extends Vue {

  @Prop({ default: true }) multiple!: boolean

  @Provide() data: responseDitchDocument[] = []
  @Provide() values: string[] = []
  @Provide() checkAll: boolean = false
  @Provide() isIndeterminateAll: boolean = false
  @Provide() searchall: string = ''

  @Model('update') readonly value!: string[]

  @Watch('value')
  onValueChange (val: string[], oldVal: string[]): void {
    if (val.length === 1 && val[0] === undefined) {
      this.values = []
      this.handleCheckChange(this.values)
    }
  }

  handleCheckChange (values: string[]): void {
    this.$emit('update', values)
    let checkedCount = values.length
    this.checkAll = checkedCount === this.data.length
    this.isIndeterminateAll = checkedCount > 0 && checkedCount < this.data.length 
    // // this.selectedPlan = ''
    // this.$emit('change', values)
  }

  handleCheckAllChange (value: any): void {
    let _ditchs: responseDitchDocument[] = this.data
    if (value) {
      this.values = Array.from(new Set(this.values.concat(_ditchs.map( o => o.label ))))
    }
    else {
      this.values = this.values.filter( v => _ditchs.map( o => o.label ).indexOf(v) === -1 )
    }
    this.isIndeterminateAll = false
    this.$emit('update', this.values)
  }

  handleInputSearch (value: string): void {
    console.log(value)
  }

  handleCleanSearchAll (): void {
    this.searchall = ''
  }

  searchAllDitch (value: string): boolean {
    if (this.searchall === '*') return true
    return new RegExp(this.searchall).test(value)
  }
  
}
</script>