<template>
  <b-modal id="manageMember" title="Members" hide-footer>
    <template v-if="isCreator || isModerator">
      <b-form-group label="Add New Member">
        <b-input-group prepend="@">
          <b-form-input
            v-model.trim="newMember"
            placeholder="Hive username"
            @input="newMember = $event.toLowerCase()"
          />

          <b-input-group-append>
            <b-button variant="primary" @click.prevent="addMember">
              Add
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </b-form-group>

      <hr>
    </template>

    <b-table :items="members" :fields="fields">
      <template v-slot:cell(username)="data">
        {{ data.item.username }} {{ data.item.role }}
      </template>

      <template v-slot:cell(actions)="data">
        <b-button
          v-if="
            isCreator &&
              !userIsModerator(data.item.username) &&
              !userIsCreator(data.item.username)
          "
          size="sm"
          variant="info"
          @click.prevent="addModerator(data.item.username)"
        >
          Make Mod
        </b-button>
        <b-button
          v-if="
            isCreator &&
              userIsModerator(data.item.username) &&
              !userIsCreator(data.item.username)
          "
          size="sm"
          variant="danger"
          @click.prevent="removeModerator(data.item.username)"
        >
          Remove Mod
        </b-button>
        <b-button
          v-if="
            (isCreator || isModerator) && !userIsCreator(data.item.username)
          "
          size="sm"
          variant="danger"
          @click.prevent="removeMember(data.item.username)"
        >
          Remove
        </b-button>
      </template>
    </b-table>
  </b-modal>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'ManageMember',

  props: {
    conversationId: { type: String, required: true }
  },

  data () {
    return {
      newMember: '',

      fields: [{ key: 'username', label: 'Members' }, { key: 'actions', label: '' }]
    }
  },

  computed: {
    ...mapGetters('user', ['username']),
    ...mapGetters('message', ['conversation']),

    members () {
      const self = this
      if (!this.conversation) { return [] }

      return this.conversation.members.map(m => ({ username: m, role: self.getUserRole(m), actions: '' }))
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

  mounted () {
    const self = this

    this.$root.$on('bv::modal::show', async (bvEvent, modalId) => {
      if (modalId === 'manageMember') {
        await self.fetchConversation(self.conversationId)
      }
    })
  },

  methods: {
    ...mapActions('message', ['fetchConversation', 'broadcastMessage']),

    getUserRole (username) {
      if (!this.conversation) { return '' }

      return this.conversation.creator === username ? '(Admin)' : this.conversation.moderators.includes(username) ? '(Mod)' : ''
    },

    userIsCreator (username) {
      if (!this.conversation) { return false }
      return this.conversation.creator === username
    },

    userIsModerator (username) {
      if (!this.conversation || !this.conversation.moderators) { return false }
      return this.conversation.moderators.includes(username)
    },

    promiseConfirm () {
      return new Promise((resolve, reject) => {
        this.$bvModal.msgBoxConfirm('Are you sure?', {
          okVariant: 'warning',
          okTitle: 'Yes',
          buttonSize: 'sm',
          size: 'sm'
        })
          .then((value) => {
            if (value) {
              resolve(value)
            } else {
              reject(value)
            }
          })
          .catch(e => reject(e))
      })
    },

    async addMember () {
      try {
        await this.promiseConfirm()

        this.broadcastMessage({ type: 'add-member', payload: { conversation_id: this.conversationId, username: this.newMember } })

        this.newMember = ''
      } catch (e) {
        //
      }
    },

    async removeMember (username) {
      try {
        await this.promiseConfirm()

        this.broadcastMessage({ type: 'remove-member', payload: { conversation_id: this.conversationId, username } })
      } catch (e) {
        //
      }
    },

    async addModerator (username) {
      try {
        await this.promiseConfirm()

        this.broadcastMessage({ type: 'add-moderator', payload: { conversation_id: this.conversationId, username } })
      } catch (e) {
        //
      }
    },

    async removeModerator (username) {
      try {
        await this.promiseConfirm()

        this.broadcastMessage({ type: 'remove-moderator', payload: { conversation_id: this.conversationId, username } })
      } catch (e) {
        //
      }
    }
  }
}
</script>

<style>
</style>
