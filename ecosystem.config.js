module.exports = {
  apps: [{
    name: 'beechat-frontend',
    script: './node_modules/nuxt/bin/nuxt.js',
    args: 'start',
    watch: true,
    env_production: {
      NODE_ENV: 'production',
      API_BASE_URL: 'https://beechat.dtools.dev/api',
      WEBSOCKET_URL: 'wss://ws.beechat.dtools.dev'
    }
  }]
}
