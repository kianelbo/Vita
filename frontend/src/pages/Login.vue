<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const auth = useAuthStore()
const emailOrUsername = ref('')
const password = ref('')
const error = ref('')

async function handleLogin() {
  try {
    await auth.login(emailOrUsername.value, password.value)
    router.push('/')
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Login failed'
  }
}
</script>

<template>
  <div class="container py-5" style="max-width: 400px;">
    <h2 class="mb-4 text-center">Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="mb-3">
        <label class="form-label">Email or username</label>
        <input v-model="emailOrUsername" type="text" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input v-model="password" type="password" class="form-control" required />
      </div>
      <button class="btn btn-primary w-100" type="submit">Login</button>
    </form>
    <p v-if="error" class="text-danger mt-3 text-center">{{ error }}</p>
  </div>
</template>
