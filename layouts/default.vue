<template>
  <div>
    <Navbar />

    <Nuxt :key="$route.fullPath" />

    <LoginModal />
  </div>
</template>

<script>
import LoginModal from '@/components/modals/Login.vue'
import Navbar from '@/components/Navbar.vue'
export default {
  components: {
    LoginModal,
    Navbar
  }
}
</script>

<style>
</style>
