<template>
  <b-modal id="createConversation" title="New Conversation">
    <b-form-group>
      <b-form-radio-group
        v-model="type"
        size="sm"
        button-variant="outline-secondary"
        :options="[
          { text: 'DM', value: 'dm' },
          { text: 'Group', value: 'group' },
        ]"
        buttons
      />
    </b-form-group>

    <b-form-group v-if="type === 'dm'" label="Recipient">
      <b-form-input v-model="member" />
    </b-form-group>

    <b-form-group v-if="type === 'group'" label="Recipients">
      <b-form-tags
        v-model="members"
        disabled
        input-id="members-tags"
        placeholder
      />

      <div class="friendlist">
        <template v-if="friends.length > 0">
          <b-form-checkbox-group
            v-model="members"
            stacked
            :options="friends"
            name="members"
          />
        </template>

        <template v-else>
          No friends found
        </template>
      </div>
    </b-form-group>

    <b-form-group label="Message" label-for="message">
      <b-form-textarea id="message" v-model.trim="message" />
    </b-form-group>

    <template v-slot:modal-footer>
      <b-button
        variant="primary"
        :disabled="disableCreate"
        @click.prevent="createNewConversation"
      >
        Create
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'CreateConversationModal',

  data () {
    return {
      type: 'dm',
      member: '',
      members: [],
      message: ''
    }
  },

  computed: {
    ...mapGetters('user', ['friends']),

    disableCreate () {
      let disable = false

      if (this.type === 'group') {
        disable = this.members.length < 2
      }

      if (this.type === 'dm') {
        disable = this.member === ''
      }

      disable = this.message === ''

      return disable
    }
  },

  async created () {
    await this.fetchFriends()
  },

  mounted () {
    const self = this

    this.$root.$on('bv::modal::hidden', (bvEvent, modalId) => {
      if (modalId === 'createConversation') {
        self.member = ''
        self.members = []
        self.message = ''
      }
    })
  },

  methods: {
    ...mapActions('user', ['fetchFriends']),
    ...mapActions('message', ['broadcastMessage']),

    createNewConversation () {
      this.broadcastMessage({
        type: 'create-conversation',
        payload: {
          to: this.type === 'group' && this.members.length > 1 ? this.members : this.member,
          message: this.message
        }
      })

      this.to = ''
      this.message = ''

      this.$bvModal.hide('createConversation')
    }
  }
}
</script>

<style lang="scss">
.friendlist {
  margin-top: 20px;
  position: relative;
  overflow-x: hidden;
  overflow-y: scroll;
  max-height: 150px;

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
}
</style>
