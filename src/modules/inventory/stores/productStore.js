//src\modules\inventory\stores\productStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import productService from '../services/product.service'

export const useProductStore = defineStore('inventoryProduct', () => {
  // ==========================
  // 1. State
  // ==========================
  const products = ref([])
  const currentProduct = ref(null)
  const pagination = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  // جلب قائمة الأصناف والمنتجات
  async function fetchProducts(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await productService.get(params)
      if (response.data?.data) {
        products.value = response.data.data
        pagination.value = response.data.meta || response.data.pagination || null
      } else {
        products.value = response.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحميل قائمة الأصناف'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // جلب بيانات صنف منفرد للتعديل أو العرض
  async function fetchProduct(id) {
    loading.value = true
    error.value = null
    try {
      const response = await productService.find(id)
      currentProduct.value = response.data?.data || response.data
      return currentProduct.value
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل جلب تفاصيل الصنف'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // إنشاء صنف جديد
  async function createProduct(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await productService.create(payload)
      await fetchProducts()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إنشاء الصنف'
      throw err
    } finally {
      loading.value = false
    }
  }

  // تحديث بيانات صنف
  async function updateProduct(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await productService.update(id, payload)
      await fetchProducts()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث الصنف'
      throw err
    } finally {
      loading.value = false
    }
  }

  // حذف صنف
  async function deleteProduct(id) {
    loading.value = true
    error.value = null
    try {
      await productService.delete(id)
      await fetchProducts()
    } catch (err) {
      error.value =
        err.response?.data?.message || 'فشل حذف الصنف (قد يكون مرتبطاً بحركات مخزنية أو فواتير)'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    currentProduct,
    pagination,
    loading,
    error,
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  }
})
