import axios from 'axios'

export default ({ store, $config }, inject) => {
  const API = {}

  const instance = axios.create({
    baseURL: $config.apiBaseUrl,
    withCredentials: true
  })

  const interceptor = instance.interceptors.response.use((response) => {
    // Return a successful response back to the calling service
    return response
  }, async (error) => {
    if (error.response.status !== 401) {
      return Promise.reject(error)
    }

    instance.interceptors.response.eject(interceptor)

    try {
      console.log('Refreshing token...')

      await store.dispatch('user/refreshToken', { root: true })
    } catch {
      store.dispatch('user/logout', { root: true })
      return false
    }

    try {
      console.log('Verifying token...')

      await store.dispatch('user/loginVerify', { root: true })
    } catch {
      store.dispatch('user/logout', { root: true })
      return false
    }

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
