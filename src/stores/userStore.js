// src/stores/userStore.js
import { defineStore } from 'pinia'
import userService from '@/services/userService'

export const useUserStore = defineStore('users', {
  state: () => ({
    users: [],
    user: null,
    pagination: {},
    loading: false,
    filters: {
      search: '',
      status: 'active',
    },
  }),

  actions: {
    async fetchUsers(page = 1, newFilters = null) {
      this.loading = true
      if (newFilters) {
        this.filters = { ...this.filters, ...newFilters }
      }

      try {
        const response = await userService.get(page, this.filters)
        this.users = response.data.data || []
        this.pagination = response.data.meta || {}
      } catch (error) {
        console.error('Failed to fetch users:', error)
        this.users = []
        this.pagination = {}
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchOneUser(id) {
      this.loading = true
      try {
        const response = await userService.find(id)
        this.user = response.data
        return response.data
      } catch (error) {
        console.error(`Failed to fetch user ${id}:`, error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createUser(payload) {
      try {
        await userService.create(payload)
      } catch (error) {
        console.error('Failed to create user:', error)
        throw error
      }
    },

    async updateUser(id, payload) {
      try {
        await userService.update(id, payload)
      } catch (error) {
        console.error(`Failed to update user ${id}:`, error)
        throw error
      }
    },

    async deleteUser(id) {
      try {
        await userService.delete(id)
      } catch (error) {
        console.error(`Failed to delete user ${id}:`, error)
        throw error
      }
    },

    async approveUser(id, payload) {
      this.loading = true
      try {
        await userService.approve(id, payload)
      } catch (error) {
        console.error(`Failed to approve user ${id}:`, error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * [إضافة مستحدثة] استدعاء خدمة تبديل حالة الحساب من نشط إلى معلق والعكس
     */
    async toggleUserStatus(id) {
      this.loading = true
      try {
        const response = await userService.toggleStatus(id)
        return response.data
      } catch (error) {
        console.error(`Failed to toggle status for user ${id}:`, error)
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
