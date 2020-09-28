export const state = () => ({
  conversations: [],
  conversation: null,
  channels: [],
  messages: [],
  recipient: ''
})

export const getters = {
  conversations: (state, getters, rootState, rootGetters) => {
    const { messages, conversations } = state
    const { username } = rootState.user

    return conversations
      .map(r => ({ ...r, members: r.members.filter(m => m !== username), updated_at: new Date(r.updated_at).getTime() }))
      .sort((a, b) => b.updated_at - a.updated_at)
      .reduce((acc, cur) => {
        const newMessages = messages.filter(m => m.conversation_id === cur.id &&
          (m.to === username || m.to === null) &&
          m.read === false)

        if (!cur.name) { cur.name = cur.members.join(', ') }

        acc.push({ ...cur, unread: newMessages.length })

        return acc
      }, [])
  },
  channels: (state) => {
    const { messages, channels } = state

    return channels
      .map(r => ({ ...r, updated_at: new Date(r.updated_at).getTime() }))
      .sort((a, b) => b.updated_at - a.updated_at)
      .reduce((acc, cur) => {
        const newMessages = messages.filter(m => m.conversation_id === cur.id && m.read === false)

        acc.push({ ...cur, unread: newMessages.length })

        return acc
      }, [])
  },
  messages: (state) => {
    const messages = state.messages.slice()

    return messages
      .map(m => ({ ...m, timestamp: new Date(m.timestamp).getTime() }))
      .sort((a, b) => a.timestamp - b.timestamp)
  },
  recipient: state => state.recipient,
  conversation: state => state.conversation
}

export const mutations = {
  SET_CONVERSATIONS (state, data) {
    state.conversations = data
  },

  SET_CONVERSATION (state, data) {
    state.conversation = data
  },

  SET_CHANNELS (state, data) {
    state.channels = data
  },

  ADD_MEMBER (state, data) {
    let conversations = state.conversations

    conversations = conversations.map((m) => {
      if (m.id === data.conversation_id) {
        m.members = Array.from(new Set([...m.members, data.username]))
      }

      return m
    })

    state.conversations = conversations

    if (state.conversation && state.conversation.id === data.conversation_id) {
      const conversation = state.conversation

      conversation.members = Array.from(new Set([...conversation.members, data.username]))

      state.conversation = conversation
    }
  },

  REMOVE_MEMBER (state, data) {
    let conversations = state.conversations

    conversations = conversations.map((m) => {
      if (m.id === data.conversation_id) {
        m.members = m.members.filter(a => a !== data.username)
      }

      return m
    })

    state.conversations = conversations

    if (state.conversation && state.conversation.id === data.conversation_id) {
      const conversation = state.conversation

      conversation.members = conversation.members.filter(a => a !== data.username)

      state.conversation = conversation
    }
  },

  ADD_CONVERSATION (state, data) {
    let conversations = state.conversations

    conversations = [data, ...conversations].reduce((acc, cur) => {
      return Object.assign(acc, {
        [cur.id]: cur
      })
    }, {})

    state.conversations = Object.values(conversations)
  },

  RENAME_CONVERSATION (state, data) {
    let conversations = state.conversations

    conversations = conversations.map((m) => {
      if (m.id === data.conversation_id) { m.name = data.name }

      return m
    })

    state.conversations = conversations
  },

  REMOVE_CONVERSATION (state, data) {
    let conversations = state.conversations

    conversations = conversations.filter(c => c.id !== data.id)

    state.conversations = conversations
  },

  BLOCK_CONVERSATION (state, data) {
    let conversations = state.conversations

    conversations = conversations.map((m) => {
      if (m.id === data.id) { m.blocked = true }

      return m
    })

    state.conversations = conversations
  },

  UNBLOCK_CONVERSATION (state, data) {
    let conversations = state.conversations

    conversations = conversations.map((m) => {
      if (m.id === data.id) { m.blocked = false }

      return m
    })

    state.conversations = conversations
  },

  SET_MESSAGES (state, data) {
    state.messages = data
  },

  SET_MESSAGE (state, data) {
    const messages = state.messages
    let conversations = state.conversations

    conversations = conversations.reduce((acc, cur) => {
      if (cur.id === data.conversation_id) { cur.updated_at = data.timestamp }

      acc.push(cur)

      return acc
    }, [])

    state.messages = [...messages, data]
    state.conversations = conversations
  },

  UPDATE_MESSAGES (state, data) {
    let messages = state.messages

    messages = messages.map((m) => {
      if (m.conversation_id === data.conversation_id) { m.read = true }

      return m
    })

    state.messages = messages
  },

  REMOVE_MESSAGE (state, data) {
    let messages = state.messages

    messages = messages.filter(m => m.id !== data.id)

    state.messages = messages
  },

  MODERATOR_ADDED (state, data) {
    let conversations = state.conversations

    conversations = conversations.map((m) => {
      if (m.id === data.conversation_id) {
        m.moderators = Array.from(new Set([...m.moderators, data.username]))
      }

      return m
    })

    state.conversations = conversations

    if (state.conversation && state.conversation.id === data.conversation_id) {
      const conversation = state.conversation

      conversation.moderators = Array.from(new Set([...conversation.moderators, data.username]))

      state.conversation = conversation
    }
  },

  MODERATOR_REMOVED (state, data) {
    let conversations = state.conversations

    conversations = conversations.map((m) => {
      if (m.id === data.conversation_id) {
        m.moderators = m.moderators.filter(a => a !== data.username)
      }

      return m
    })

    state.conversations = conversations

    if (state.conversation && state.conversation.id === data.conversation_id) {
      const conversation = state.conversation

      conversation.moderators = conversation.moderators.filter(a => a !== data.username)

      state.conversation = conversation
    }
  }
}

export const actions = {
  async fetchConversations ({ commit, rootState }) {
    try {
      const conversations = await this.$API.call('messages/conversations')

      commit('SET_CONVERSATIONS', conversations)
    } catch (e) {
      console.log(e.message)
    }
  },

  async fetchConversation ({ commit, rootState }, convId) {
    try {
      const conversation = await this.$API.call('messages/conversation', { id: convId })

      commit('SET_CONVERSATION', conversation)
    } catch (e) {
      console.log(e.message)
    }
  },

  async fetchChannels ({ commit, rootState }, ids) {
    try {
      const channels = await this.$API.call('messages/conversation', { ids: ids.toString() })

      commit('SET_CHANNELS', channels)
    } catch (e) {
      console.log(e.message)
    }
  },

  async fetchNewMessages ({ commit, rootState }) {
    try {
      const messages = await this.$API.call('messages/new')

      commit('SET_MESSAGES', messages)
    } catch (e) {
      console.log(e.message)
    }
  },

  async fetchMessages ({ commit, state }, { conversation_id: convId, before = null }) {
    try {
      const query = { conversation_id: convId }

      if (before) { query.before = new Date(before).getTime() }

      let messages = await this.$API.call('messages/chats', query)

      messages = [...state.messages, ...messages].reduce((acc, cur) => {
        return Object.assign(acc, {
          [cur.id]: cur
        })
      }, {})

      messages = Object.values(messages)

      commit('SET_MESSAGES', messages)
    } catch (e) {
      console.log(e.message)
    }
  },

  broadcastChat ({ dispatch }, { conversation_id: convId = undefined, to, message }) {
    dispatch('wsSendMessage', { type: 'chat-message', payload: { conversation_id: convId, to, message } }, { root: true })
  },

  broadcastMessage ({ dispatch }, payload) {
    dispatch('wsSendMessage', payload, { root: true })
  },

  requestNewMessage ({ commit }, recipient) {
    commit('SET_RECIPIENT', recipient)
    this.$router.app.$root.$bvModal.show('newMessageModal')
  }
}
