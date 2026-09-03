import { defineStore } from 'pinia'
import { ref } from 'vue'
import transferService from '../services/transfer.service'

export const useTransferStore = defineStore('inventoryTransfer', () => {
  // ==========================
  // 1. State
  // ==========================
  const transfers = ref([])
  const pagination = ref(null)
  const currentTransfer = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const validationErrors = ref(null)

  // ==========================
  // 2. Helpers
  // ==========================
  function cleanFilters(filters) {
    return Object.keys(filters).reduce((acc, key) => {
      if (filters[key] !== null && filters[key] !== '') {
        acc[key] = filters[key]
      }
      return acc
    }, {})
  }

  // ==========================
  // 3. Actions
  // ==========================

  async function fetchTransfers(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)

    try {
      const response = await transferService.get({ page, ...cleaned })
      transfers.value = response.data.data || []
      pagination.value = response.data.meta || null
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب أوامر التحويل.'
      transfers.value = []
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchTransfer(id) {
    loading.value = true
    error.value = null
    currentTransfer.value = null

    try {
      const response = await transferService.find(id)
      currentTransfer.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب بيانات أمر التحويل.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createTransfer(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await transferService.create(payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إنشاء أمر التحويل.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTransfer(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await transferService.update(id, payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث أمر التحويل.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function completeTransfer(id) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await transferService.complete(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في اعتماد وترحيل أمر التحويل.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTransfer(id) {
    loading.value = true
    error.value = null

    try {
      const response = await transferService.delete(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف أمر التحويل.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function resetCurrentTransfer() {
    currentTransfer.value = null
  }

  return {
    transfers,
    pagination,
    currentTransfer,
    loading,
    error,
    validationErrors,
    fetchTransfers,
    fetchTransfer,
    createTransfer,
    updateTransfer,
    completeTransfer,
    deleteTransfer,
    resetCurrentTransfer,
  }
})
