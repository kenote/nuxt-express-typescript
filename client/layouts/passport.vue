<template>
  <div class="passport_warpper">
    <passport-header >
      <nuxt class="layout-body" />
    </passport-header>
    
    <passport-footer />
    
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide } from 'nuxt-property-decorator'
import passportHeader from './passport/header.vue'
import passportFooter from './passport/footer.vue'
import '~/assets/scss/passport/warpper.scss'

@Component({
  components: {
    passportHeader,
    passportFooter
  },
  mounted () {
    document.body.className = 'passport_body'
  },
  head () {
    return {
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no'
        }
      ]
    }
  }
})
export default class  extends Vue {

  
  
}
</script>

<style lang="scss">


</style>
