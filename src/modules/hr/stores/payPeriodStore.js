import { defineStore } from 'pinia'
import { ref } from 'vue'
import payPeriodService from '../services/payPeriod.service'

export const usePayPeriodStore = defineStore('hrPayPeriod', () => {
  // ==========================
  // 1. State
  // ==========================
  const periods = ref([])
  const pagination = ref(null)
  const singlePeriod = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  // جلب الفترات المفتوحة فقط (مخصصة لشاشة مسير الرواتب)
  async function fetchOpenPeriods(payGroupId) {
    if (!payGroupId) {
      periods.value = []
      return
    }

    loading.value = true
    error.value = null
    try {
      const response = await payPeriodService.getOpenPeriods(payGroupId)
      const incomingData = response.data?.data || response.data || []
      periods.value = Array.isArray(incomingData) ? incomingData : []
    } catch (err) {
      error.value = 'فشل تحميل الفترات المالية المفتوحة'
      periods.value = []
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // جلب جميع الفترات (لشاشة إدارة الفترات المالية)
  async function fetchPayPeriods(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await payPeriodService.get(filters)

      // 🌟 التعديل هنا: التقاط البيانات بذكاء سواء كانت مغلفة أو مصفوفة مباشرة
      const incomingData = response.data?.data || response.data || []
      periods.value = Array.isArray(incomingData) ? incomingData : []

      // التقاط بيانات الترقيم
      pagination.value = response.data?.meta || null
    } catch (err) {
      error.value = 'فشل تحميل قائمة الفترات المالية'
      periods.value = []
      pagination.value = null
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // جلب تفاصيل فترة مالية محددة
  async function fetchPayPeriodById(id) {
    loading.value = true
    error.value = null
    singlePeriod.value = null
    try {
      const response = await payPeriodService.find(id)
      singlePeriod.value = response.data?.data || response.data
      return singlePeriod.value
    } catch (err) {
      error.value = 'فشل جلب تفاصيل الفترة المالية'
      throw err
    } finally {
      loading.value = false
    }
  }

  // إنشاء فترة مالية جديدة
  async function createPayPeriod(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await payPeriodService.create(payload)
      const newPeriod = response.data?.data || response.data
      // إضافة الفترة الجديدة في بداية القائمة (لأنها عادة الأحدث)
      periods.value.unshift(newPeriod)
      return newPeriod
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إنشاء الفترة المالية'
      throw err
    } finally {
      loading.value = false
    }
  }

  // تحديث فترة مالية (مثل تعديل التواريخ أو إغلاقها يدوياً)
  async function updatePayPeriod(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await payPeriodService.update(id, payload)
      const updatedPeriod = response.data?.data || response.data

      const index = periods.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        periods.value[index] = updatedPeriod
      }
      return updatedPeriod
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث الفترة المالية'
      throw err
    } finally {
      loading.value = false
    }
  }

  // حذف فترة مالية
  async function deletePayPeriod(id) {
    loading.value = true
    error.value = null
    try {
      await payPeriodService.delete(id)
      periods.value = periods.value.filter((p) => p.id !== id)
    } catch (err) {
      error.value =
        err.response?.data?.message || 'لا يمكن حذف هذه الفترة لارتباطها بمسيرات رواتب سابقة.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function generatePeriods(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await payPeriodService.generate(payload)

      // بعد نجاح التوليد، نقوم بجلب القائمة من جديد لتحديث الواجهة
      await fetchPayPeriods({ pay_group_id: payload.pay_group_id })

      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل توليد الفترات المالية'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    periods,
    pagination,
    singlePeriod,
    loading,
    error,

    // Actions
    fetchOpenPeriods,
    fetchPayPeriods,
    fetchPayPeriodById,
    createPayPeriod,
    updatePayPeriod,
    deletePayPeriod,
    generatePeriods,
  }
})
