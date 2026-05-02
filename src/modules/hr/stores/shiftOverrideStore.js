import { defineStore } from 'pinia'
import { ref } from 'vue'
import shiftOverrideService from '../services/shiftOverride.service'

export const useShiftOverrideStore = defineStore('hrShiftOverride', () => {
  // ==========================
  // 1. State
  // ==========================
  const overrides = ref([])
  const singleOverride = ref(null)
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

  async function fetchOverrides(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await shiftOverrideService.get(filters)
      const incomingData = response.data?.data || response.data || []
      overrides.value = Array.isArray(incomingData) ? incomingData : []

      if (response.data?.meta) {
        pagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل قائمة التجاوزات'
      overrides.value = []
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchOverrideById(id) {
    loading.value = true
    error.value = null
    singleOverride.value = null
    try {
      const response = await shiftOverrideService.find(id)
      singleOverride.value = response.data?.data || response.data
      return singleOverride.value
    } catch (err) {
      error.value = 'فشل جلب تفاصيل التجاوز'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createOverride(payload) {
    loading.value = true
    error.value = null
    try {
      await shiftOverrideService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل اعتماد التجاوز الجديد'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateOverride(id, payload) {
    loading.value = true
    error.value = null
    try {
      await shiftOverrideService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث التجاوز'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteOverride(id) {
    loading.value = true
    error.value = null
    try {
      await shiftOverrideService.delete(id)
      if (Array.isArray(overrides.value)) {
        overrides.value = overrides.value.filter((override) => override.id !== id)
      }
      if (pagination.value.total > 0) {
        pagination.value.total -= 1
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل عملية إلغاء التجاوز'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    overrides,
    singleOverride,
    pagination,
    loading,
    error,

    // Actions
    fetchOverrides,
    fetchOverrideById,
    createOverride,
    updateOverride,
    deleteOverride,
  }
})
