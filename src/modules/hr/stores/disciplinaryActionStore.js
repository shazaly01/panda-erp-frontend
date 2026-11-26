// src/modules/hr/stores/disciplinaryActionStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import disciplinaryActionService from '../services/disciplinaryAction.service'

export const useDisciplinaryActionStore = defineStore('hrDisciplinaryAction', () => {
  // ==========================
  // 1. State
  // ==========================
  const actions = ref([])
  const singleAction = ref(null)
  const escalationPreview = ref(null)

  const pagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20,
  })

  const loading = ref(false)
  const previewLoading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  async function fetchActions(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await disciplinaryActionService.get(filters)
      const incomingData = response.data?.data || response.data || []
      actions.value = Array.isArray(incomingData) ? incomingData : []

      if (response.data?.meta) {
        pagination.value = response.data.meta
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحميل سجل المخالفات والجزاءات'
      actions.value = []
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function previewEscalation(payload) {
    previewLoading.value = true
    escalationPreview.value = null
    try {
      const response = await disciplinaryActionService.previewEscalation(payload)
      escalationPreview.value = response.data?.data || response.data
      return escalationPreview.value
    } catch (err) {
      escalationPreview.value = null
      throw err
    } finally {
      previewLoading.value = false
    }
  }

  function clearPreview() {
    escalationPreview.value = null
  }

  async function fetchActionById(id) {
    loading.value = true
    error.value = null
    singleAction.value = null
    try {
      const response = await disciplinaryActionService.find(id)
      singleAction.value = response.data?.data || response.data
      return singleAction.value
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل جلب تفاصيل الجزاء التأديبي'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createAction(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await disciplinaryActionService.create(payload)
      return response.data?.data || response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تسجيل المخالفة التأديبية'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function approveAction(id) {
    loading.value = true
    error.value = null
    try {
      const response = await disciplinaryActionService.approve(id)
      const updatedAction = response.data?.data || response.data
      const index = actions.value.findIndex((item) => item.id === id)
      if (index !== -1 && updatedAction) {
        actions.value[index] = updatedAction
      }
      if (singleAction.value?.id === id && updatedAction) {
        singleAction.value = updatedAction
      }
      return updatedAction
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل اعتماد الجزاء التأديبي'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cancelAction(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await disciplinaryActionService.cancel(id, payload)
      const updatedAction = response.data?.data || response.data
      const index = actions.value.findIndex((item) => item.id === id)
      if (index !== -1 && updatedAction) {
        actions.value[index] = updatedAction
      }
      if (singleAction.value?.id === id && updatedAction) {
        singleAction.value = updatedAction
      }
      return updatedAction
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إلغاء الجزاء التأديبي'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteAction(id) {
    loading.value = true
    error.value = null
    try {
      await disciplinaryActionService.delete(id)
      if (Array.isArray(actions.value)) {
        actions.value = actions.value.filter((item) => item.id !== id)
      }
      if (pagination.value.total > 0) {
        pagination.value.total -= 1
      }
    } catch (err) {
      error.value =
        err.response?.data?.message ||
        'لا يمكن حذف هذا السجل (قد يكون معتمداً أو مرتبطاً بمسير رواتب)'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    actions,
    singleAction,
    escalationPreview,
    pagination,
    loading,
    previewLoading,
    error,

    fetchActions,
    previewEscalation,
    clearPreview,
    fetchActionById,
    createAction,
    approveAction,
    cancelAction,
    deleteAction,
  }
})
