import { Context } from '@nuxt/vue-app'
import * as auth from '~/store/modules/auth'
import { responseDocument as responseUserDocument } from '@/types/proxys/user'

export default function (context: Context): void {
  let { store, redirect, route } = context
  let Auth: auth.State = store.state.auth
  let user: responseUserDocument = Auth.user!
  if (!user) {
    return redirect(`/login`, { url_callback: route.path })
  }
}
