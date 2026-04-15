//src\modules\hr\stores\contractStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import contractService from '../services/contract.service'

export const useContractStore = defineStore('hrContract', () => {
  // ==========================
  // 1. State
  // ==========================
  const contracts = ref([])
  const singleContract = ref(null)
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

  async function fetchContracts(filters = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await contractService.get(filters)
      // شبكة الأمان للتعامل مع البيانات القادمة
      const incomingData = response.data?.data || response.data || []
      contracts.value = Array.isArray(incomingData) ? incomingData : []

      if (response.data?.meta) {
        pagination.value = response.data.meta
      }
    } catch (err) {
      error.value = 'فشل تحميل قائمة العقود'
      contracts.value = []
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchContractById(id) {
    loading.value = true
    error.value = null
    singleContract.value = null
    try {
      const response = await contractService.find(id)
      singleContract.value = response.data?.data || response.data
      return singleContract.value
    } catch (err) {
      error.value = 'فشل جلب تفاصيل العقد'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createContract(payload) {
    loading.value = true
    error.value = null
    try {
      await contractService.create(payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إنشاء العقد الجديد'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateContract(id, payload) {
    loading.value = true
    error.value = null
    try {
      await contractService.update(id, payload)
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل تحديث العقد'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function terminateContract(id) {
    loading.value = true
    error.value = null
    try {
      const response = await contractService.terminate(id)
      // تحديث حالة العقد محلياً دون الحاجة لجلب القائمة من جديد
      const updatedContract = response.data?.data || response.data
      const index = contracts.value.findIndex((c) => c.id === id)
      if (index !== -1) {
        contracts.value[index] = updatedContract
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'فشل إنهاء العقد'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteContract(id) {
    loading.value = true
    error.value = null
    try {
      await contractService.delete(id)
      if (Array.isArray(contracts.value)) {
        contracts.value = contracts.value.filter((contract) => contract.id !== id)
      }
      if (pagination.value.total > 0) {
        pagination.value.total -= 1
      }
    } catch (err) {
      error.value =
        err.response?.data?.message ||
        'لا يمكن حذف العقد (قد يكون نشطاً أو مرتبطاً بمسيرات رواتب سابقة)'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    contracts,
    singleContract,
    pagination,
    loading,
    error,

    fetchContracts,
    fetchContractById,
    createContract,
    updateContract,
    terminateContract,
    deleteContract,
  }
})
