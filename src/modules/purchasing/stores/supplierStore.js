//src\modules\purchasing\stores\supplierStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import supplierService from '../services/supplier.service'

export const useSupplierStore = defineStore('purchasingSupplier', () => {
  // ==========================
  // 1. State
  // ==========================
  const suppliers = ref([])
  const selectorSuppliers = ref([])
  const pagination = ref(null)
  const currentSupplier = ref(null)
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
   * جلب قائمة الموردين السريعة للقوائم المنسدلة مع التخزين المؤقت في الذاكرة
   * @param {boolean} force - فرض إعادة التحميل وتخطي الكاش
   */
  async function fetchSuppliersSelector(force = false) {
    if (isSelectorLoaded.value && !force && selectorSuppliers.value.length > 0) {
      return selectorSuppliers.value
    }

    loading.value = true
    error.value = null

    try {
      const response = await supplierService.getSelector()
      selectorSuppliers.value = response.data.data || []
      isSelectorLoaded.value = true
      return selectorSuppliers.value
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب قائمة الموردين.'
      selectorSuppliers.value = []
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب قائمة الموردين لشاشات الجداول والبحث مع الترقيم والفلترة
   */
  async function fetchSuppliers(page = 1, filters = {}) {
    loading.value = true
    error.value = null
    const cleaned = cleanFilters(filters)

    try {
      const response = await supplierService.get({ page, ...cleaned })
      suppliers.value = response.data.data || []
      pagination.value = response.data.meta || null
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب قائمة الموردين.'
      suppliers.value = []
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * جلب تفاصيل مورد محدد
   */
  async function fetchSupplier(id) {
    loading.value = true
    error.value = null
    currentSupplier.value = null

    try {
      const response = await supplierService.find(id)
      currentSupplier.value = response.data.data
      return response.data.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في جلب بيانات المورد.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * إنشاء مورد جديد
   */
  async function createSupplier(payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await supplierService.create(payload)
      currentSupplier.value = response.data.data || null
      // إبطال كاش القوائم المنسدلة لضمان ظهور المورد الجديد فوراً
      isSelectorLoaded.value = false
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في إضافة المورد.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * تحديث بيانات مورد موجود
   */
  async function updateSupplier(id, payload) {
    loading.value = true
    error.value = null
    validationErrors.value = null

    try {
      const response = await supplierService.update(id, payload)
      currentSupplier.value = response.data.data || null
      // إبطال كاش القوائم المنسدلة لضمان تحديث الأسماء والبيانات المحاسبية
      isSelectorLoaded.value = false
      return response.data
    } catch (err) {
      if (err.response?.status === 422) {
        validationErrors.value = err.response.data.errors
      }
      error.value = err.response?.data?.message || 'فشل في تحديث بيانات المورد.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * حذف مورد
   */
  async function deleteSupplier(id) {
    loading.value = true
    error.value = null

    try {
      const response = await supplierService.delete(id)
      if (currentSupplier.value?.id === id) {
        currentSupplier.value = null
      }
      // إزالة المورد مباشرة من القائمة السريعة
      selectorSuppliers.value = selectorSuppliers.value.filter((s) => s.id !== id)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل في حذف المورد.'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * استرجاع كائن مورد محدد من الذاكرة المحلية للاستفادة من بياناته التشغيلية والمالية
   */
  function getSupplierById(id) {
    return selectorSuppliers.value.find((s) => s.id === Number(id)) || null
  }

  function resetCurrentSupplier() {
    currentSupplier.value = null
  }

  function resetStore() {
    suppliers.value = []
    selectorSuppliers.value = []
    pagination.value = null
    currentSupplier.value = null
    isSelectorLoaded.value = false
    error.value = null
    validationErrors.value = null
  }

  return {
    suppliers,
    selectorSuppliers,
    pagination,
    currentSupplier,
    loading,
    error,
    validationErrors,
    isSelectorLoaded,
    fetchSuppliersSelector,
    fetchSuppliers,
    fetchSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
    resetCurrentSupplier,
    resetStore,
  }
})
