<script setup lang="ts">
import { useAuthStore } from '../store/auth'
const auth = useAuthStore()
</script>

<template>
  <div class="container py-5 text-center">
    <h1 class="mb-4">Vita</h1>

    <div v-if="!auth.user">
      <p class="mb-4">Welcome to Vita — your personal daily journal.</p>
      <div class="d-flex justify-content-center gap-3">
        <router-link to="/login" class="btn btn-primary">Login</router-link>
        <router-link to="/register" class="btn btn-outline-primary">Register</router-link>
      </div>
    </div>

    <div v-else>
      <h2>Hello, {{ auth.user.username }} 👋</h2>
      <p class="text-muted">This is your activity calendar (coming soon!)</p>
      <div class="mt-4">
        <button class="btn btn-secondary" @click="auth.logout">Logout</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 600;
}
</style>
