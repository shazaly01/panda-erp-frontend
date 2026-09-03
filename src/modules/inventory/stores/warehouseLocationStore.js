import { defineStore } from 'pinia'
import { ref } from 'vue'
import warehouseLocationService from '../services/warehouseLocation.service'

export const useWarehouseLocationStore = defineStore('inventoryWarehouseLocation', () => {
  // ==========================
  // 1. State
  // ==========================
  const locations = ref([])
  const pagination = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  // جلب قائمة مواقع المستودعات
  async function fetchLocations(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await warehouseLocationService.get(params)
      if (response.data?.data) {
        locations.value = response.data.data
        pagination.value = response.data.meta || response.data.pagination || null
      } else {
        locations.value = response.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحميل مواقع المستودعات'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // إنشاء موقع جديد داخل مستودع
  async function createLocation(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await warehouseLocationService.create(payload)
      await fetchLocations()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إنشاء موقع المستودع'
      throw err
    } finally {
      loading.value = false
    }
  }

  // تحديث بيانات موقع
  async function updateLocation(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await warehouseLocationService.update(id, payload)
      await fetchLocations()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث موقع المستودع'
      throw err
    } finally {
      loading.value = false
    }
  }

  // حذف موقع مستودع
  async function deleteLocation(id) {
    loading.value = true
    error.value = null
    try {
      await warehouseLocationService.delete(id)
      await fetchLocations()
    } catch (err) {
      error.value =
        err.response?.data?.message || 'فشل حذف موقع المستودع (قد يحتوي على أصناف مرتبطة)'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    locations,
    pagination,
    loading,
    error,
    fetchLocations,
    createLocation,
    updateLocation,
    deleteLocation,
  }
})
