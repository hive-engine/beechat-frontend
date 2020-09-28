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
      this.fetchChannels()
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
      ]
    }
  },

  computed: {
    ...mapGetters('user', ['settings', 'channels'])
  },

  methods: {
    ...mapActions('user', ['fetchSettings', 'saveSettings', 'fetchChannels', 'createChannel']),

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
