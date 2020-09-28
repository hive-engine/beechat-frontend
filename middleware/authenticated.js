export default function ({ route, store, redirect }) {
  // If the user is not authenticated
  if (!store.state.user.authenticated) {
    return redirect(`/?redirect=${route.fullPath}`)
  }
}
