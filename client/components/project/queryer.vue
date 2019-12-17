<template>
  <div :class="queryer.length > 0 ? 'search-container' : ''">
    <el-form ref="theForm" label-width="150px" :model="values" :rules="rules" @submit.native.prevent="submitForm" :disabled="loading">
      <template v-for="(item, key) in queryer" >
        <el-form-item :key="key" :label="item.name" :prop="item.key" :rules="rules[item.key]">
          <!-- 单日期选择 -->
          <el-date-picker v-if="item.type === 'date-picker'"
            v-model="values[item.key]"
            size="small"
            :type="item.mode || 'date'"
            @change="handleChangeValue"
            :placeholder="item.placeholder || '选择日期'">
          </el-date-picker>
          <!-- 日期范围选择 -->
          <el-date-picker v-else-if="item.type === 'range-picker'"
            v-model="values[item.key]"
            size="small"
            type="daterange"
            @change="handleChangeValue"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
          <!-- 多选框 -->
          <el-checkbox-group v-else-if="item.type === 'checkbox'" v-model="values[item.key]" @change="handleChangeValue">
            <template v-if="item.data">
              <el-checkbox v-for="(d, i) in item.data" :key="i" :label="d.key">{{ d.name }}</el-checkbox>
            </template>
            <template v-else-if="item.options">
              <el-checkbox v-for="(d, i) in options[item.options] || []" :key="i" :label="d.key">{{ d.name }}</el-checkbox>
            </template>
            <template v-else-if="item.fetch">
              <el-checkbox v-for="(d, i) in fetchData[item.key] || []" :key="i" :label="d.key">{{ d.name }}</el-checkbox>
            </template>
          </el-checkbox-group>
          <!-- 单选框 -->
          <el-radio-group v-else-if="/^(radio)/.test(item.type)" v-model="values[item.key]" size="small" @change="handleChangeValue">
            <template v-if="item.data">
              <template v-if="item.type === 'radio-button'">
                <el-radio-button v-for="(d, i) in item.data" :key="i" :label="d.key">{{ d.name }}</el-radio-button>
              </template>
              <template v-else>
                <el-radio v-for="(d, i) in item.data" :key="i" :label="d.key">{{ d.name }}</el-radio>
              </template>
            </template>
            <template v-else-if="item.options">
              <template v-if="item.type === 'radio-button'">
                <el-radio-button v-for="(d, i) in options[item.options] || []" :key="i" :label="d.key">{{ d.name }}</el-radio-button>
              </template>
              <template v-else>
                <el-radio v-for="(d, i) in options[item.options] || []" :key="i" :label="d.key">{{ d.name }}</el-radio>
              </template>
            </template>
            <template v-else-if="item.fetch">
              <template v-if="item.type === 'radio-button'">
                <el-radio-button v-for="(d, i) in fetchData[item.key] || []" :key="i" :label="d.key">{{ d.name }}</el-radio-button>
              </template>
              <template v-else>
                <el-radio v-for="(d, i) in fetchData[item.key] || []" :key="i" :label="d.key">{{ d.name }}</el-radio>
              </template>
            </template>
          </el-radio-group>
          <!-- 渠道选择器 -->
          <!-- <ditch-picker v-else-if="item.type === 'ditch-picker'" 
            :value="values[item.key]" 
            :ditchs="ditchs"
            @get-ditchs="handleGetDitchs"
            @change="handleChangeDitch">
          </ditch-picker> -->
          <!-- 渠道2选择器 -->
          <ditch2-picker v-else-if="item.type === 'ditch-picker'" 
            v-model="values[item.key]"
            :multiple="item.multiple"
            @get-ditchs="handleGetDitchs" >
          </ditch2-picker>
          <!-- 道具物品选择器 -->
          <item-picker v-else-if="item.type === 'item-picker'"
            v-model="values[item.key]"
            :fetch="item.fetch"
            @fetch-data="handleFetchData"
            >
          </item-picker>
          <!-- 组选择器 -->
          <group-picker v-else-if="item.type === 'group-picker'"
            v-model="values[item.key]"
            :fetch="item.fetch"
            :multiple="item.multiple"
            :grouping="item.grouping"
            @fetch-data="handleFetchData">
          </group-picker>
          <!-- 下拉选择器 -->
          <el-select v-else-if="item.type === 'select'" 
            v-model="values[item.key]" 
            :multiple="item.multiple" 
            filterable 
            collapse-tags
            style="min-width: 230px" 
            :placeholder="item.placeholder"
            @change="handleChangeValue">
            <template v-if="item.data">
              <el-option v-for="(d, i) in item.data" :key="i" :label="d.name" :value="d.key"></el-option>
            </template>
            <template v-else-if="item.options">
              <el-option v-for="(d, i) in options[item.options] || []" :key="i" :label="d.name" :value="d.key"></el-option>
            </template>
            <template v-else-if="fetchData[item.key]">
              <el-option v-for="(d, ) in fetchData[item.key] || []" :key="d.key" :label="d.name" :value="d.key"></el-option>
            </template>
          </el-select>
          <!-- Input Number -->
          <el-input-number v-else-if="item.type === 'input-number'"
            v-model="values[item.key]"
            :min="item.min"
            :max="item.max"
            size="small"
            @change="handleChangeValue"
            />
          <!-- 多行文字输入框 -->
          <el-input v-else-if="item.type === 'textarea'" style="width: 450px"
            type="textarea"
            :rows="6"
            :placeholder="item.placeholder || '请输入内容'"
            v-model="values[item.key]"
            resize="none"
            @change="handleChangeValue"
            >
          </el-input>
          <!-- 单行文字输入框 -->
          <el-input v-else 
            :disabled="item.disabled" 
            :placeholder="item.placeholder" 
            v-model="values[item.key]" 
            size="small" 
            :style="`width: ${submitOptions && submitOptions.result === 'message' ? `450` : `220`}px`" 
            @change="handleChangeValue" />
        </el-form-item>
      </template>
      <div v-if="queryer.length > 0" class="footer" style="padding-left: 0; margin-left: 0">
        <el-form-item >
          <el-select v-if="rtsps && rtsps.length > 1" v-model="rtspOptions.value" style="width: 100px;">
            <el-option v-for="(item, key) in rtsps" :key="key" :label="item" :value="item"></el-option>
          </el-select>
          <el-button v-if="times === 0" type="primary" native-type="submit" :loading="loading">{{ submitOptions && submitOptions.name || '立即查询' }}</el-button>
          <el-button v-else type="primary" disabled >({{ times }} 秒后) {{ submitOptions && submitOptions.name || '开始查询' }}</el-button>
          <el-button v-if="submitOptions && submitOptions.reset" plain @click="resetForm">重置</el-button>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue, Watch } from 'nuxt-property-decorator'
import { Queryer, Maps, Rule, Submit, KeyMap, Fetch } from 'kenote-config-helper'
import { parseDefaultValue, formatString } from '@/utils'
import ditchPicker from './picker/ditch.vue'
import ditch2Picker from './picker/ditch2.vue'
import itemPicker from './picker/item.vue'
import groupPicker from './picker/group.vue'
import { responseDocument as responseDitchDocument } from '@/types/proxys/ditch'
import { Form as ElForm } from 'element-ui'
import { omit, zipObject, map, isArray } from 'lodash'
import { oc } from 'ts-optchain'
import { Rstps } from 'kenote-config-helper/types/submit'

@Component({
  name: 'project-queryer',
  components: {
    ditchPicker,
    ditch2Picker,
    itemPicker,
    groupPicker
  },
  created () {
    let self: R = this as R
    let values: Maps<any> = {}
    let rules: Maps<Rule[]> = {}
    for (let item of self.queryer) {
      if (['radio-button', 'checkbox', 'radio', 'select'].includes(item.type) && item.fetch) {
        self.handleFetchData(item.fetch, item.key)
      }
      values[item.key] = parseDefaultValue(item.default)
      if (item.rules) {
        rules[item.key] = item.rules
      }
    }
    let rtspValue: string = 'Slave'
    if (self.rtsps.length === 1) {
      rtspValue = self.rtsps[0]
    }
    self.values = values
    self.rules = rules
    self.rtspOptions = oc(self).submitOptions.rstps({ value: rtspValue, params: 'headers:rtsp_key' })
  },
  mounted () {
    let self: R = this as R
    self.autoSubmit && self.submitForm()
  }
})
export default class R extends Vue {

  @Prop({ default: [] }) queryer!: Queryer[]
  @Prop({ default: {} }) options!: Maps<number | string | KeyMap<string>[]>
  @Prop({ default: false }) loading!: boolean
  @Prop({ default: undefined }) ditchs!: responseDitchDocument[]
  @Prop({ default: 0 }) times!: number
  @Prop({ default: undefined }) submitOptions!: Submit
  @Prop({ default: false }) refresh!: boolean
  @Prop({ default: false }) autoSubmit!: boolean
  @Prop({ default: undefined }) rtsps!: string[]

  @Provide() values: Maps<any> = {}
  @Provide() rules: Maps<Rule[]> = {}
  @Provide() fetchData: Maps<KeyMap<string>[]> = {}
  @Provide() rtspOptions: Rstps = { value: 'Slave', params: 'headers:rtsp_key' }

  @Watch('refresh')
  onRefreshChange (val: boolean, oldVal: boolean): void {
    val && this.submitForm()
  }

  handleGetDitchs (next?: (doc: any) => void): void {
    this.$emit('get-ditchs', next)
  }

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        // let obj: Queryer | undefined = this.queryer.find( o => o.type === 'ditch-picker' )
        // if (obj && obj.required) {
        //   if (!this.values[obj.key] || this.values[obj.key].length === 0) {
        //     this.$message({
        //       message: '请选择渠道！！！',
        //       type: 'warning'
        //     })
        //     return
        //   }
        // }
        let queryers: Queryer[] = this.queryer.filter( o => o.required )
        for (let queryer of queryers) {
          let { key, name } = queryer
          if (!this.values[key] || this.values[key].length === 0) {
            this.$message({
              message: `请选择${name}！！！`,
              type: 'warning'
            })
            return
          }
        }
        let values = omit(this.values, ['begin_end'])
        if (this.values['begin_end']) {
          values = {
            ...values,
            ...zipObject(['begin', 'end'], this.values['begin_end'])
          }
        }
        if (this.values['roleId']) {
          let queryer: Queryer | undefined = this.queryer.find( o => !!o.cardinal )
          if (queryer && queryer.cardinal) {
            values['roleId'] = values['roleId'].map( label => this.parseCardinal(label, queryer!.cardinal!) )
          }
        }
        this.queryer.filter( o => o.format && values[o.key] ).map( o => {
          values[o.key] = formatString(values[o.key], o.format)
        })
        for (let v in values) {
          if (isArray(values[v])) {
            values[v] = values[v].filter( o => o || o === 0 )
          }
        }
        // if (oc(this.submitOptions).options()) {
        //   let { options, alias } = this.submitOptions
        // }
        this.$emit('submit', values, this.rtspOptions, this.refresh)
      }
      else {
        return false
      }
    })
  }

  parseCardinal (label: string, key: string) {
    let ditch: responseDitchDocument | undefined = this.ditchs.find( o => o.label === label )
    let cardinal: number = oc(ditch).cardinal_number({})[key] || 1
    return `${label}:${cardinal}`
  }

  resetForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    // let obj: Queryer | undefined = this.queryer.find( o => ['item-picker', 'ditch-picker', 'group-picker'].includes(o.type))
    // if (obj) {
    //   let _key: string = obj.key
    //   // console.log(_key)
    //   // this.values[_key] = undefined
    // }
    //this.handleChangeValue()
    
    theForm.resetFields()
  }

  handleFetchData (fetch: Fetch | string, key: string, next?: (doc: any) => void): void {
    if (next) {
      this.$emit('fetch-data', fetch, next)
    }
    else {
      this.$emit('fetch-data', fetch, (data: any) => {
        this.fetchData[key] = data
      })
    }
    
  }

  handleChangeValue (): void {

  }

  handleChangeDitch (values: string[]): void {
    let obj: Queryer | undefined = this.queryer.find( o => o.type === 'ditch-picker')
    if (obj) {
      let _key: string = obj['key']
      this.values[_key] = values
    }
    this.handleChangeValue()
  }
  
}
</script>