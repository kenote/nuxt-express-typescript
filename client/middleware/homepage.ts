import { Context } from '@nuxt/vue-app'
import { oc } from 'ts-optchain'

export default function (context: Context): void {
  let { redirect, route, store } = context
  if (route.path === '/') {
    let { home } = oc(store.state).setting.homepage({})
    return redirect(home ? `/home` : `/login`)
  }
}
