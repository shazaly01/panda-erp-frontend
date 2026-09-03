import { defineStore } from 'pinia'
import { ref } from 'vue'
import unitService from '../services/unit.service'

export const useUnitStore = defineStore('inventoryUnit', () => {
  // ==========================
  // 1. State
  // ==========================
  const units = ref([])
  const pagination = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  // جلب قائمة وحدات القياس
  async function fetchUnits(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await unitService.get(params)
      if (response.data?.data) {
        units.value = response.data.data
        pagination.value = response.data.meta || response.data.pagination || null
      } else {
        units.value = response.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحميل وحدات القياس'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // إنشاء وحدة قياس جديدة
  async function createUnit(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await unitService.create(payload)
      await fetchUnits()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إنشاء وحدة القياس'
      throw err
    } finally {
      loading.value = false
    }
  }

  // تحديث وحدة قياس
  async function updateUnit(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await unitService.update(id, payload)
      await fetchUnits()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث وحدة القياس'
      throw err
    } finally {
      loading.value = false
    }
  }

  // حذف وحدة قياس
  async function deleteUnit(id) {
    loading.value = true
    error.value = null
    try {
      await unitService.delete(id)
      await fetchUnits()
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل حذف وحدة القياس'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    units,
    pagination,
    loading,
    error,
    fetchUnits,
    createUnit,
    updateUnit,
    deleteUnit,
  }
})
