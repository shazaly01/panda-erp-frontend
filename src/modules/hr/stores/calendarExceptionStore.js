import { defineStore } from 'pinia'
import { ref } from 'vue'
import calendarExceptionService from '../services/calendarException.service'

export const useCalendarExceptionStore = defineStore('hrCalendarException', () => {
  // ==========================
  // 1. State
  // ==========================
  const exceptions = ref([])
  const singleException = ref(null)
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

  async function fetchExceptions(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await calendarExceptionService.get(filters)
      const incomingData = response.data?.data || response.data || []
      exceptions.value = Array.isArray(incomingData) ? incomingData : []

      if (response.data?.meta) {
        pagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل قائمة العطلات والطوارئ'
      exceptions.value = []
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchExceptionById(id) {
    loading.value = true
    error.value = null
    singleException.value = null
    try {
      const response = await calendarExceptionService.find(id)
      singleException.value = response.data?.data || response.data
      return singleException.value
    } catch (err) {
      error.value = 'فشل جلب تفاصيل الحالة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createException(payload) {
    loading.value = true
    error.value = null
    try {
      await calendarExceptionService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تسجيل الحالة الجديدة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateException(id, payload) {
    loading.value = true
    error.value = null
    try {
      await calendarExceptionService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث بيانات الحالة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteException(id) {
    loading.value = true
    error.value = null
    try {
      await calendarExceptionService.delete(id)
      if (Array.isArray(exceptions.value)) {
        exceptions.value = exceptions.value.filter((exception) => exception.id !== id)
      }
      if (pagination.value.total > 0) {
        pagination.value.total -= 1
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل عملية الحذف'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    exceptions,
    singleException,
    pagination,
    loading,
    error,

    // Actions
    fetchExceptions,
    fetchExceptionById,
    createException,
    updateException,
    deleteException,
  }
})
