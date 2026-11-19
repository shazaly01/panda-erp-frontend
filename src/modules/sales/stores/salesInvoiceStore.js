// src/modules/sales/stores/salesInvoiceStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import salesInvoiceService from '../services/salesInvoice.service'

export const useSalesInvoiceStore = defineStore('salesInvoice', () => {
  // ==========================
  // 1. State
  // ==========================
  const invoices = ref([])
  const pagination = ref(null)
  const currentInvoice = ref(null)
  const publicInvoice = ref(null)
  const loading = ref(false)
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

  function syncInvoiceInList(updatedInvoice) {
    if (!updatedInvoice?.id) return
    const index = invoices.value.findIndex((inv) => inv.id === updatedInvoice.id)
    if (index !== -1) {
      invoices.value[index] = updatedInvoice
    }
  }

  // ==========================
  // 3. Actions
  // ==========================

  /**
   * جلب قائمة فواتير المبيعات مع الفلترة والترقيم
   */
  async function fetchInvoices(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)

    try {
      const response = await salesInvoiceService.get({ page, ...cleaned })
      invoices.value = response.data.data || []
      pagination.value = response.data.meta || null
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب قائمة فواتير المبيعات.'
      invoices.value = []
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب تفاصيل فاتورة مبيعات محددة
   */
  async function fetchInvoice(id) {
    loading.value = true
    error.value = null
    currentInvoice.value = null

    try {
      const response = await salesInvoiceService.find(id)
      currentInvoice.value = response.data.data || null
      return currentInvoice.value
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب بيانات الفاتورة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب بيانات الفاتورة العامة عبر UUID للمشاركة والطباعة
   */
  async function fetchPublicInvoice(uuid) {
    loading.value = true
    error.value = null
    publicInvoice.value = null

    try {
      const response = await salesInvoiceService.findPublic(uuid)
      publicInvoice.value = response.data.data || null
      return publicInvoice.value
    } catch (err) {
      error.value = err.response?.data?.message || 'تعذر العثور على الفاتورة المطلوبة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * إنشاء فاتورة مبيعات قياسية
   */
  async function createInvoice(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await salesInvoiceService.create(payload)
      const created = response.data.data || null
      currentInvoice.value = created
      if (created && invoices.value.length > 0) {
        invoices.value.unshift(created)
      }
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إنشاء فاتورة المبيعات.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * إتمام عملية بيع الكاشير السريعة (حفظ + تأكيد + ترحيل فوري في خطوة واحدة)
   */
  async function posCheckout(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await salesInvoiceService.posCheckout(payload)
      const created = response.data.data || null
      currentInvoice.value = created
      if (created && invoices.value.length > 0) {
        invoices.value.unshift(created)
      }
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إتمام عملية البيع والترحيل.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * تعديل فاتورة مبيعات (مسودة أو مرحلة)
   */
  async function updateInvoice(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await salesInvoiceService.update(id, payload)
      const updated = response.data.data || null
      currentInvoice.value = updated
      syncInvoiceInList(updated)
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث فاتورة المبيعات.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * حذف فاتورة مبيعات
   */
  async function deleteInvoice(id) {
    loading.value = true
    error.value = null

    try {
      const response = await salesInvoiceService.delete(id)
      if (currentInvoice.value?.id === Number(id)) {
        currentInvoice.value = null
      }
      invoices.value = invoices.value.filter((inv) => inv.id !== Number(id))
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف فاتورة المبيعات.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * تأكيد واعتماد فاتورة مسودة
   */
  async function confirmInvoice(id) {
    loading.value = true
    error.value = null

    try {
      const response = await salesInvoiceService.confirm(id)
      const updated = response.data.data || null
      if (currentInvoice.value?.id === Number(id)) {
        currentInvoice.value = updated
      }
      syncInvoiceInList(updated)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في تأكيد الفاتورة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * ترحيل الفاتورة مخزنياً ومحاسبياً
   */
  async function postInvoice(id) {
    loading.value = true
    error.value = null

    try {
      const response = await salesInvoiceService.post(id)
      const updated = response.data.data || null
      if (currentInvoice.value?.id === Number(id)) {
        currentInvoice.value = updated
      }
      syncInvoiceInList(updated)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في ترحيل الفاتورة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * إلغاء الفاتورة وعكس أثرها المخزني والمحاسبي
   */
  async function cancelInvoice(id) {
    loading.value = true
    error.value = null

    try {
      const response = await salesInvoiceService.cancel(id)
      const updated = response.data.data || null
      if (currentInvoice.value?.id === Number(id)) {
        currentInvoice.value = updated
      }
      syncInvoiceInList(updated)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في إلغاء الفاتورة.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearValidationErrors() {
    validationErrors.value = null
    error.value = null
  }

  function resetCurrentInvoice() {
    currentInvoice.value = null
  }

  function resetStore() {
    invoices.value = []
    pagination.value = null
    currentInvoice.value = null
    publicInvoice.value = null
    loading.value = false
    error.value = null
    validationErrors.value = null
  }

  return {
    invoices,
    pagination,
    currentInvoice,
    publicInvoice,
    loading,
    error,
    validationErrors,
    fetchInvoices,
    fetchInvoice,
    fetchPublicInvoice,
    createInvoice,
    posCheckout,
    updateInvoice,
    deleteInvoice,
    confirmInvoice,
    postInvoice,
    cancelInvoice,
    clearValidationErrors,
    resetCurrentInvoice,
    resetStore,
  }
})
