//src\modules\inventory\stores\adjustmentStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import adjustmentService from '../services/adjustment.service'

export const useAdjustmentStore = defineStore('inventoryAdjustment', () => {
  // ==========================
  // 1. State
  // ==========================
  const adjustments = ref([])
  const pagination = ref(null)
  const currentAdjustment = ref(null)
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

  async function fetchAdjustments(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)

    try {
      const response = await adjustmentService.get({ page, ...cleaned })
      adjustments.value = response.data.data || []
      pagination.value = response.data.meta || null
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب مستندات التسوية.'
      adjustments.value = []
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchAdjustment(id) {
    loading.value = true
    error.value = null
    currentAdjustment.value = null

    try {
      const response = await adjustmentService.find(id)
      currentAdjustment.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب بيانات مستند التسوية.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createAdjustment(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await adjustmentService.create(payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إنشاء مستند التسوية.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateAdjustment(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await adjustmentService.update(id, payload)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث مستند التسوية.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function approveAdjustment(id) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await adjustmentService.approve(id)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في اعتماد مستند التسوية.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteAdjustment(id) {
    loading.value = true
    error.value = null

    try {
      const response = await adjustmentService.delete(id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف مستند التسوية.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function resetCurrentAdjustment() {
    currentAdjustment.value = null
  }

  return {
    adjustments,
    pagination,
    currentAdjustment,
    loading,
    error,
    validationErrors,
    fetchAdjustments,
    fetchAdjustment,
    createAdjustment,
    updateAdjustment,
    approveAdjustment,
    deleteAdjustment,
    resetCurrentAdjustment,
  }
})
