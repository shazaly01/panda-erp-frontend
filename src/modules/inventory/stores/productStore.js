// src/modules/inventory/stores/productStore.js
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

  // لا تُطبّق على القائمة إلا نتيجة آخر طلب جلب بدأ فعلياً.
  let latestProductsRequestId = 0
  let pendingProductsRequestId = null
  let activeActions = 0

  // loading يعكس طلب القائمة الحالي والعمليات الأخرى، لا طلباً قديماً مستبعداً.
  const updateLoading = () => {
    loading.value = pendingProductsRequestId !== null || activeActions > 0
  }

  const beginAction = () => {
    activeActions += 1
    updateLoading()
  }

  const endAction = () => {
    activeActions -= 1
    updateLoading()
  }

  // ==========================
  // 2. Actions
  // ==========================

  // جلب القائمة مع جميع حقولها، بما فيها الغاز وعدد الأسطوانات ونطاق المخزن.
  // ترجع مصفوفة عند نجاح الطلب، حتى لو كانت فارغة، وnull للفشل أو الطلب المستبعد.
  async function fetchProducts(params = {}) {
    const requestId = ++latestProductsRequestId
    pendingProductsRequestId = requestId
    updateLoading()
    error.value = null

    try {
      const response = await productService.get(params)

      // قد يكون المستخدم غيّر المخزن أو الفلتر قبل وصول هذه الاستجابة.
      if (requestId !== latestProductsRequestId) return null

      const payload = response?.data
      const nextProducts = Array.isArray(payload) ? payload : payload?.data

      if (!Array.isArray(nextProducts)) {
        throw new Error('استجابة قائمة الأصناف غير صالحة؛ كان المتوقع مصفوفة أصناف.')
      }

      products.value = nextProducts
      pagination.value = Array.isArray(payload)
        ? null
        : payload?.meta || payload?.pagination || null

      return products.value
    } catch (err) {
      // فشل طلب قديم لا يمحو نتائج الطلب الحالي ولا يعرض خطأ لمخزن سابق.
      if (requestId !== latestProductsRequestId) return null

      products.value = []
      pagination.value = null
      error.value = err.response?.data?.message || 'فشل تحميل قائمة الأصناف'
      console.error(err)
      return null
    } finally {
      // انتهاء طلب قديم لا يوقف مؤشر تحميل الطلب الأحدث.
      if (pendingProductsRequestId === requestId) {
        pendingProductsRequestId = null
        updateLoading()
      }
    }
  }

  // سنستخدمها في نموذج الاستلام عند إزالة المخزن: تبطل طلب القائمة المعلق أيضاً.
  // لا تلغي عمليات إنشاء أو تعديل أو حذف بدأت بالفعل، ولا تمس currentProduct.
  function clearProducts() {
    latestProductsRequestId += 1
    pendingProductsRequestId = null
    products.value = []
    pagination.value = null
    error.value = null
    updateLoading()
  }

  // جلب بيانات صنف منفرد للتعديل أو العرض
  async function fetchProduct(id) {
    beginAction()
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
      endAction()
    }
  }

  // إنشاء صنف جديد
  async function createProduct(payload) {
    beginAction()
    error.value = null
    try {
      const response = await productService.create(payload)
      await fetchProducts()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إنشاء الصنف'
      throw err
    } finally {
      endAction()
    }
  }

  // تحديث بيانات صنف
  async function updateProduct(id, payload) {
    beginAction()
    error.value = null
    try {
      const response = await productService.update(id, payload)
      await fetchProducts()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث الصنف'
      throw err
    } finally {
      endAction()
    }
  }

  // حذف صنف
  async function deleteProduct(id) {
    beginAction()
    error.value = null
    try {
      await productService.delete(id)
      await fetchProducts()
    } catch (err) {
      error.value =
        err.response?.data?.message || 'فشل حذف الصنف (قد يكون مرتبطاً بحركات مخزنية أو فواتير)'
      throw err
    } finally {
      endAction()
    }
  }

  return {
    products,
    currentProduct,
    pagination,
    loading,
    error,
    fetchProducts,
    clearProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  }
})
