<template>
  <b-modal id="renameConversation" title="Rename Conversation">
    <b-form-group label="Name">
      <b-form-input v-model.trim="name" />
    </b-form-group>

    <template v-slot:modal-footer="{ cancel, }">
      <b-button size="sm" @click="cancel()">
        Cancel
      </b-button>

      <b-button size="sm" variant="primary" @click="renameConversation">
        Rename
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'RenameConversation',

  props: {
    conversationId: { type: String, required: true }
  },

  data () {
    return {
      name: ''
    }
  },

  computed: {
    ...mapGetters('user', ['username']),
    ...mapGetters('message', ['conversation'])
  },

  mounted () {
    const self = this

    this.$root.$on('bv::modal::show', async (bvEvent, modalId) => {
      if (modalId === 'manageMember') {
        await self.fetchConversation(self.conversationId)

        if (self.conversation && self.conversation.name) { self.name = self.conversation.name }
      }
    })

    this.$root.$on('bv::modal::hide', (bvEvent, modalId) => {
      if (modalId === 'manageMember') {
        this.name = ''
      }
    })

    this.$eventBus.$on('CONVERSATION_RENAMED', () => {
      self.$bvModal.hide('renameConversation')
    })
  },

  methods: {
    ...mapActions('message', ['fetchConversation', 'broadcastMessage']),

    renameConversation () {
      this.$bvModal.msgBoxConfirm('Are you sure?', {
        okVariant: 'warning',
        okTitle: 'Yes',
        buttonSize: 'sm',
        size: 'sm'
      })
        .then((value) => {
          if (value) {
            this.broadcastMessage({ type: 'rename-conversation', payload: { conversation_id: this.conversationId, name: this.name } })
          }
        })
        .catch()
    }
  }
}
</script>

<style>
</style>
