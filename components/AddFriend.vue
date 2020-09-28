<template>
  <div class="autocomplete">
    <b-form-group label="Add Friend">
      <b-input-group prepend="@">
        <b-form-input
          v-model.trim="username"
          placeholder="Enter a Hive username"
          @keydown.enter="enter"
          @keydown.down="down"
          @keydown.up="up"
          @input="change"
        />

        <b-input-group-append>
          <b-button
            variant="info"
            :disabled="username.lengh < 2"
            @click="sendFriendRequest"
          >
            Send Friend Request
          </b-button>
        </b-input-group-append>
      </b-input-group>

      <ul class="dropdown-menu w-100" :class="{ show: openSuggestion }">
        <li
          v-for="(suggestion, i) in matches"
          :key="i"
          :class="{ active: isActive(i) }"
          @click="suggestionClick(i)"
        >
          {{ suggestion }}
        </li>
      </ul>
    </b-form-group>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { getClient } from '@/services/hive'

const client = getClient()

export default {
  name: 'AddFriend',

  data () {
    return {
      username: '',
      suggestions: [],
      open: true
    }
  },

  computed: {
    matches () {
      return this.suggestions.filter((str) => {
        return RegExp(`\\b${this.username}`, 'gi').test(str)
      })
    },

    openSuggestion () {
      return this.username !== '' && this.matches.length !== 0 && this.open === true
    }
  },

  watch: {
    async username () {
      await this.loadSuggestions()
    }
  },

  methods: {
    ...mapActions('message', ['broadcastMessage']),

    enter () {
      this.selection = this.matches[this.current]
      this.open = false
    },

    up () {
      if (this.current > 0) { this.current-- }
    },

    down () {
      if (this.current < this.matches.length - 1) { this.current++ }
    },

    change () {
      if (this.open === false) {
        this.open = true
        this.current = 0
      }
    },

    isActive (index) {
      return index === this.username
    },

    suggestionClick (index) {
      this.username = this.matches[index]
      this.open = false
    },

    async loadSuggestions () {
      if (this.username.length < 3) { return }

      try {
        this.suggestions = await client.database.call('lookup_accounts', [this.username, 10])
      } catch {
        this.suggestions = []
      }
    },

    sendFriendRequest () {
      this.broadcastMessage({ type: 'request-friendship', payload: { username: this.username } })

      this.username = ''
    }
  }
}
</script>

<style>
</style>
