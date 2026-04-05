import { defineStore } from 'pinia'
import { ref } from 'vue'
import payrollInputService from '../services/payrollInput.service'

export const usePayrollInputStore = defineStore('hrPayrollInput', () => {
  // ==========================
  // 1. State
  // ==========================
  const inputs = ref([])
  const singleInput = ref(null)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  })

  const loading = ref(false)
  const error = ref(null)

  // ==========================
  // 2. Actions
  // ==========================

  async function fetchInputs(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await payrollInputService.get(filters)
      inputs.value = response.data.data
      if (response.data.meta) {
        pagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل قائمة المدخلات المالية'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchInputById(id) {
    loading.value = true
    error.value = null
    singleInput.value = null
    try {
      const response = await payrollInputService.find(id)
      singleInput.value = response.data.data
      return singleInput.value
    } catch (err) {
      error.value = 'فشل جلب تفاصيل الحركة المالية'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createInput(payload) {
    loading.value = true
    error.value = null
    try {
      await payrollInputService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تسجيل الحركة المالية'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateInput(id, payload) {
    loading.value = true
    error.value = null
    try {
      await payrollInputService.update(id, payload)
    } catch (err) {
      // إظهار رسالة واضحة في حال كانت الحركة مرحلة (is_processed = true)
      error.value =
        err.response?.data?.message ||
        'لا يمكن التعديل: الحركة المالية معتمدة ومرحلة في مسير الرواتب'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteInput(id) {
    loading.value = true
    error.value = null
    try {
      await payrollInputService.delete(id)
      inputs.value = inputs.value.filter((input) => input.id !== id)
      pagination.value.total -= 1
    } catch (err) {
      error.value =
        err.response?.data?.message || 'لا يمكن الحذف: الحركة المالية معتمدة ومرحلة في مسير الرواتب'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    inputs,
    singleInput,
    pagination,
    loading,
    error,

    fetchInputs,
    fetchInputById,
    createInput,
    updateInput,
    deleteInput,
  }
})
