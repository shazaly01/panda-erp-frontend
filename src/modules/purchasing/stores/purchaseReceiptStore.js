// src/modules/purchasing/stores/purchaseReceiptStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import purchaseReceiptService from '../services/purchaseReceipt.service'

export const usePurchaseReceiptStore = defineStore('purchaseReceipt', () => {
  // ==========================
  // 1. State
  // ==========================
  const receipts = ref([])
  const pagination = ref(null)
  const currentReceipt = ref(null)
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

  async function fetchReceipts(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)

    try {
      const response = await purchaseReceiptService.get({ page, ...cleaned })
      receipts.value = response.data.data || []
      pagination.value = response.data.meta || null
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب سندات الاستلام المخزني.'
      receipts.value = []
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchReceipt(id) {
    loading.value = true
    error.value = null
    currentReceipt.value = null

    try {
      const response = await purchaseReceiptService.find(id)
      currentReceipt.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب تفاصيل سند الاستلام.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createReceipt(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await purchaseReceiptService.create(payload)
      currentReceipt.value = response.data.data || null
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إنشاء سند الاستلام المخزني.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateReceipt(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await purchaseReceiptService.update(id, payload)
      currentReceipt.value = response.data.data || null
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث سند الاستلام المخزني.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function receiveReceipt(id) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await purchaseReceiptService.receive(id)
      currentReceipt.value = response.data.data || null
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تأكيد الاستلام وترحيل حركة المخزون.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cancelReceipt(id) {
    loading.value = true
    error.value = null

    try {
      const response = await purchaseReceiptService.cancel(id)
      currentReceipt.value = response.data.data || null
      return response.data
    } catch (err) {
      error.value =
        err.response?.data?.message || 'فشل في إلغاء سند الاستلام وعكس الحركات المخزنية.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteReceipt(id) {
    loading.value = true
    error.value = null

    try {
      const response = await purchaseReceiptService.delete(id)
      if (currentReceipt.value?.id === id) {
        currentReceipt.value = null
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف مسودة سند الاستلام.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function resetCurrentReceipt() {
    currentReceipt.value = null
  }

  return {
    receipts,
    pagination,
    currentReceipt,
    loading,
    error,
    validationErrors,
    fetchReceipts,
    fetchReceipt,
    createReceipt,
    updateReceipt,
    receiveReceipt,
    cancelReceipt,
    deleteReceipt,
    resetCurrentReceipt,
  }
})
