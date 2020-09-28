<template>
  <div class="container">
    <h1>Chats</h1>
    <template v-if="!dataLoaded">
      <Loading />
    </template>

    <template v-else>
      <b-row no-gutters align-v="stretch">
        <b-col md="4" class="mt-3">
          <div class="column-header justify-content-center">
            <b-button @click.prevent="$bvModal.show('createConversation')">
              New Conversation
            </b-button>
          </div>
          <div class="sidebar">
            <template v-if="channels.length > 0">
              <div
                v-for="conv of channels"
                :key="conv.id"
                class="conversation"
                :class="{ active: conversation_id === conv.id }"
                @click.prevent="loadMessages(conv)"
              >
                <b-row>
                  <b-col
                    cols="3"
                    lg="3"
                    xl="3"
                    align-self="center"
                    class="p-0 text-center d-md-none d-lg-block"
                  >
                    <b-avatar
                      variant="primary"
                      crossorigin
                      class="border"
                      size="3.5rem"
                    >
                      <v-icon name="users" />
                    </b-avatar>
                  </b-col>

                  <b-col
                    cols="8"
                    md="10"
                    lg="7"
                    align-self="center"
                    class="pr-0 p-lg-0 username"
                  >
                    {{ conv.name }}
                  </b-col>

                  <b-col
                    cols="1"
                    lg="2"
                    align-self="center"
                    class="pl-0 text-right"
                  >
                    <b-badge v-if="conv.unread > 0" variant="danger">
                      {{ conv.unread }}
                    </b-badge>
                  </b-col>
                </b-row>
              </div>

              <hr>
            </template>

            <template v-if="conversations.length > 0">
              <div
                v-for="conv of conversations"
                :key="conv.id"
                class="conversation"
                :title="`Conversation with @${conv.members.join(', ')}`"
                :class="{ active: conversation_id === conv.id }"
                @click.prevent="loadMessages(conv)"
              >
                <b-row>
                  <b-col
                    cols="3"
                    lg="3"
                    xl="3"
                    align-self="center"
                    class="p-0 text-center d-md-none d-lg-block"
                  >
                    <b-avatar
                      v-if="conv.type === 'dm'"
                      variant="light"
                      crossorigin
                      :src="`https://images.hive.blog/u/${conv.members[0]}/avatar`"
                      class="border"
                      size="3.5rem"
                    />
                    <b-avatar
                      v-else
                      variant="dark"
                      crossorigin
                      class="border"
                      size="3.5rem"
                    >
                      <v-icon name="users" />
                    </b-avatar>
                  </b-col>

                  <b-col
                    cols="8"
                    md="10"
                    lg="7"
                    align-self="center"
                    class="pr-0 p-lg-0 username"
                  >
                    {{ conv.name }}
                  </b-col>

                  <b-col
                    cols="1"
                    lg="2"
                    align-self="center"
                    class="pl-0 text-right"
                  >
                    <b-badge v-if="conv.unread > 0" variant="danger">
                      {{ conv.unread }}
                    </b-badge>
                  </b-col>
                </b-row>
              </div>
            </template>

            <template v-else>
              <div class="text-center align-center">
                No chats found
              </div>
            </template>
          </div>
        </b-col>

        <b-col md="8" class="mt-3">
          <div class="column-header">
            <b-row class="w-100" align-v="center">
              <b-col cols="11">
                <p v-if="conversation_id" class="m-0 h6 conversation-name">
                  <template v-if="type === 'dm'">
                    <v-icon name="user" />
                    &nbsp; Conversation with @{{ conversation_name }}
                  </template>
                  <template v-else-if="type === 'group' || type === 'channel'">
                    <v-icon name="users" />
                    &nbsp; {{ conversation_name }}
                  </template>
                </p>
              </b-col>
              <b-col class="text-right" cols="1">
                <b-dropdown
                  size="sm"
                  variant="link"
                  right
                  toggle-class="text-decoration-none"
                  no-caret
                >
                  <template v-slot:button-content>
                    <v-icon name="more-vertical" />
                  </template>
                  <b-dropdown-item-button
                    v-if="type === 'dm' && !isUserBlocked(to)"
                    @click.prevent="blockUser"
                  >
                    Block
                  </b-dropdown-item-button>
                  <b-dropdown-item-button
                    v-if="type === 'dm' && isUserBlocked(to)"
                    @click.prevent="unblockUser"
                  >
                    Unlock
                  </b-dropdown-item-button>
                  <b-dropdown-item-button
                    v-if="type === 'group' || type === 'channel'"
                    @click.prevent="leaveConversation"
                  >
                    Leave
                  </b-dropdown-item-button>
                  <b-dropdown-item-button
                    v-if="(type === 'group' || type === 'channel') && isCreator"
                    @click.prevent="$bvModal.show('renameConversation')"
                  >
                    Rename
                  </b-dropdown-item-button>
                  <b-dropdown-item-button
                    v-if="type === 'group' || type === 'channel'"
                    @click.prevent="$bvModal.show('manageMember')"
                  >
                    Members
                  </b-dropdown-item-button>
                </b-dropdown>
              </b-col>
            </b-row>
          </div>

          <div class="messages">
            <div
              v-chat-scroll="{ always: false, smooth: true }"
              class="messages-container"
              @v-chat-scroll-top-reached="loadMoreMessages"
              @scroll="onScroll"
            >
              <template v-if="groupedMessages.length > 0">
                <div
                  v-for="message of groupedMessages"
                  :key="message.id"
                  class="message"
                  :class="
                    message.from === username
                      ? 'sent-message'
                      : 'received-message'
                  "
                >
                  <div
                    class="content text-light"
                    :class="
                      message.from === username ? 'bg-primary' : 'bg-secondary'
                    "
                    v-html="message.content"
                  />
                  <div class="text-muted small pl-1">
                    {{
                      message.from === username ? "You" : message.from
                    }}&nbsp;&middot;
                    <timeago
                      :datetime="new Date(message.timestamp)"
                      :title="new Date(message.timestamp).toLocaleString()"
                      :auto-update="30"
                    />
                    <template
                      v-if="
                        message.from === username ||
                          ((conversation.type === 'group' ||
                            conversation.type === 'channel') &&
                            (isCreator || isModerator))
                      "
                    >
                      &nbsp;&middot;
                      <b-dropdown
                        class="message-menu"
                        size="sm"
                        variant="link"
                        toggle-class="text-decoration-none"
                        no-caret
                      >
                        <template v-slot:button-content>
                          <v-icon name="more-horizontal" />
                        </template>
                        <b-dropdown-item-button
                          @click.prevent="requestDelete({ id: message.id })"
                        >
                          Delete
                        </b-dropdown-item-button>
                      </b-dropdown>
                    </template>
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="text-center">
                  <span
                    v-if="!conversation_id"
                  >Please select a conversation or start a new one!</span>
                  <span v-else>Send a new message</span>
                </div>
              </template>

              <template v-if="isBlocked">
                <div class="text-center h6">
                  BLOCKED! You can not message this user.
                </div>
              </template>
            </div>

            <div class="message-box">
              <div class="textarea-emoji-picker">
                <emoji-picker
                  v-show="showEmojiPicker"
                  emoji="kiss"
                  :show-skin-tones="false"
                  title="beeChat"
                  set="twitter"
                  @select="selectEmoji"
                />

                <span
                  class="emoji-trigger"
                  :class="{ triggered: showEmojiPicker }"
                  @mousedown.prevent="toggleEmojiPicker"
                >
                  <svg style="width: 20px; height: 20px" viewBox="0 0 24 24">
                    <path
                      fill="#888888"
                      d="M20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12M22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12M10,9.5C10,10.3 9.3,11 8.5,11C7.7,11 7,10.3 7,9.5C7,8.7 7.7,8 8.5,8C9.3,8 10,8.7 10,9.5M17,9.5C17,10.3 16.3,11 15.5,11C14.7,11 14,10.3 14,9.5C14,8.7 14.7,8 15.5,8C16.3,8 17,8.7 17,9.5M12,17.23C10.25,17.23 8.71,16.5 7.81,15.42L9.23,14C9.68,14.72 10.75,15.23 12,15.23C13.25,15.23 14.32,14.72 14.77,14L16.19,15.42C15.29,16.5 13.75,17.23 12,17.23Z"
                    />
                  </svg>
                </span>
              </div>

              <b-form-textarea
                ref="chatMessage"
                v-model="chat"
                name="chatMessage"
                placeholder="Type something..."
                :disabled="disableChatBox"
                @keydown.enter.exact.prevent
                @keyup.enter.exact="sendChat"
                @keydown.enter.shift.exact="insertNewline"
              />
            </div>
          </div>
        </b-col>
      </b-row>
    </template>

    <manage-members-modal :conversation-id="conversation_id || ''" />
    <create-conversation-modal />
    <rename-conversation-modal :conversation-id="conversation_id || ''" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Loading from '@/components/Loading.vue'
import CreateConversationModal from '@/components/modals/CreateConversation.vue'
import RenameConversationModal from '@/components/modals/RenameConversation.vue'
import ManageMembersModal from '@/components/modals/ManageMembers.vue'
import EmojiPicker from '@/components/emoji/Picker.vue'

export default {
  name: 'Chats',

  middleware: 'authenticated',

  components: {
    CreateConversationModal,
    EmojiPicker,
    Loading,
    ManageMembersModal,
    RenameConversationModal
  },

  async fetch () {
    this.dataLoaded = false

    await Promise.all([
      this.fetchConversations(),
      this.fetchNewMessages(),
      this.fetchChannels(this.$config.channels)
    ])

    this.dataLoaded = true
  },

  data () {
    return {
      conversation_id: null,
      conversation_name: null,
      type: 'dm',
      to: null,
      conversation: null,
      chat: '',
      dataLoaded: false,
      showEmojiPicker: false
    }
  },

  computed: {
    ...mapGetters('user', ['isAuthenticated', 'isOnline', 'username', 'blocked']),
    ...mapGetters('message', ['conversations', 'messages', 'channels']),

    groupedMessages () {
      const self = this

      return this.messages.filter(m => m.conversation_id === self.conversation_id)
    },

    isBlocked () {
      const self = this

      if (this.conversations.length <= 0 || !this.dataLoaded || !this.conversation_id) {
        return false
      }

      const conv = this.conversations.find(c => c.id === self.conversation_id)

      return (conv && conv.blocked) || false
    },

    disableChatBox () {
      return this.conversations.length <= 0 || !this.dataLoaded || !this.conversation_id || this.isBlocked || !this.isOnline
    },

    isCreator () {
      if (!this.conversation) { return false }

      return this.conversation.creator === this.username
    },

    isModerator () {
      if (!this.conversation) { return false }

      return this.conversation.moderators.includes(this.username)
    }
  },

  watch: {
    async dataLoaded (loaded) {
      if (loaded && this.conversations.length > 0) {
        await this.loadMessages(this.conversations[0])
      }
    }
  },

  mounted () {
    const self = this

    this.$eventBus.$on('CONVERSATION_REMOVED', (data) => {
      if (self.conversation_id === data.id) {
        self.conversation_id = null
        self.conversation_name = null
        self.conversation = null
      }
    })
  },

  methods: {
    ...mapActions('message', ['fetchConversations', 'fetchChannels', 'fetchNewMessages', 'fetchMessages', 'broadcastChat', 'broadcastMessage']),

    sendChat () {
      this.broadcastChat({
        conversation_id: this.conversation_id,
        to: this.to,
        message: this.chat
      })

      this.chat = ''
    },

    insertNewline () {
      return `${this.chat}\n`
    },

    async loadMoreMessages () {
      console.log('Loading more messages....')

      await this.fetchMessages({ conversation_id: this.conversation_id, before: this.messages[0].timestamp })
    },

    async loadMessages (conversation) {
      const { id: convId, name, members, type } = conversation

      this.conversation = conversation
      this.conversation_id = convId
      this.conversation_name = name
      this.type = type
      this.to = (type === 'dm') ? members[0] : null

      await this.fetchMessages({ conversation_id: convId })

      this.scrollIntoView()
      this.sendAcknowledgment()
    },

    sendAcknowledgment () {
      const self = this

      const unreadMessages = this.messages.filter(m => m.conversation_id === self.conversation_id &&
      (m.to === self.username || m.to === null) &&
      !m.read)

      if (unreadMessages.length > 0) {
        this.broadcastMessage({ type: 'acknowledgment', payload: { conversation_id: this.conversation_id } })
      }
    },

    scrollIntoView () {
      const el = this.$el.getElementsByClassName('messages-container')[0]

      if (el) {
        el.scrollTop = el.scrollHeight
      }
    },

    onScroll ({ target: { scrollTop, clientHeight, scrollHeight } }) {
      if (scrollTop + clientHeight >= scrollHeight) {
        this.sendAcknowledgment()
      }
    },

    selectEmoji (emoji) {
      const textarea = this.$refs.chatMessage

      const cursorPosition = textarea.selectionEnd

      const start = this.chat.substring(0, textarea.selectionStart)

      const end = this.chat.substring(textarea.selectionStart)

      const text = start + emoji.native + end

      this.chat = text

      textarea.focus()

      this.$nextTick(() => {
        textarea.selectionEnd = cursorPosition + emoji.native.length
      })
    },

    toggleEmojiPicker () {
      this.showEmojiPicker = !this.showEmojiPicker
    },

    isUserBlocked (username) {
      return this.blocked.includes(username)
    },

    blockUser () {
      if (!this.to) { return }
      this.broadcastMessage({ type: 'block-user', payload: { username: this.to } })
    },

    unblockUser (username) {
      if (!this.to) { return }
      this.broadcastMessage({ type: 'unblock-user', payload: { username: this.to } })
    },

    leaveConversation () {
      this.broadcastMessage({ type: 'leave-conversation', payload: { conversation_id: this.conversation_id } })
    },

    requestDelete (payload) {
      this.broadcastMessage({ type: 'delete-message', payload })
    }
  }
}
</script>

<style lang="scss">
.column-header {
  background-color: rgba(116, 127, 141, 0.08);
  border-top: 1px solid #c9d6de;
  border-bottom: 1px solid #c9d6de;
  padding: 10px 0;
  height: 60px;
  display: flex;
  align-items: center;

  .conversation-name {
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.sidebar {
  height: 400px;
  background-color: rgba(116, 127, 141, 0.08);
  overflow-x: hidden;
  overflow-y: scroll;
  scrollbar-width: thin;

  @media screen and (min-width: 992px) {
    height: 700px;
  }

  &::-webkit-scrollbar {
    width: 10px;
  }
  &::-webkit-scrollbar-track {
    background: #f0f0f0;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #cdcdcd;
  }

  .conversation {
    padding: 8px 5px;
    cursor: pointer;
    transition: 300ms;

    .username {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    &:hover {
      background-color: rgba(116, 127, 141, 0.16);
    }

    &.active {
      background-color: rgba(116, 127, 141, 0.16);
    }
  }
}

.messages {
  position: relative;

  &::-webkit-scrollbar {
    display: none;
  }

  .message-box {
    position: sticky;
    bottom: 0;
    background-color: rgba(116, 127, 141, 0.08);
    padding: 1rem;
    min-height: 100px;

    textarea {
      scrollbar-width: none;
      resize: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }

  .messages-container {
    height: 600px;
    padding: 15px;
    overflow-x: hidden;
    overflow-y: scroll;
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 10px;
    }
    &::-webkit-scrollbar-track {
      background: #f0f0f0;
    }
    &::-webkit-scrollbar-thumb {
      background-color: #cdcdcd;
    }

    .message {
      position: relative;
      margin-bottom: 15px;

      .content {
        white-space: pre-wrap;
        display: inline-flex;
        padding: 0.8rem;
        border-radius: 0.2rem;
      }
    }

    .sent-message {
      margin-left: 2.5rem;
      text-align: right;
    }

    .received-message {
      margin-right: 2.5rem;
      text-align: left;
    }

    .message-menu {
      .icon {
        width: 16px;
      }

      .dropdown-menu {
        min-width: auto;
        padding: 0;
        margin: 0;
        font-size: 85%;
      }

      button {
        line-height: 1;
      }

      .dropdown-item:hover {
        border-radius: 0.25rem;
      }
    }
  }

  .textarea-emoji-picker {
    position: relative;

    .emoji-mart {
      position: absolute;
      bottom: 0;
      right: 10px;
    }

    .emoji-trigger {
      position: absolute;
      top: 10px;
      right: 10px;
      cursor: pointer;
      height: 20px;
    }

    .emoji-trigger path {
      transition: 0.1s all;
    }

    .emoji-trigger:hover path {
      fill: #000000;
    }

    .emoji-trigger.triggered path {
      fill: darken(#fec84a, 15%);
    }
  }
}
</style>
