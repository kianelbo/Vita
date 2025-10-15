import { defineStore } from 'pinia'
import api from '../api/axios'

interface User {
  id: string
  username: string
  email: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token') || ''
  }),

  actions: {
    async register(email: string, username: string, password: string) {
      const res = await api.post('/users/register', { email, username, password })
      this.setToken(res.data.token)
      await this.fetchUser()
    },

    async login(emailOrUsername: string, password: string) {
      const res = await api.post('/users/login', { emailOrUsername, password })
      this.setToken(res.data.token)
      await this.fetchUser()
    },

    logout() {
      this.user = null
      this.token = ''
      localStorage.removeItem('token')
    },

    async fetchUser() {
      if (!this.token) return
      try {
        const res = await api.get('/users/me')
        this.user = res.data
      } catch {
        this.logout()
      }
    },

    setToken(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    }
  }
})
