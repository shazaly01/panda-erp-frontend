// src/modules/purchasing/stores/purchaseOrderStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import purchaseOrderService from '../services/purchaseOrder.service'

export const usePurchaseOrderStore = defineStore('purchasingOrder', () => {
  // ==========================
  // 1. State (الحالة)
  // ==========================
  const orders = ref([])
  const pagination = ref(null)
  const currentOrder = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const validationErrors = ref(null)

  // ==========================
  // 2. Helpers (الدوال المساعدة)
  // ==========================
  function cleanFilters(filters) {
    return Object.keys(filters).reduce((acc, key) => {
      if (filters[key] !== null && filters[key] !== '') {
        acc[key] = filters[key]
      }
      return acc
    }, {})
  }

  // ==========================
  // 3. Actions (العمليات)
  // ==========================

  async function fetchOrders(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)

    try {
      const response = await purchaseOrderService.get({ page, ...cleaned })
      orders.value = response.data.data || []
      pagination.value = response.data.meta || null
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب قائمة أوامر الشراء.'
      orders.value = []
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchOrder(id) {
    loading.value = true
    error.value = null
    currentOrder.value = null

    try {
      const response = await purchaseOrderService.find(id)
      currentOrder.value = response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب بيانات أمر الشراء.'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function createOrder(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await purchaseOrderService.create(payload)
      currentOrder.value = response.data.data || null
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إنشاء أمر الشراء.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateOrder(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await purchaseOrderService.update(id, payload)
      currentOrder.value = response.data.data || null
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث أمر الشراء.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function confirmOrder(id) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await purchaseOrderService.confirm(id)
      currentOrder.value = response.data.data || null
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في اعتماد وتأكيد أمر الشراء.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cancelOrder(id) {
    loading.value = true
    error.value = null

    try {
      const response = await purchaseOrderService.cancel(id)
      currentOrder.value = response.data.data || null
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إلغاء أمر الشراء.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteOrder(id) {
    loading.value = true
    error.value = null

    try {
      const response = await purchaseOrderService.delete(id)
      if (currentOrder.value?.id === id) {
        currentOrder.value = null
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف أمر الشراء.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function resetCurrentOrder() {
    currentOrder.value = null
  }

  return {
    orders,
    pagination,
    currentOrder,
    loading,
    error,
    validationErrors,
    fetchOrders,
    fetchOrder,
    createOrder,
    updateOrder,
    confirmOrder,
    cancelOrder,
    deleteOrder,
    resetCurrentOrder,
  }
})
