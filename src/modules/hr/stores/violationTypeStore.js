// src/modules/hr/stores/violationTypeStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import violationTypeService from '../services/violationType.service'

export const useViolationTypeStore = defineStore('hrViolationType', () => {
  // ==========================
  // 1. State
  // ==========================
  const violationTypes = ref([])
  const singleViolationType = ref(null)

  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  async function fetchViolationTypes(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await violationTypeService.get(filters)
      const incomingData = response.data?.data || response.data || []
      violationTypes.value = Array.isArray(incomingData) ? incomingData : []
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحميل قائمة لوائح المخالفات'
      violationTypes.value = []
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchViolationTypeById(id) {
    loading.value = true
    error.value = null
    singleViolationType.value = null
    try {
      const response = await violationTypeService.find(id)
      singleViolationType.value = response.data?.data || response.data
      return singleViolationType.value
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل جلب تفاصيل لائحة المخالفة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createViolationType(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await violationTypeService.create(payload)
      const created = response.data?.data || response.data
      if (created && Array.isArray(violationTypes.value)) {
        violationTypes.value.push(created)
      }
      return created
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إنشاء لائحة المخالفة الجديدة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateViolationType(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await violationTypeService.update(id, payload)
      const updated = response.data?.data || response.data
      if (updated && Array.isArray(violationTypes.value)) {
        const index = violationTypes.value.findIndex((item) => item.id === id)
        if (index !== -1) {
          violationTypes.value[index] = updated
        }
      }
      return updated
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث لائحة المخالفة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteViolationType(id) {
    loading.value = true
    error.value = null
    try {
      await violationTypeService.delete(id)
      if (Array.isArray(violationTypes.value)) {
        violationTypes.value = violationTypes.value.filter((item) => item.id !== id)
      }
    } catch (err) {
      error.value =
        err.response?.data?.message || 'لا يمكن حذف هذه اللائحة لوجود مخالفات مسجلة عليها للموظفين'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    violationTypes,
    singleViolationType,
    loading,
    error,

    fetchViolationTypes,
    fetchViolationTypeById,
    createViolationType,
    updateViolationType,
    deleteViolationType,
  }
})
