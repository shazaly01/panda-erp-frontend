//src\modules\hr\stores\workingScheduleStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import workingScheduleService from '../services/workingSchedule.service'

export const useWorkingScheduleStore = defineStore('hrWorkingSchedule', () => {
  // ==========================
  // 1. State
  // ==========================
  const schedules = ref([])
  const singleSchedule = ref(null)
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

  async function fetchSchedules(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await workingScheduleService.get(filters)
      const incomingData = response.data?.data || response.data || []
      schedules.value = Array.isArray(incomingData) ? incomingData : []

      if (response.data?.meta) {
        pagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل قائمة قوالب الجدولة'
      schedules.value = []
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchScheduleById(id) {
    loading.value = true
    error.value = null
    singleSchedule.value = null
    try {
      const response = await workingScheduleService.find(id)
      singleSchedule.value = response.data?.data || response.data
      return singleSchedule.value
    } catch (err) {
      error.value = 'فشل جلب تفاصيل قالب الجدولة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createSchedule(payload) {
    loading.value = true
    error.value = null
    try {
      await workingScheduleService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إنشاء قالب الجدولة الجديد'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateSchedule(id, payload) {
    loading.value = true
    error.value = null
    try {
      await workingScheduleService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث قالب الجدولة'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteSchedule(id) {
    loading.value = true
    error.value = null
    try {
      await workingScheduleService.delete(id)
      if (Array.isArray(schedules.value)) {
        schedules.value = schedules.value.filter((schedule) => schedule.id !== id)
      }
      if (pagination.value.total > 0) {
        pagination.value.total -= 1
      }
    } catch (err) {
      error.value =
        err.response?.data?.message || 'لا يمكن حذف القالب (قد يكون مرتبطاً بعقود موظفين نشطة)'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    schedules,
    singleSchedule,
    pagination,
    loading,
    error,

    // Actions
    fetchSchedules,
    fetchScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  }
})
