import { Context } from '@nuxt/vue-app'

export default function (context: Context): void {
  let { redirect, route } = context
  if (route.path === '/') {
    return redirect(`/home`)
  }
}
