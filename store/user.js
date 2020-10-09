import { PrivateKey, cryptoUtils } from '@/services/hive'

export const state = () => ({
  username: '',
  token: null,
  authenticated: false,
  smartlock: false,
  online: false,
  friends: [],
  blocked: [],
  friend_requests: [],
  settings: {},
  channels: [],
  sessions: []
})

export const getters = {
  username: state => state.username,
  isAuthenticated: state => state.authenticated,
  isOnline: state => state.online,
  friends: state => state.friends,
  blocked: state => state.blocked,
  friend_requests: state => state.friend_requests,
  settings: state => state.settings,
  channels: state => state.channels,
  sessions: state => state.sessions
}

export const mutations = {
  SET_USER (state, data) {
    state.username = data.username
    state.authenticated = data.authenticated

    if (data.smartlock !== undefined) {
      state.smartlock = data.smartlock
    }
  },

  SET_TOKEN (state, data) {
    state.token = data
  },

  SET_ONLINE (state, data) {
    state.online = data
  },

  SET_FRIENDS (state, data) {
    state.friends = data
  },

  SET_BLOCKED (state, data) {
    state.blocked = data
  },

  SET_FRIEND_REQUESTS (state, data) {
    state.friend_requests = data
  },

  ADD_FRIEND (state, data) {
    let friends = state.friends

    friends = Array.from(new Set([...friends, data.username]))

    state.friends = friends

    this.commit('user/REMOVE_FRIEND_REQUEST', { id: data.id }, { root: true })
  },

  REMOVE_FRIEND (state, data) {
    let friends = state.friends

    friends = friends.filter(r => r !== data.username)

    state.friends = friends
  },

  ADD_FRIEND_REQUEST (state, data) {
    let requests = state.friend_requests

    if (data.username !== state.username) {
      requests = [...requests, data]

      state.friend_requests = requests
    }
  },

  REMOVE_FRIEND_REQUEST (state, data) {
    let requests = state.friend_requests

    requests = requests.filter(r => r.id !== data.id)

    state.friend_requests = requests
  },

  BLOCK_USER (state, data) {
    let blocked = state.blocked

    blocked = Array.from(new Set([...blocked, data.username]))

    state.blocked = blocked

    this.commit('message/BLOCK_CONVERSATION', { id: data.conversation_id }, { root: true })
  },

  UNBLOCK_USER (state, data) {
    let blocked = state.blocked

    blocked = blocked.filter(r => r !== data.username)

    state.blocked = blocked

    this.commit('message/UNBLOCK_CONVERSATION', { id: data.conversation_id }, { root: true })
  },

  SET_SETTINGS (state, data) {
    state.settings = data
  },

  SET_CHANNELS (state, data) {
    state.channels = data
  },

  SET_CHANNEL (state, data) {
    state.channels = [data, ...state.channels]
  },

  SET_SESSIONS (state, data) {
    state.sessions = data
  }
}

export const actions = {
  login ({ commit, dispatch }, { username, redirect = null }) {
    if (!username) { return }

    if (!window.hive_keychain) { return }

    try {
      const ts = Date.now()

      window.hive_keychain.requestSignBuffer(username, `${username}${ts}`, 'Posting', async (r) => {
        if (r.success) {
          const data = await this.$API.call('users/login', { username, ts, sig: r.result })

          if (data) {
            dispatch('userLoggedIn', { ...data, smartlock: false, redirect })
          }
        }
      })
    } catch (e) {
      console.error(e.message)
    }
  },

  async loginWithKey ({ commit, dispatch }, { username, wif, redirect = null }) {
    if (!username) { return }

    if (!wif) {
      wif = localStorage.getItem(`smartlock-${username}`)
    }

    if (!wif) { return }

    try {
      const ts = Date.now()
      const key = (wif.length > 51) ? atob(wif) : wif
      const privateKey = PrivateKey.fromString(key)
      const sig = privateKey.sign(Buffer.from(cryptoUtils.sha256(username + ts))).toString()

      const data = await this.$API.call('users/login', { username, ts, sig })

      if (data) {
        dispatch('userLoggedIn', { ...data, smartlock: true, redirect })
      }
    } catch (e) {
      console.error(e.message)
    }
  },

  userLoggedIn ({ state, commit, dispatch, rootState }, data) {
    const { username, smartlock } = data

    commit('SET_USER', { username, authenticated: true, smartlock })

    if (data.token) {
      commit('SET_TOKEN', data.token)
    }

    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token)
    }

    if (data.redirect && data.redirect !== '') {
      this.$router.push(data.redirect)
    }

    if (!rootState.socket.isConnected) {
      this.$websocket.$connect()
    } else {
      console.log('Already connected to the socket')
    }

    let token = data.token

    if (!token) { token = state.token }

    dispatch('authenticateWebsocket', { token })
  },

  async loginVerify ({ commit, dispatch }, redirect) {
    try {
      const data = await this.$API.call('users/verify')

      dispatch('userLoggedIn', { ...data, redirect })
    } catch {
      //
    }
  },

  async refreshToken ({ state, commit, dispatch }) {
    try {
      const data = await this.$API.call('users/refresh-token')

      commit('SET_TOKEN', data.token)

      dispatch('authenticateWebsocket', { token: data.token })
    } catch {
      if (state.username && state.username !== '') {
        if (state.smartlock) {
          dispatch('loginWithKey', { username: state.username })
        } else {
          dispatch('login', { username: state.username })
        }
      } else {
        this.$router.app.$root.$bvModal.show('loginModal')
      }
    }
  },

  async logout ({ commit }) {
    await this.$API.call('users/logout')

    localStorage.removeItem('refresh_token')
    localStorage.removeItem(`smartlock-${state.username}`)

    commit('SET_USER', { username: '', authenticated: false, smartlock: false })
    commit('SET_TOKEN', null)

    this.$websocket.$disconnect()

    this.$router.push('/')
  },

  authenticateWebsocket ({ dispatch }, payload = {}) {
    try {
      dispatch('wsSendMessage', { type: 'authenticate', payload }, { root: true })
    } catch {
      //
    }
  },

  async fetchFriends ({ commit }) {
    try {
      const { friends, blocked } = await this.$API.call('users/friends')

      commit('SET_FRIENDS', friends)
      commit('SET_BLOCKED', blocked)
    } catch (e) {
      //
    }
  },

  async fetchFriendRequests ({ commit }) {
    try {
      const requests = await this.$API.call('users/friend-requests')

      commit('SET_FRIEND_REQUESTS', requests)
    } catch (e) {
      //
    }
  },

  async fetchSettings ({ commit }) {
    try {
      const settings = await this.$API.call('users/settings')

      commit('SET_SETTINGS', settings)
    } catch (e) {
      console.log(e)
    }
  },

  async saveSettings ({ commit }, data) {
    try {
      const settings = await this.$API.post('users/settings', data)

      commit('SET_SETTINGS', settings)
    } catch (e) {
      //
    }
  },

  async fetchChannels ({ commit }, data) {
    try {
      let channels = await this.$API.call('users/channels', data)

      channels = channels.map(c => ({ id: c.id, name: c.name }))

      commit('SET_CHANNELS', channels)
    } catch (e) {
      //
    }
  },

  async createChannel ({ commit }, data) {
    try {
      const channel = await this.$API.post('users/channels', data)

      commit('SET_CHANNEL', channel)
    } catch (e) {
      //
    }
  },

  async fetchSessions ({ commit }, data) {
    try {
      const sessions = await this.$API.call('users/sessions', data)

      commit('SET_SESSIONS', sessions)
    } catch (e) {
      //
    }
  },

  async revokeSession ({ state, commit }, data) {
    try {
      const revoke = await this.$API.post('users/revoke-session', data)

      if (revoke.success) {
        const sessions = state.sessions.filter(session => session.id !== data.id)

        commit('SET_SESSIONS', sessions)
      }
    } catch (e) {
      //
    }
  }
}
