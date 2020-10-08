import axios from 'axios'

export default ({ app, store, $config }, inject) => {
  const API = {}

  const instance = axios.create({
    baseURL: $config.apiBaseUrl,
    withCredentials: true
  })

  instance.interceptors.request.use((config) => {
    if (process.client) {
      if (store.state.user.token) {
        config.headers.Authorization = `Bearer ${store.state.user.token}`
      }

      if (config.url === '/users/refresh-token' && localStorage.getItem('refresh_token')) {
        config.headers.Authorization = `Bearer ${localStorage.getItem('refresh_token')}`
      }
    }

    return config
  })

  instance.interceptors.response.use((response) => {
    // Return a successful response back to the calling service
    return response
  }, async (error) => {
    if (error.response.status !== 401) {
      return Promise.reject(error)
    }

    let successful = false

    if (error.config.url === '/users/verify' && error.config.url !== '/users/refresh-token') {
      try {
        console.log('Refreshing token...')

        await store.dispatch('user/refreshToken', { root: true })

        error.config.headers.Authorization = store.state.user.token
        successful = true
      } catch {
        console.log('hit')
        successful = false
        Promise.reject(error)
      }
    }

    if (error.config.url !== '/users/verify' && error.config.url !== '/users/refresh-token') {
      try {
        console.log('Verifying token...')

        await store.dispatch('user/loginVerify', { root: true })
        successful = true
      } catch {
        successful = false
        Promise.reject(error)
      }
    }

    if (successful) {
      try {
        // New request with new token
        const config = error.config

        return new Promise((resolve, reject) => {
          axios.request(config).then((response) => {
            resolve(response)
          }).catch((error) => {
            reject(error)
          })
        })
      } catch (error) {
        Promise.reject(error)
      }
    }
  })

  API.call = async (endpoint, params) => {
    const { data } = await instance.get(`/${endpoint}`, { params })

    return data
  }

  API.post = async (endpoint, payload) => {
    const { data } = await instance.post(`/${endpoint}`, payload)

    return data
  }

  inject('API', API)
}
