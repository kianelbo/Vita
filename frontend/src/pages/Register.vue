<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const auth = useAuthStore()
const email = ref('')
const username = ref('')
const password = ref('')
const error = ref('')

async function handleRegister() {
  try {
    await auth.register(email.value, username.value, password.value)
    router.push('/')
  } catch (e: any) {
    console.log(e);
    error.value = e?.response?.data?.message || 'Registration failed'
  }
}
</script>

<template>
  <div class="container py-5" style="max-width: 400px;">
    <h2 class="mb-4 text-center">Register</h2>
    <form @submit.prevent="handleRegister">
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input v-model="email" type="email" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Username</label>
        <input v-model="username" type="text" class="form-control" required />
      </div>
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input v-model="password" type="password" class="form-control" required />
      </div>
      <button class="btn btn-primary w-100" type="submit">Register</button>
    </form>
    <p v-if="error" class="text-danger mt-3 text-center">{{ error }}</p>
  </div>
</template>
