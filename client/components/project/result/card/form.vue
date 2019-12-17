<template>
  <el-form v-if="type === 'dialog'" ref="theForm" :model="values" @submit.native.prevent="submitForm">
    <template v-for="(item, key) in uemit.queryer || []" >
      <el-form-item :key="key" v-if="item.key !== 'mode'" :label="item.name" :prop="item.key" label-width="150px" >
        <!-- Slect -->
        <el-select v-if="item.type === 'select'" 
          v-model="values[item.key]" 
          :multiple="item.multiple" 
          filterable 
          collapse-tags 
          style="min-width: 230px"
          :disabled="item.disabled"
          :placeholder="item.placeholder"
          @change="handleChangeValue">
          <template v-if="item.data">
            <el-option v-for="(d, i) in item.data" :key="i" :label="d.name" :value="d.key"></el-option>
          </template>
          <template v-else-if="item.options">
            <el-option v-for="(d, i) in options[item.options] || []" :key="i" :label="d.name" :value="d.key"></el-option>
          </template>
          <template v-else-if="item.fetch">
            <el-option v-for="(d) in fetchData[item.key] || []" :key="d.key" :label="d.name" :value="d.key.toString()"></el-option>
          </template>
        </el-select>
        <!-- Input Attr -->
        <input-attr v-else-if="item.type === 'input-attr'" 
          :data="values[item.key]"
          :mode="uemit.queryer.find( o => o.key === 'mode' )"
          @change="handleChangeValue"
          />
        <!-- Input Number -->
        <el-input-number v-else-if="item.type === 'input-number'"
          v-model="values[item.key]"
          :min="item.min"
          :max="item.max"
          />
        <!-- Input Text -->
      </el-form-item>
    </template>
    <el-form-item  label-width="150px">
      <el-button type="primary" native-type="submit" >提交</el-button>
    </el-form-item>
  </el-form>
  <el-form v-else ref="theForm" inline :model="values" @submit.native.prevent="submitForm" class="result-card-form">
    <el-form-item style="margin-bottom: 0;width:100%">
      <!-- <el-input v-if="/^(\{)|(\})$/.test(value)" v-model="values.item" style="width:100%">
        <el-select v-model="values.select" slot="prepend" placeholder="请选择" @change="handleChangeSelect">
          <el-option v-for="(v, k) in selectKeys" :key="k" :label="v" :value="v">{{v}}</el-option>
        </el-select>
        <el-button slot="append" icon="el-icon-edit" native-type="submit"></el-button>
      </el-input> -->
      <el-input v-model="values.item" style="width:100%">
        <el-button slot="append" icon="el-icon-edit" native-type="submit"></el-button>
      </el-input>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'nuxt-property-decorator'
import { Columns, ColumnEmit, Maps } from 'kenote-config-helper'
import { Form as ElForm } from 'element-ui'
import { isObject } from 'lodash'
import inputAttr from '../input/attr.vue'
import * as nunjucks from 'nunjucks'
import { oc } from 'ts-optchain'

@Component({
  name: 'card-form',
  components: {
    inputAttr
  },
  created () {
    let self: R = this as R 
    if (isObject(self.value)) {
      self.values = self.value
    }
    else  {
      self.values = {
        item: self.value
      }
    }
    
    
  }
})
export default class R extends Vue {

  @Prop({ default: 'none' }) type!: string
  @Prop({ default: undefined }) uemit!: ColumnEmit
  @Prop({ default: '' }) value!: any
  @Prop({ default: undefined }) fetchData!: Maps<any>

  @Provide() values: any = {}
  @Provide() selectKeys: string[] = []
  @Provide() pvalue?: string

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        let { param, options, api, template, context } = this.uemit
        let _values: Maps<any> = { ...options as Maps<any> }
        if (this.pvalue) {
          _values[param as string || 'param'] = this.pvalue
          console.log('dkdk')
        }
        else {
          if (template) {
            console.log(this.values)
            _values[param as string || 'param'] = nunjucks.renderString(template!, { ...context, ...this.values, ...this.value })
          }
          else {
            _values[param as string || 'param'] = Object.values(this.values).join(':')
          }
        }
        console.log('submit', _values, api)
        this.$emit('submit', _values, api)
      }
      else {
        return false
      }
    })
  }

  handleChangeValue (value) {
    let { key, val, mode } = value
    let { param, options, api, template, context, queryer } = this.uemit
    this.pvalue = nunjucks.renderString(template!, { ...context, key, val, ...this.value, mode })
    
  }
  
}
</script>