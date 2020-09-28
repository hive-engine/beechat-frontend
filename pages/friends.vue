<template>
  <div class="container">
    <h1>Friends</h1>

    <add-friend />

    <b-tabs content-class="mt-3" justified align="center" class="mt-5" lazy>
      <b-tab title="Friends" active>
        <b-table show-empty striped :fields="fields" :items="computedFriends">
          <template v-slot:cell(actions)="data">
            <b-button
              size="sm"
              title="Remove from Friends"
              variant="danger"
              @click.prevent="removeFriendship(data.item.username)"
            >
              <v-icon name="user-minus" />
            </b-button>
          </template>
        </b-table>
      </b-tab>

      <b-tab title="Blocked">
        <b-table show-empty striped :fields="fields" :items="computedBlocked">
          <template v-slot:cell(actions)="data">
            <b-button
              size="sm"
              title="Unblock"
              variant="danger"
              @click.prevent="unblockUser(data.item.username)"
            >
              <v-icon name="user-x" />
            </b-button>
          </template>
        </b-table>
      </b-tab>

      <b-tab>
        <template v-slot:title>
          Friend Requests
          <b-badge v-if="friend_requests.length > 0" variant="danger">
            {{ friend_requests.length }}
          </b-badge>
        </template>

        <b-table show-empty striped :fields="fields" :items="friend_requests">
          <template v-slot:cell(actions)="data">
            <b-button
              size="sm"
              title="Accept Friend Request"
              variant="success"
              @click.prevent="acceptFriendship(data.item.id)"
            >
              <v-icon name="user-check" />
            </b-button>
            <b-button
              size="sm"
              title="Reject Friend Request"
              variant="danger"
              @click.prevent="rejectFriendship(data.item.id)"
            >
              <v-icon name="x" />
            </b-button>
          </template>
        </b-table>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import AddFriend from '@/components/AddFriend.vue'

export default {
  name: 'Friends',

  middleware: 'authenticated',

  components: {
    AddFriend
  },

  async fetch () {
    await Promise.all([this.fetchFriends(),
      this.fetchFriendRequests()
    ])
  },

  data () {
    return {
      fields: [
        { key: 'username', label: '' },
        { key: 'actions', label: '' }
      ]
    }
  },

  computed: {
    ...mapGetters('user', ['friends', 'blocked', 'friend_requests']),

    computedFriends () {
      return this.friends.map(user => ({ username: user }))
    },

    computedBlocked () {
      return this.blocked.map(user => ({ username: user }))
    }
  },

  methods: {
    ...mapActions('user', ['fetchFriends', 'fetchFriendRequests']),
    ...mapActions('message', ['broadcastMessage']),

    acceptFriendship (id) {
      this.broadcastMessage({ type: 'accept-friendship', payload: { id } })
    },

    rejectFriendship (id) {
      this.broadcastMessage({ type: 'reject-friendship', payload: { id } })
    },

    removeFriendship (username) {
      this.broadcastMessage({ type: 'remove-friendship', payload: { username } })
    },

    unblockUser (username) {
      this.broadcastMessage({ type: 'unblock-user', payload: { username } })
    }
  }
}
</script>

<style lang="scss">
</style>
