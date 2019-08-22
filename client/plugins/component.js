import Vue from 'vue'
import Fragment from 'vue-fragment'
import Page from '~/components/page.vue'
import ErrorPage from '~/components/error-page.vue'
import Breadcrumb from '~/components/breadcrumb.vue'

export default () => {
  Vue.use(Fragment.Plugin)
  Vue.component('page', Page)
  Vue.component('error-page', ErrorPage)
  Vue.component('breadcrumb', Breadcrumb)
}