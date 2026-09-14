// src/modules/purchasing/stores/purchaseRequisitionStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import purchaseRequisitionService from '../services/purchaseRequisition.service'

export const usePurchaseRequisitionStore = defineStore('purchasingRequisition', () => {
  // ==========================
  // 1. State
  // ==========================
  const requisitions = ref([])
  const pagination = ref(null)
  const currentRequisition = ref(null)
  const triageOverview = ref(null)
  const loading = ref(false)
  const triageLoading = ref(false)
  const error = ref(null)
  const validationErrors = ref(null)

  // ==========================
  // 2. Helpers
  // ==========================
  function cleanFilters(filters) {
    return Object.keys(filters).reduce((acc, key) => {
      if (filters[key] !== null && filters[key] !== '' && filters[key] !== undefined) {
        acc[key] = filters[key]
      }
      return acc
    }, {})
  }

  // ==========================
  // 3. Actions
  // ==========================

  // جلب قائمة الطلبات مع الترقيم والفلاتر
  async function fetchRequisitions(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)

    try {
      const response = await purchaseRequisitionService.get({ page, ...cleaned })
      requisitions.value = response.data.data || []
      pagination.value = response.data.meta || null
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب طلبات الشراء.'
      requisitions.value = []
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // جلب تفاصيل طلب واحد
  async function fetchRequisition(id) {
    loading.value = true
    error.value = null
    currentRequisition.value = null

    try {
      const response = await purchaseRequisitionService.find(id)
      currentRequisition.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب بيانات طلب الشراء.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // إنشاء طلب شراء جديد
  async function createRequisition(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await purchaseRequisitionService.create(payload)
      currentRequisition.value = response.data.data || null
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إنشاء طلب الشراء.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // تحديث طلب شراء
  async function updateRequisition(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await purchaseRequisitionService.update(id, payload)
      currentRequisition.value = response.data.data || null
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث طلب الشراء.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // تقديم الطلب للاعتماد
  async function submitRequisition(id) {
    loading.value = true
    error.value = null

    try {
      const response = await purchaseRequisitionService.submit(id)
      currentRequisition.value = response.data.data || null
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تقديم طلب الشراء للاعتماد.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // اعتماد طلب الشراء
  async function approveRequisition(id) {
    loading.value = true
    error.value = null

    try {
      const response = await purchaseRequisitionService.approve(id)
      currentRequisition.value = response.data.data || null
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في اعتماد طلب الشراء.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // رفض طلب الشراء مع تسجيل السبب
  async function rejectRequisition(id, rejectionReason) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await purchaseRequisitionService.reject(id, {
        rejection_reason: rejectionReason,
      })
      currentRequisition.value = response.data.data || null
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في رفض طلب الشراء.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // حذف طلب الشراء
  async function deleteRequisition(id) {
    loading.value = true
    error.value = null

    try {
      const response = await purchaseRequisitionService.delete(id)
      if (currentRequisition.value?.id === id) {
        currentRequisition.value = null
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف طلب الشراء.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // جلب فحص الأرصدة اللحظية للمستودع المختار
  async function fetchTriageOverview(id, warehouseId) {
    triageLoading.value = true
    error.value = null

    try {
      const response = await purchaseRequisitionService.getTriageOverview(id, warehouseId)
      triageOverview.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في قراءة أرصدة المستودع للفرز.'
      triageOverview.value = null
      console.error(err)
      throw err
    } finally {
      triageLoading.value = false
    }
  }

  // تنفيذ الفرز والتوزيع وتوليد إذن الصرف المخزني
  async function executeTriage(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await purchaseRequisitionService.executeTriage(id, payload)
      if (response.data.requisition) {
        currentRequisition.value = response.data.requisition
      }
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تنفيذ عملية الفرز والتوزيع.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // إعادة تعيين بيانات الفرز
  function clearTriageOverview() {
    triageOverview.value = null
  }

  // إعادة تعيين الطلب الحالي
  function resetCurrentRequisition() {
    currentRequisition.value = null
    triageOverview.value = null
  }

  return {
    requisitions,
    pagination,
    currentRequisition,
    triageOverview,
    loading,
    triageLoading,
    error,
    validationErrors,
    fetchRequisitions,
    fetchRequisition,
    createRequisition,
    updateRequisition,
    submitRequisition,
    approveRequisition,
    rejectRequisition,
    deleteRequisition,
    fetchTriageOverview,
    executeTriage,
    clearTriageOverview,
    resetCurrentRequisition,
  }
})
