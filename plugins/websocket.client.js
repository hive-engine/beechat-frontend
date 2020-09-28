import Vue from 'vue'
import VueNativeSock from 'vue-native-websocket'

export default ({ store, $config }, inject) => {
  Vue.use(VueNativeSock, $config.websocketUrl, {
    store,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 3000,
    connectManually: true
  })

  const vm = new Vue()

  inject('websocket', vm)
}
