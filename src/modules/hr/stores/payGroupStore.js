import { defineStore } from 'pinia'
import { ref } from 'vue'
import payGroupService from '../services/payGroup.service'

export const usePayGroupStore = defineStore('hrPayGroup', () => {
  // ==========================
  // 1. State
  // ==========================
  const groups = ref([])
  const singleGroup = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  // جلب جميع المجموعات (مع دعم الفلترة)
  async function fetchPayGroups(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await payGroupService.get(filters)
      const incomingData = response.data?.data || response.data || []
      groups.value = Array.isArray(incomingData) ? incomingData : []
    } catch (err) {
      error.value = 'فشل تحميل قائمة مجموعات الدفع'
      groups.value = []
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // جلب تفاصيل مجموعة محددة
  async function fetchPayGroupById(id) {
    loading.value = true
    error.value = null
    singleGroup.value = null
    try {
      const response = await payGroupService.find(id)
      singleGroup.value = response.data?.data || response.data
      return singleGroup.value
    } catch (err) {
      error.value = 'فشل جلب تفاصيل مجموعة الدفع'
      throw err
    } finally {
      loading.value = false
    }
  }

  // إنشاء مجموعة جديدة
  async function createPayGroup(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await payGroupService.create(payload)
      const newGroup = response.data?.data || response.data
      // تحديث القائمة محلياً
      groups.value.push(newGroup)
      return newGroup
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إنشاء مجموعة الدفع'
      throw err
    } finally {
      loading.value = false
    }
  }

  // تحديث بيانات مجموعة
  async function updatePayGroup(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await payGroupService.update(id, payload)
      const updatedGroup = response.data?.data || response.data

      // تحديث القائمة محلياً
      const index = groups.value.findIndex((g) => g.id === id)
      if (index !== -1) {
        groups.value[index] = updatedGroup
      }
      return updatedGroup
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث مجموعة الدفع'
      throw err
    } finally {
      loading.value = false
    }
  }

  // حذف مجموعة
  async function deletePayGroup(id) {
    loading.value = true
    error.value = null
    try {
      await payGroupService.delete(id)
      // إزالة من القائمة محلياً
      groups.value = groups.value.filter((g) => g.id !== id)
    } catch (err) {
      error.value =
        err.response?.data?.message || 'لا يمكن حذف هذه المجموعة لارتباطها ببيانات أخرى.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    groups,
    singleGroup,
    loading,
    error,

    // Actions
    fetchPayGroups,
    fetchPayGroupById,
    createPayGroup,
    updatePayGroup,
    deletePayGroup,
  }
})
