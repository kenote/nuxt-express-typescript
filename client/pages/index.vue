<template>
  <page>
    <h3>This is Home Page.</h3>
    <el-row>
      <el-button>默认按钮</el-button>
      <el-button type="primary">主要按钮</el-button>
      <el-button type="success">成功按钮</el-button>
      <el-button type="info">信息按钮</el-button>
      <el-button type="warning">警告按钮</el-button>
      <el-button type="danger">危险按钮</el-button>
    </el-row>
    <nuxt-link to="/register">注册</nuxt-link>
  </page>
</template>

<script lang="ts">
import { Component, Vue, Provide } from 'nuxt-property-decorator'


@Component({
  mounted () {
    
  }
})
export default class ItemPage extends Vue {
  
}
</script>