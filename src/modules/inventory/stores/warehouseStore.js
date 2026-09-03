import { defineStore } from 'pinia'
import { ref } from 'vue'
import warehouseService from '../services/warehouse.service'

export const useWarehouseStore = defineStore('inventoryWarehouse', () => {
  // ==========================
  // 1. State
  // ==========================
  const warehouses = ref([])
  const pagination = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  // جلب قائمة المستودعات
  async function fetchWarehouses(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await warehouseService.get(params)
      if (response.data?.data) {
        warehouses.value = response.data.data
        pagination.value = response.data.meta || response.data.pagination || null
      } else {
        warehouses.value = response.data
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحميل قائمة المستودعات'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  // إنشاء مستودع جديد
  async function createWarehouse(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await warehouseService.create(payload)
      await fetchWarehouses()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إنشاء المستودع'
      throw err
    } finally {
      loading.value = false
    }
  }

  // تحديث بيانات مستودع
  async function updateWarehouse(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await warehouseService.update(id, payload)
      await fetchWarehouses()
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث بيانات المستودع'
      throw err
    } finally {
      loading.value = false
    }
  }

  // حذف مستودع
  async function deleteWarehouse(id) {
    loading.value = true
    error.value = null
    try {
      await warehouseService.delete(id)
      await fetchWarehouses()
    } catch (err) {
      error.value =
        err.response?.data?.message || 'فشل حذف المستودع (قد يحتوي على حركة مخزنية أو مواقع مربوطة)'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    warehouses,
    pagination,
    loading,
    error,
    fetchWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
  }
})
