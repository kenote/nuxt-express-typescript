<template>
  <div class="landing-body">
    <h3>{{ name }}</h3>
    <el-form ref="theForm" :model="values" :rules="rules" @submit.native.prevent="submitForm" >
      <el-form-item prop="cdkey" :rules="rules.cdkey">
        <el-input :placeholder="`请输入您的${name}`" v-model="values.cdkey" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading">下一步</el-button>
      </el-form-item>
      <slot></slot>
    </el-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide } from 'nuxt-property-decorator'
import { Rule, Maps } from 'kenote-config-helper'
import { isUUID } from 'validator'
import { Form as ElForm } from 'element-ui'

interface Values {
  cdkey?: string
}

@Component({
  name: 'passport-ticket',
  mounted () {
    
  }
})
export default class  extends Vue {

  @Prop({ default: '兑换码' }) name!: string
  @Prop({ default: false }) loading!: boolean

  @Provide() values: Values = { }
  @Provide() rules: Maps<Rule[]> = {
    cdkey: [
      { required: true, message: `请输入${this.name}`},
      { validator: this.validateCDKey }
    ]
  }

  validateCDKey (rule: any, value: any, callback: (message?: string) =>any): (message?: string) => any {
    let valid: boolean = isUUID(value, 4)
    if (!valid) {
      return callback(`请输入正确的${ this.name }`)
    }
    return callback()
  }

  submitForm (): void {
    let theForm: ElForm = <ElForm> this.$refs['theForm']
    theForm.validate((valid: any): void | false => {
      if (valid) {
        let { cdkey } = this.values
        this.$emit('submit', cdkey)
      }
      else {
        return false
      }
    })
  }
}
</script>