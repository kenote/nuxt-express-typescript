<template>
  <fragment>
    <el-button @click="handleSelectFile">选择文件</el-button>
    <input ref="uploadFile" 
      type="file" 
      :accept="accept" 
      v-show="false" 
      @change="handleSelectFileChange" />
      <slot></slot>
  </fragment>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'nuxt-property-decorator'
import { Input as ElInput} from 'element-ui'

interface InputFile extends ElInput {
  click: () => void
}

@Component({
  name: 'file-picker'
})
export default class R extends Vue {

  @Prop({ default: undefined }) accept!: string

  handleSelectFile (): void {
    let theInput: InputFile = this.$refs['uploadFile'] as InputFile
    theInput.click()
  }

  handleSelectFileChange (evt: any): void {
    let files: File[] = evt.target!['files']
    this.$emit('change', files)
  }
  
}
</script>