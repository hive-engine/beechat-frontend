import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const state = () => ({
  socket: {
    isConnected: false,
    reconnectError: false
  }
})

export const getters = {

}

export const mutations = {
  SOCKET_ONOPEN (state, event) {
    console.log(event)

    Vue.prototype.$socket = event.currentTarget
    state.socket.isConnected = true

    if (this.state.user.authenticated) {
      this.dispatch('user/authenticateWebsocket', { username: this.state.user.username, token: this.state.user.ws_token })
    }
  },

  SOCKET_ONCLOSE (state, event) {
    state.socket.isConnected = false
    this.commit('user/SET_ONLINE', false, { root: true })
  },

  SOCKET_ONMESSAGE (state, message) {
    const data = JSON.parse(message.data)

    if (data.type === 'status' && data.payload.authenticated) {
      this.commit('user/SET_ONLINE', data.payload.authenticated, { root: true })
    }

    if (data.type === 'reauthentication-required') {
      this.dispatch('user/refreshToken', { root: true })
    }

    if (data.type === 'chat-message') {
      this.commit('message/SET_MESSAGE', data.payload, { root: true })
    }

    if (data.type === 'message-deleted') {
      this.commit('message/REMOVE_MESSAGE', data.payload, { root: true })
    }

    if (data.type === 'conversation-created') {
      this.commit('message/ADD_CONVERSATION', data.payload, { root: true })

      this.$eventBus.$emit('CONVERSATION_CREATED', data.payload)
    }

    if (data.type === 'conversation-renamed') {
      this.commit('message/RENAME_CONVERSATION', data.payload, { root: true })

      this.$eventBus.$emit('CONVERSATION_RENAMED', data.payload)
    }

    if (data.type === 'conversation-removed') {
      this.commit('message/REMOVE_CONVERSATION', data.payload, { root: true })

      this.$eventBus.$emit('CONVERSATION_REMOVED', data.payload)
    }

    if (data.type === 'acknowledged') {
      this.commit('message/UPDATE_MESSAGES', data.payload, { root: true })
    }

    if (data.type === 'member-added') {
      this.commit('message/ADD_MEMBER', data.payload, { root: true })
    }

    if (data.type === 'member-removed') {
      this.commit('message/REMOVE_MEMBER', data.payload, { root: true })
    }

    if (data.type === 'moderator-added') {
      this.commit('message/MODERATOR_ADDED', data.payload, { root: true })
    }

    if (data.type === 'moderator-removed') {
      this.commit('message/MODERATOR_REMOVED', data.payload, { root: true })
    }

    if (data.type === 'friendship-accepted') {
      this.commit('user/ADD_FRIEND', data.payload, { root: true })
    }

    if (data.type === 'friendship-removed') {
      this.commit('user/REMOVE_FRIEND', data.payload, { root: true })
    }

    if (data.type === 'friendship-requested') {
      this.commit('user/ADD_FRIEND_REQUEST', data.payload, { root: true })
    }

    if (data.type === 'friendship-rejected') {
      this.commit('user/REMOVE_FRIEND_REQUEST', data.payload, { root: true })
    }

    if (data.type === 'user-blocked') {
      this.commit('user/BLOCK_USER', data.payload, { root: true })
    }

    if (data.type === 'user-unblocked') {
      this.commit('user/UNBLOCK_USER', data.payload, { root: true })
    }
  },

  SOCKET_ONERROR (state, event) {
    console.log('Error connecting to websocket')
  },

  SOCKET_RECONNECT (state, count) {
    console.info(state, count)
  },

  SOCKET_RECONNECT_ERROR (state) {
    state.socket.reconnectError = true
  }
}

export const actions = {
  wsSendMessage (context, message) {
    Vue.prototype.$socket.send(JSON.stringify(message))
  }
}
