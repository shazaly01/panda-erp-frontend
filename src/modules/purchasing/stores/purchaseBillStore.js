//src\modules\purchasing\stores\purchaseBillStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import purchaseBillService from '../services/purchaseBill.service'

export const usePurchaseBillStore = defineStore('purchasingBill', () => {
  // ==========================
  // 1. State
  // ==========================
  const bills = ref([])
  const pagination = ref(null)
  const currentBill = ref(null)
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

  async function fetchBills(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)

    try {
      const response = await purchaseBillService.get({ page, ...cleaned })
      bills.value = response.data.data || []
      pagination.value = response.data.meta || null
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب فواتير المشتريات.'
      bills.value = []
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchBill(id) {
    loading.value = true
    error.value = null
    currentBill.value = null

    try {
      const response = await purchaseBillService.find(id)
      currentBill.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب بيانات فاتورة الشراء.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createBill(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await purchaseBillService.create(payload)
      currentBill.value = response.data.data || null
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إنشاء فاتورة الشراء.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateBill(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await purchaseBillService.update(id, payload)
      currentBill.value = response.data.data || null
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث فاتورة الشراء.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function postBill(id) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await purchaseBillService.post(id)
      currentBill.value = response.data.data || null
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في ترحيل فاتورة الشراء.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cancelBill(id) {
    loading.value = true
    error.value = null

    try {
      const response = await purchaseBillService.cancel(id)
      currentBill.value = response.data.data || null
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إلغاء فاتورة الشراء.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteBill(id) {
    loading.value = true
    error.value = null

    try {
      const response = await purchaseBillService.delete(id)
      if (currentBill.value?.id === id) {
        currentBill.value = null
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف فاتورة الشراء.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function resetCurrentBill() {
    currentBill.value = null
  }

  return {
    bills,
    pagination,
    currentBill,
    loading,
    error,
    validationErrors,
    fetchBills,
    fetchBill,
    createBill,
    updateBill,
    postBill,
    cancelBill,
    deleteBill,
    resetCurrentBill,
  }
})
