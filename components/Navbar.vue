<template>
  <b-navbar toggleable="lg" type="light">
    <div class="container">
      <b-navbar-brand to="/">
        <img src="~assets/logo.png" alt="BeeChat" class="logo">
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse" />

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item
            v-if="!isAuthenticated"
            @click.prevent="$bvModal.show('loginModal')"
          >
            Login
          </b-nav-item>

          <template v-if="isAuthenticated">
            <b-nav-item :to="{ name: 'chats' }">
              Chats
              <b-badge v-if="newMessages > 0" pill variant="danger">
                {{ newMessages }}
              </b-badge>
            </b-nav-item>
            <b-nav-item :to="{ name: 'friends' }">
              Friends
              <b-badge v-if="friend_requests.length > 0" pill variant="danger">
                {{ friend_requests.length }}
              </b-badge>
            </b-nav-item>
            <b-nav-item :to="{ name: 'dashboard' }">
              @{{ username }}
            </b-nav-item>

            <b-nav-item @click.prevent="logout">
              Logout
            </b-nav-item>
          </template>
        </b-navbar-nav>
      </b-collapse>
    </div>
  </b-navbar>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'Navbar',

  computed: {
    ...mapGetters('user', ['isAuthenticated', 'username', 'friend_requests']),
    ...mapGetters('message', ['conversations']),

    newMessages () {
      return this.conversations.reduce((acc, cur) => acc + cur.unread, 0)
    }
  },

  methods: {
    ...mapActions('user', ['logout'])
  }
}
</script>

<style>
</style>
