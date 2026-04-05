import { defineStore } from 'pinia'
import { ref } from 'vue'
import leaveService from '../services/leave.service'

export const useLeaveStore = defineStore('hrLeave', () => {
  // ==========================
  // 1. State
  // ==========================
  const leaves = ref([])
  const singleLeave = ref(null)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  async function fetchLeaves(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await leaveService.get(filters)
      leaves.value = response.data.data
      if (response.data.meta) {
        pagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل قائمة الإجازات'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchLeaveById(id) {
    loading.value = true
    error.value = null
    singleLeave.value = null
    try {
      const response = await leaveService.find(id)
      singleLeave.value = response.data.data
      return singleLeave.value
    } catch (err) {
      error.value = 'فشل جلب تفاصيل طلب الإجازة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createLeave(payload) {
    loading.value = true
    error.value = null
    try {
      await leaveService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تقديم طلب الإجازة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateLeave(id, payload) {
    loading.value = true
    error.value = null
    try {
      await leaveService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث طلب الإجازة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteLeave(id) {
    loading.value = true
    error.value = null
    try {
      await leaveService.delete(id)
      leaves.value = leaves.value.filter((leave) => leave.id !== id)
      pagination.value.total -= 1
    } catch (err) {
      error.value = err.response?.data?.message || 'لا يمكن إلغاء هذا الطلب'
      throw err
    } finally {
      loading.value = false
    }
  }

  // --- العمليات الإدارية ---

  async function approveLeave(id) {
    loading.value = true
    error.value = null
    try {
      const response = await leaveService.approve(id)

      // تحديث حالة الإجازة محلياً لتغيير الواجهة فوراً (Reactive Update)
      const index = leaves.value.findIndex((l) => l.id === id)
      if (index !== -1) {
        leaves.value[index] = response.data.data
      }

      // تحديث المتغير الفردي إذا كنا في صفحة التفاصيل
      if (singleLeave.value && singleLeave.value.id === id) {
        singleLeave.value = response.data.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل اعتماد الإجازة'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    leaves,
    singleLeave,
    pagination,
    loading,
    error,

    fetchLeaves,
    fetchLeaveById,
    createLeave,
    updateLeave,
    deleteLeave,
    approveLeave,
  }
})
