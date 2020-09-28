export default {
  /*
  ** Nuxt target
  ** See https://nuxtjs.org/api/configuration-target
  */
  target: 'server',
  /*
  ** Headers of the page
  ** See https://nuxtjs.org/api/configuration-head
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
  ** Global CSS
  */
  css: [
    'emoji-mart-vue-fast/css/emoji-mart.css',
    '@/assets/scss/app.scss'
  ],
  /*
  ** Plugins to load before mounting the App
  ** https://nuxtjs.org/guide/plugins
  */
  plugins: [
    '@/plugins/event-bus.client.js',
    '@/plugins/websocket.client.js',
    '@/plugins/vue-chat-scroll.client.js',
    '@/plugins/vue-icon.js',
    '@/plugins/vue-timeago.js',
    '@/plugins/api.js'
  ],
  /*
  ** Auto import components
  ** See https://nuxtjs.org/api/configuration-components
  */
  components: true,
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    ['@nuxtjs/eslint-module', { fix: true }]
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://bootstrap-vue.js.org
    'bootstrap-vue/nuxt',
    '@nuxtjs/pwa'
  ],
  bootstrapVue: {
    componentPlugins: [
      'LayoutPlugin',
      'NavbarPlugin',
      'FormGroupPlugin',
      'FormInputPlugin',
      'FormTextareaPlugin',
      'ModalPlugin',
      'ButtonPlugin',
      'SpinnerPlugin',
      'AvatarPlugin',
      'BadgePlugin',
      'FormTagsPlugin',
      'TablePlugin',
      'InputGroupPlugin',
      'FormRadioPlugin',
      'FormCheckboxPlugin',
      'TabsPlugin',
      'BadgePlugin'
    ]
  },
  /*
  ** Build configuration
  ** See https://nuxtjs.org/api/configuration-build/
  */
  build: {
    transpile: [
      'vue-icon',
      'vue-pincode-input',
      'emoji-mart-vue-fast/src/components/Emoji',
      'emoji-mart-vue-fast/src/components/Picker',
      'emoji-mart-vue-fast/src/utils/emoji-data',
      'emoji-mart-vue-fast/src/utils/shared-props',
      'emoji-mart-vue-fast/data/twitter.json'
    ],
    babel: {
      compact: true
    }
  },

  server: {
    port: 8080
  },

  publicRuntimeConfig: {
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    websocketUrl: process.env.WEBSOCKET_URL || 'ws://localhost:5000',
    channels: process.env.CHANNELS || ['01EK9Q7RVWJQTT687QWJTER19V']
  }
}
