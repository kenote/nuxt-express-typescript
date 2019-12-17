<template>
  <div v-if="column && column.emit">
    <template v-if="column.emit.length === 1">
      <el-button style="margin-top: -10px;" type="text" @click="handleClick(column.emit[0], column.key)">{{ iscancel ? '取消' : column.emit[0].name }}</el-button>
    </template>
    <template v-else>
      <el-dropdown @command="(e) => handleCommand(e, column.key)">
        <span class="el-dropdown-link">
          更多操作<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="(emit, key) in column.emit" :key="key" :command="emit.key">{{ emit.name }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Provide, Vue } from 'nuxt-property-decorator'
import { Columns, ColumnEmit } from 'kenote-config-helper'

@Component({
  name: 'card-edit'
})
export default class  extends Vue {

  @Prop({ default: undefined }) column!: Columns
  @Prop({ default: false }) iscancel!: boolean

  handleClick (value: ColumnEmit, key: string): void {
    this.$emit('uemit', value, key)
  }

  handleCommand (value: string, key: string): void {
    if (!(this.column && this.column.emit)) return
    let _emit: ColumnEmit | undefined = this.column.emit.find( o => o.key === value )
    if (!_emit) return
    this.$emit('uemit', _emit, key)
  }
  
}
</script>