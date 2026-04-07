//src\modules\hr\stores\attendanceLogStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import attendanceLogService from '../services/attendanceLog.service'

export const useAttendanceLogStore = defineStore('hrAttendanceLog', () => {
  // ==========================
  // 1. State
  // ==========================
  const logs = ref([])
  const singleLog = ref(null)
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

  async function fetchLogs(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await attendanceLogService.get(filters)
      logs.value = response.data.data
      if (response.data.meta) {
        pagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل سجلات الحضور'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchLogById(id) {
    loading.value = true
    error.value = null
    singleLog.value = null
    try {
      const response = await attendanceLogService.find(id)
      singleLog.value = response.data.data
      return singleLog.value
    } catch (err) {
      error.value = 'فشل جلب تفاصيل سجل الحضور'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createLog(payload) {
    loading.value = true
    error.value = null
    try {
      await attendanceLogService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تسجيل الحضور'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateLog(id, payload) {
    loading.value = true
    error.value = null
    try {
      await attendanceLogService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث سجل الحضور'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteLog(id) {
    loading.value = true
    error.value = null
    try {
      await attendanceLogService.delete(id)
      logs.value = logs.value.filter((log) => log.id !== id)
      pagination.value.total -= 1
    } catch (err) {
      error.value = err.response?.data?.message || 'لا يمكن حذف سجل الحضور'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    logs,
    singleLog,
    pagination,
    loading,
    error,

    fetchLogs,
    fetchLogById,
    createLog,
    updateLog,
    deleteLog,
  }
})
