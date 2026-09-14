import { defineStore } from 'pinia'
import { ref } from 'vue'
import purchaseIssueService from '../services/purchaseIssue.service'

export const usePurchaseIssueStore = defineStore('purchaseIssue', () => {
  // ==========================
  // 1. State
  // ==========================
  const issues = ref([])
  const pagination = ref(null)
  const currentIssue = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const validationErrors = ref(null)

  // ==========================
  // 2. Helpers
  // ==========================
  function cleanFilters(filters) {
    return Object.keys(filters).reduce((acc, key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        acc[key] = filters[key]
      }
      return acc
    }, {})
  }

  // ==========================
  // 3. Actions
  // ==========================

  async function fetchIssues(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)

    try {
      const response = await purchaseIssueService.get({ page, ...cleaned })
      issues.value = response.data.data || []
      pagination.value = response.data.meta || null
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب أذونات الصرف المخزني.'
      issues.value = []
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchIssue(id) {
    loading.value = true
    error.value = null
    currentIssue.value = null

    try {
      const response = await purchaseIssueService.find(id)
      currentIssue.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب تفاصيل إذن الصرف.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createIssue(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await purchaseIssueService.create(payload)
      currentIssue.value = response.data.data || null
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إنشاء إذن الصرف المخزني.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateIssue(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await purchaseIssueService.update(id, payload)
      currentIssue.value = response.data.data || null
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث إذن الصرف المخزني.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function confirmIssue(id) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await purchaseIssueService.confirm(id)
      currentIssue.value = response.data.data || null
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تأكيد وترحيل إذن الصرف المخزني.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cancelIssue(id) {
    loading.value = true
    error.value = null

    try {
      const response = await purchaseIssueService.cancel(id)
      currentIssue.value = response.data.data || null
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إلغاء إذن الصرف المخزني.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteIssue(id) {
    loading.value = true
    error.value = null

    try {
      const response = await purchaseIssueService.delete(id)
      if (currentIssue.value?.id === id) {
        currentIssue.value = null
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف مسودة إذن الصرف.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function resetCurrentIssue() {
    currentIssue.value = null
  }

  return {
    issues,
    pagination,
    currentIssue,
    loading,
    error,
    validationErrors,
    fetchIssues,
    fetchIssue,
    createIssue,
    updateIssue,
    confirmIssue,
    cancelIssue,
    deleteIssue,
    resetCurrentIssue,
  }
})
