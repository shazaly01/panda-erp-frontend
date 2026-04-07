// src/stores/authStore.js
import { defineStore } from 'pinia'
import authService from '@/services/authService'

// دالة مساعدة لضمان عدم انهيار التطبيق عند وجود بيانات فاسدة في المتصفح
const safelyParseJSON = (jsonString) => {
  try {
    // إذا كانت القيمة غير موجودة أو عبارة عن النص "undefined" حرفياً، نرجع null
    if (!jsonString || jsonString === 'undefined') {
      return null
    }
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Failed to parse user data from localStorage. Clearing corrupted data.', error)
    localStorage.removeItem('user') // تنظيف فوري للبيانات الفاسدة
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // التعديل الجذري هنا: استخدام الدالة الآمنة بدلاً من JSON.parse المباشرة
    user: safelyParseJSON(localStorage.getItem('user')),
    token: localStorage.getItem('token') || null,
    returnUrl: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    permissions: (state) => {
      if (state.user && state.user.roles) {
        const allPermissions = state.user.roles.flatMap((role) =>
          role.permissions.map((p) => p.name),
        )
        return [...new Set(allPermissions)]
      }
      return []
    },
  },

  actions: {
    async login(credentials) {
      const response = await authService.login(credentials)
      const { access_token, user } = response.data

      this.token = access_token
      this.user = user

      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(user))
    },

    async logout() {
      try {
        await authService.logout()
      } catch (error) {
        console.error('Logout API call failed, but clearing local state anyway:', error)
      } finally {
        this.user = null
        this.token = null
        this.returnUrl = null

        localStorage.removeItem('token')
        localStorage.removeItem('user')

        window.location.href = '/login'
      }
    },

    can(permissionName) {
      if (this.user && this.user.roles.some((role) => role.name === 'Super Admin')) {
        return true
      }
      return this.permissions.includes(permissionName)
    },
  },
})
