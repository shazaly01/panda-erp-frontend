// src/stores/authStore.js
import { defineStore } from 'pinia'
import authService from '@/services/authService'
import { useAppStore } from '@/stores/appStore'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    returnUrl: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    permissions: (state) => {
      if (state.user && Array.isArray(state.user.roles)) {
        const allPermissions = state.user.roles.flatMap((role) =>
          Array.isArray(role.permissions) ? role.permissions.map((p) => p.name) : [],
        )
        return [...new Set(allPermissions)]
      }
      return []
    },
  },

  actions: {
    async login(credentials) {
      // credentials المتوقع إرسالها: { phone, password }
      const response = await authService.login(credentials)
      const { access_token, user } = response.data

      this.token = access_token
      this.user = user

      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(user))
    },

    async sendOtp(payload) {
      return await authService.sendOtp(payload)
    },

    async register(payload) {
      return await authService.register(payload)
    },

    async forgotPassword(payload) {
      return await authService.forgotPassword(payload)
    },

    async resetPassword(payload) {
      return await authService.resetPassword(payload)
    },

    async logout() {
      try {
        await authService.logout()
      } catch (error) {
        console.error('Logout API call failed, but clearing local state anyway:', error)
      } finally {
        const appStore = useAppStore()
        appStore.clearAppSession()

        this.user = null
        this.token = null
        this.returnUrl = null

        localStorage.removeItem('token')
        localStorage.removeItem('user')

        window.location.href = '/login'
      }
    },

    can(permissionName) {
      if (!permissionName) return true

      if (
        this.user &&
        Array.isArray(this.user.roles) &&
        this.user.roles.some((role) => role.name === 'Super Admin')
      ) {
        return true
      }

      return this.permissions.includes(permissionName)
    },
  },
})
