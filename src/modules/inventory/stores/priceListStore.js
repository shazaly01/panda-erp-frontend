import { defineStore } from 'pinia'
import { ref } from 'vue'
import priceListService from '../services/priceList.service'

export const usePriceListStore = defineStore('inventoryPriceList', () => {
  // ==========================
  // 1. State
  // ==========================
  const priceLists = ref([])
  const currentPriceList = ref(null)
  const pagination = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  // جلب كافة قوائم الأسعار
  async function fetchPriceLists(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await priceListService.get(params)
      if (response.data?.data) {
        priceLists.value = response.data.data
        pagination.value = response.data.meta || response.data.pagination || null
      } else {
        priceLists.value = response.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحميل قوائم الأسعار'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // جلب تفاصيل قائمة أسعار مفرودة
  async function fetchPriceList(id) {
    loading.value = true
    error.value = null
    try {
      const response = await priceListService.find(id)
      currentPriceList.value = response.data?.data || response.data
      return currentPriceList.value
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل جلب تفاصيل قائمة الأسعار'
      console.error(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // إنشاء قائمة أسعار جديدة
  async function createPriceList(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await priceListService.create(payload)
      await fetchPriceLists()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إنشاء قائمة الأسعار'
      throw err
    } finally {
      loading.value = false
    }
  }

  // تحديث قائمة أسعار
  async function updatePriceList(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await priceListService.update(id, payload)
      await fetchPriceLists()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث قائمة الأسعار'
      throw err
    } finally {
      loading.value = false
    }
  }

  // حذف قائمة أسعار
  async function deletePriceList(id) {
    loading.value = true
    error.value = null
    try {
      await priceListService.delete(id)
      await fetchPriceLists()
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل حذف قائمة الأسعار'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    priceLists,
    currentPriceList,
    pagination,
    loading,
    error,
    fetchPriceLists,
    fetchPriceList,
    createPriceList,
    updatePriceList,
    deletePriceList,
  }
})
