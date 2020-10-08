<template>
  <div class="container">
    <h2 class="h4 mt-5">
      Settings
    </h2>
    <hr>

    <b-form-group>
      <b-form-checkbox v-model="acceptDM" value="true">
        Accept DMs only from friends
      </b-form-checkbox>
    </b-form-group>

    <b-button @click.prevent="saveUserSettings">
      Save
    </b-button>

    <h2 class="h4 mt-5">
      Channels
    </h2>
    <hr>

    <b-form-group label="Channel Name *">
      <b-form-input v-model="channelName" trim />
    </b-form-group>
    <b-button
      :disabled="channelName.length < 3"
      @click.prevent="createNewChannel"
    >
      Create
    </b-button>

    <b-table
      class="mt-5"
      show-empty
      responsive=""
      striped
      :items="channels"
      :fields="channelFields"
    />

    <h2 class="h4 mt-5">
      Active Sessions
    </h2>
    <hr>

    <b-table
      class="mt-5 mb-5"
      show-empty
      responsive=""
      striped
      :items="sessions"
      :fields="sessionFields"
    >
      <template v-slot:cell(id)="data">
        {{ data.item.browser }}<br>
        {{ data.item.ip }}<br>
        {{ data.item.city }} {{ data.item.country }}
      </template>

      <template v-slot:cell(created_at)="data">
        {{ new Date(data.item.created_at).toLocaleString() }}
      </template>

      <template v-slot:cell(actions)="data">
        <b-button
          variant="warning"
          @click.prevent="revokeSession({ id: data.item.id })"
        >
          Revoke
        </b-button>
      </template>
    </b-table>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Dashboard',

  middleware: 'authenticated',

  async fetch () {
    await Promise.all([
      this.fetchSettings(),
      this.fetchChannels(),
      this.fetchSessions()
    ])

    if (this.settings) {
      this.acceptDM = this.settings.dm.only_from_friends
    }
  },

  data () {
    return {
      acceptDM: false,
      channelName: '',
      channelFields: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'CHANNEL NAME' },
        { key: 'actions', label: '' }
      ],
      sessionFields: [
        { key: 'id', label: 'SESSION' },
        { key: 'created_at', label: 'DATE' },
        { key: 'actions', label: '' }
      ]
    }
  },

  computed: {
    ...mapGetters('user', ['settings', 'channels', 'sessions'])
  },

  methods: {
    ...mapActions('user', ['fetchSettings', 'saveSettings', 'fetchChannels', 'createChannel', 'fetchSessions', 'revokeSession']),

    async saveUserSettings () {
      await this.saveSettings({ dm: { only_from_friends: this.acceptDM } })
    },

    async createNewChannel () {
      await this.createChannel({ name: this.channelName })

      this.channelName = ''
    }
  }
}
</script>

<style>
</style>
