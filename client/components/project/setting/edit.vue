<template>
  <div>
    <div class="form-container">
      <h2>编辑配置 : {{ title }}</h2>
      <file-picker 
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        @change="handleFileChange">
        <project-result-table
          :data="files"
          :columns="columns || []"
          :is-show-submit="false"
          >
        </project-result-table>
      </file-picker>
      <el-form v-if="files.length > 0">
        <el-form-item>
          <el-select v-model="values.sheetName" @change="handleSheetNamesChange">
            <el-option v-for="(sheetName, key) in sheetNames" :key="key" :label="sheetName" :value="sheetName"></el-option>
          </el-select>
          <el-input-number v-model="values.start" :min="1" ></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-table :data="[{}]">
            <el-table-column v-for="(item, key) in options.fields || []" 
              :key="key"
              :label="item"
              :width="240"
              :fixed="key === 0"
              >
              <el-select v-model="values[item]">
                <el-option v-for="(field, key) in sheetFields" :key="key" :label="field" :value="field"></el-option>
              </el-select>
            </el-table-column>
            <el-table-column 
              label=""
              :min-width="180"
              fixed="right"
              >
              <el-button type="primary" @click="handleConvert">转换</el-button>
            </el-table-column>
          </el-table>
        </el-form-item>
        <el-form-item>
          <section class="container" >
            <no-ssr placeholder="Codemirror Loading...">
              <codemirror v-model="code" style="height: 500px"
                :options="cmOption" >
              </codemirror>
            </no-ssr>
          </section>
        </el-form-item>
      </el-form>
          
    </div>
    <!-- 操作栏 -->
    <div class="baseinfo" >
      <div class="submit-box" v-bind:class="showSubmit ? 'is-show' : ''">
        <el-button type="primary" @click="handleSubmit" :disabled="data.length === 0">提交</el-button>
        <el-button type="success" style="margin-left:15px" @click="handleBack">返回</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'nuxt-property-decorator'
import filePicker from '../picker/file.vue'
import projectResultTable from '../result/table.vue'
import { Button as ElButton, Input as ElInput, Form } from 'element-ui'
import { Maps, Columns } from 'kenote-config-helper'
import * as xlsx from 'xlsx'
import { readXlsxFileReader, getXlsxFields, getXlsxSheet } from '@/utils/xlsx'
import { omit, set } from 'lodash'
import { oc } from 'ts-optchain'
import 'codemirror/theme/duotone-light.css'
import * as yaml from 'js-yaml'
import { isYaml } from '@/utils'

interface InputFile extends ElInput {
  click: () => void
}

@Component({
  name: 'project-setting-edit',
  components: {
    filePicker,
    projectResultTable
  },
  created () {
    let self: R = this as R 
    setTimeout(() => {
      self.showSubmit = true
    }, 300)
  },
})
export default class R extends Vue {

  @Prop({ default: false }) loading!: boolean
  @Prop({ default: {} }) options!: Maps<any>
  @Prop({ default: '' }) title!: string

  @Provide() showSubmit: boolean = false
  @Provide() values: Maps<string | number> = { start: 1 }
  @Provide() workbook: xlsx.WorkBook | undefined = undefined
  @Provide() sheetNames: string[] = []
  @Provide() sheetFields: string[] = []
  @Provide() data: Maps<any>[] = []
  @Provide() code: string = ''
  @Provide() cmOption: any = {
    tabSize: 2,
    foldGutter: true,
    styleActiveLine: true,
    lineNumbers: true,
    line: true,
    keyMap: "sublime",
    mode: 'application/json',
    theme: 'duotone-light',
    readOnly: true,
  }

  @Provide() files: File[] = []
  @Provide() columns: Columns[] = [
    {
      key: 'name',
      name: '文件名'
    },
    {
      key: 'size',
      name: '文件大小',
      format: [
        {
          type: 'number',
          function: 'bytes'
        }
      ]
    },
    {
      key: 'lastModified',
      name: '最后修改时间',
      format: [
        {
          type : 'date',
          function: 'toLocaleString',
          options: [ 'zh', {
            hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: 'numeric', minute: 'numeric', second: 'numeric'
          }]
        },
        {
          type: 'string',
          function: 'replace',
          options: [ /\//g, '-' ]
        }
      ]
    },
  ]

  handleBack (): void {
    this.$emit('goback', null)
  }

  async handleFileChange (files: File[]): Promise<void> {
    this.files = files
    let workbook: xlsx.WorkBook = await readXlsxFileReader(files[0])
    this.workbook = workbook
    this.sheetNames = workbook.SheetNames
    this.sheetFields = []
    this.values = { start: 1 }
    this.code = ''
  }

  handleSheetNamesChange (name: string): void {
    this.sheetFields = getXlsxFields(this.workbook as xlsx.WorkBook, name)
  }

  handleConvert (): void {
    let { sheetName, start } = this.values
    let values: Maps<string> = omit(this.values, [ 'sheetName', 'start' ]) as Maps<string>
    setTimeout(() => {
      let sheet: xlsx.WorkSheet = getXlsxSheet(this.workbook as xlsx.WorkBook, sheetName as string)
      let data: Maps<any>[] = []
      for (let key in sheet) {
        let index: number = Number(key.replace(/^([A-Z])/, ''))
        let reg: RegExp = new RegExp(`^(${values['key']})`)
        if (reg.test(key) && index >= start) {
          data.push(setItem(values, sheet, index))
        }
      }
      this.data = data
      this.code = JSON.stringify(data, null, 2)
    }, 300)
  }

  handleSubmit (): void {
    let yamlStr: string = yaml.dump(this.data)
    if (!isYaml(yamlStr)) {
      this.$message.warning('数据格式有误！')
      return
    }
    this.$emit('submit', yamlStr)
  }
  
}

function setItem (fields: Maps<string>, sheet: xlsx.WorkSheet, index: number): Maps<any> {
  let data: Maps<any> = {}
  for (let key in fields) {
    set(data, key, oc(sheet)[`${fields[key]}${index}`].v())
  }
  return data
}
</script>

<style lang="scss" >
.form-container .container {
  margin-top: 30px;
  line-height: initial;
  font-size: 12px;

  .CodeMirror {
    height: 100%;
    border: 1px #999999 solid;
  }
}
</style>