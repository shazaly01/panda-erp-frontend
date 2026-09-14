//src\modules\sales\stores\customerStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import customerService from '../services/customer.service'

export const useCustomerStore = defineStore('salesCustomer', () => {
  // ==========================
  // 1. State
  // ==========================
  const customers = ref([])
  const selectorCustomers = ref([])
  const pagination = ref(null)
  const currentCustomer = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const validationErrors = ref(null)
  const isSelectorLoaded = ref(false)

  // ==========================
  // 2. Helpers
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
  // 3. Actions
  // ==========================

  /**
   * جلب قائمة العملاء السريعة للقوائم المنسدلة مع التخزين المؤقت في الذاكرة
   * @param {boolean} force - فرض إعادة التحميل وتخطي الكاش
   */
  async function fetchCustomersSelector(force = false) {
    if (isSelectorLoaded.value && !force && selectorCustomers.value.length > 0) {
      return selectorCustomers.value
    }

    loading.value = true
    error.value = null

    try {
      const response = await customerService.getSelector()
      selectorCustomers.value = response.data.data || []
      isSelectorLoaded.value = true
      return selectorCustomers.value
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب قائمة العملاء.'
      selectorCustomers.value = []
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب قائمة العملاء لشاشات الجداول والبحث مع الترقيم والفلترة
   */
  async function fetchCustomers(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)

    try {
      const response = await customerService.get({ page, ...cleaned })
      customers.value = response.data.data || []
      pagination.value = response.data.meta || null
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب قائمة العملاء.'
      customers.value = []
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب تفاصيل عميل محدد
   */
  async function fetchCustomer(id) {
    loading.value = true
    error.value = null
    currentCustomer.value = null

    try {
      const response = await customerService.find(id)
      currentCustomer.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب بيانات العميل.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * إنشاء عميل جديد
   */
  async function createCustomer(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await customerService.create(payload)
      currentCustomer.value = response.data.data || null
      // إبطال كاش القوائم المنسدلة لضمان ظهور العميل الجديد فوراً
      isSelectorLoaded.value = false
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إضافة العميل.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * تحديث بيانات عميل موجود
   */
  async function updateCustomer(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await customerService.update(id, payload)
      currentCustomer.value = response.data.data || null
      // إبطال كاش القوائم المنسدلة لضمان تحديث الأسماء والبيانات المحاسبية
      isSelectorLoaded.value = false
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث بيانات العميل.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * حذف عميل
   */
  async function deleteCustomer(id) {
    loading.value = true
    error.value = null

    try {
      const response = await customerService.delete(id)
      if (currentCustomer.value?.id === id) {
        currentCustomer.value = null
      }
      // إزالة العميل مباشرة من القائمة السريعة
      selectorCustomers.value = selectorCustomers.value.filter((c) => c.id !== id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف العميل.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * استرجاع كائن عميل محدد من الذاكرة المحلية للاستفادة من بياناته التشغيلية والمالية
   */
  function getCustomerById(id) {
    return selectorCustomers.value.find((c) => c.id === Number(id)) || null
  }

  function resetCurrentCustomer() {
    currentCustomer.value = null
  }

  function resetStore() {
    customers.value = []
    selectorCustomers.value = []
    pagination.value = null
    currentCustomer.value = null
    isSelectorLoaded.value = false
    error.value = null
    validationErrors.value = null
  }

  return {
    customers,
    selectorCustomers,
    pagination,
    currentCustomer,
    loading,
    error,
    validationErrors,
    isSelectorLoaded,
    fetchCustomersSelector,
    fetchCustomers,
    fetchCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    resetCurrentCustomer,
    resetStore,
  }
})
