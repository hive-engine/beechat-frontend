<template>
  <div class="login">
    <b-modal id="loginModal" title="Login" hide-footer centered>
      <template v-slot:default>
        <div class="pt-md-3 pb-md-3 pr-md-5 pl-md-5">
          <div class="form-group">
            <b-form-input
              v-model="username"
              placeholder="Hive username"
              @keyup.enter="logMeIn"
            />
          </div>

          <div class="text-center">
            <b-button variant="success" block @click="logMeIn">
              Login with Keychain
            </b-button>
            <hr>

            <b-button
              variant="secondary"
              block
              @click.prevent="$bvModal.show('smartLock')"
            >
              SmartLock
            </b-button>
          </div>
        </div>
      </template>
    </b-modal>

    <SmartLock :callback="smartLockLogin" />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import SmartLock from '@/components/smartlock/SmartLock.vue'

export default {
  name: 'LoginModal',

  components: {
    SmartLock
  },

  data () {
    return {
      username: '',
      password: ''
    }
  },

  computed: {
    ...mapGetters('user', ['isAuthenticated']),

    isKeychain () {
      return !!(window.hive_keychain)
    }
  },

  async beforeMount () {
    try {
      const redirect = (this.$route.query.redirect) ? this.$route.query.redirect : undefined

      await this.refreshToken(redirect)
    } catch (e) {
      console.log(e)
    }
  },

  mounted () {
    this.$root.$on('smartLockLoggedIn', () => {
      this.$root.$bvModal.hide('loginModal')
    })
  },

  methods: {
    ...mapActions('user', ['login', 'logout', 'loginWithKey', 'refreshToken']),

    async logMeIn () {
      if (window.hive_keychain) {
        const data = {
          username: this.username
        }

        if (this.$route.query.redirect) {
          data.redirect = this.$route.query.redirect
        }

        await this.login(data)
      }

      this.$bvModal.hide('loginModal')
    },

    logMeOut () {
      this.logout(this.$router)
    },

    async smartLockLogin (username, wif) {
      const data = { username, wif }

      if (this.$route.query.redirect) {
        data.redirect = this.$route.query.redirect
      }

      await this.loginWithKey(data)
    }
  }
}
</script>

<style>
</style>
